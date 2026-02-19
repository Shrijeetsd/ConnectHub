const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
    device_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    model: {
        type: String,
        default: 'Unknown Device'
    },
    android_version: {
        type: String
    },
    socket_id: {
        type: String
    },
    is_online: {
        type: Boolean,
        default: false
    },
    last_seen: {
        type: Date,
        default: Date.now
    },
    name: { // User editable friendly name
        type: String
    },
    sync_requested: { // Admin can request device to re-sync old messages
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Device', DeviceSchema);
