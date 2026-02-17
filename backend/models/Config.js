const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: String,
        required: true
    },
    description: String
});

module.exports = mongoose.model('Config', ConfigSchema);
