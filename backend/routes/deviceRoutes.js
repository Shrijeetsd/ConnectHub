const express = require('express');
const router = express.Router();
const Config = require('../models/Config');
const Device = require('../models/Device');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all devices
// @route   GET /api/device
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const devices = await Device.find({}).sort({ last_seen: -1 });
        res.json(devices);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update device friendly name
// @route   PUT /api/device/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const { name } = req.body;
    // req.params.id is the device_id string (e.g. "a499...")

    try {
        const device = await Device.findOneAndUpdate(
            { device_id: req.params.id },
            { name },
            { new: true }
        );
        if (device) {
            res.json(device);
        } else {
            res.status(404).json({ message: 'Device not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get device specific config (Mapped to global WEBSITE_URL for now)
// @route   GET /api/device/config
// @access  Private
router.get('/config', protect, async (req, res) => {
    // In a real app, this might fetch config specific to req.user (device)
    // For now, return the global website URL
    const config = await Config.findOne({ key: 'WEBSITE_URL' });

    if (config && config.value) {
        res.json({ target_url: config.value });
    } else {
        // Fallback to the current server URL + /api/sms/upload
        const protocol = req.protocol;
        const host = req.get('host');
        const defaultUrl = `${protocol}://${host}/api/sms/upload`;
        res.json({ target_url: defaultUrl });
    }
});

// @desc    Device Heartbeat
// @route   PUT /api/device/heartbeat/:id
// @access  Private
router.put('/heartbeat/:id', protect, async (req, res) => {
    try {
        await Device.findOneAndUpdate(
            { device_id: req.params.id },
            {
                $set: {
                    last_seen: new Date(),
                    is_online: true
                }
            }
        );
        res.json({ status: 'ok' });
    } catch (err) {
        console.error("Heartbeat error:", err);
        res.status(500).json({ message: 'Error updating heartbeat' });
    }
});

/**
 * @desc    Update device status (specific requirement for mobile auto-sync)
 * @route   POST /api/device/update-status
 * @access  Private
 */
router.post('/update-status', protect, async (req, res) => {
    const { device_id, model, status } = req.body;

    if (!device_id) {
        return res.status(400).json({ message: 'Device ID is required' });
    }

    try {
        // Find or Create device
        const device = await Device.findOneAndUpdate(
            { device_id },
            {
                $set: {
                    model: model || 'Unknown Android',
                    is_online: status === 'online',
                    last_seen: new Date()
                }
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, device });
    } catch (err) {
        console.error("Update status error:", err);
        res.status(500).json({ message: 'Error updating device status' });
    }
});

module.exports = router;
