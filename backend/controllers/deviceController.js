const Device = require('../models/Device');

// @desc    Get all devices
// @route   GET /api/device
// @access  Private
const getDevices = async (req, res) => {
    try {
        const devices = await Device.find({}).sort({ last_seen: -1 });
        res.json(devices);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update device name
// @route   PUT /api/device/:id
// @access  Private
const updateDeviceName = async (req, res) => {
    const { name } = req.body;
    const { id } = req.params; // device_id

    try {
        const device = await Device.findOneAndUpdate(
            { device_id: id },
            { name },
            { new: true }
        );

        if (device) {
            res.json(device);
        } else {
            res.status(404).json({ message: 'Device not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getDevices, updateDeviceName };
