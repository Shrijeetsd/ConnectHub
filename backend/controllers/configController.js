const Config = require('../models/Config');

// @desc    Get system configuration (e.g. Website URL)
// @route   GET /api/config/:key
// @access  Private
const getConfig = async (req, res) => {
    const { key } = req.params;
    const config = await Config.findOne({ key });

    if (config) {
        res.json({ value: config.value });
    } else {
        res.status(404).json({ message: 'Config not found' });
    }
};

// @desc    Update system configuration
// @route   PUT /api/config
// @access  Private (Admin)
const updateConfig = async (req, res) => {
    const { key, value } = req.body;

    const config = await Config.findOneAndUpdate(
        { key },
        { value },
        { new: true, upsert: true } // Create if not exists
    );

    res.json(config);
};

module.exports = { getConfig, updateConfig };
