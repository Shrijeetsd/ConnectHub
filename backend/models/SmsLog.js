const mongoose = require('mongoose');

const SmsLogSchema = new mongoose.Schema({
    device_id: {
        type: String,
        required: true,
        index: true
    },
    sender: {
        type: String,
        required: true
    },
    message_body: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    sim_info: {
        type: String, // Can store "SIM 1", "SIM 2" or carrier name
        required: true
    },
    device_model: {
        type: String
    },
    android_version: {
        type: String
    },
    received_at: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('SmsLog', SmsLogSchema);
