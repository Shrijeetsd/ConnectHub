const express = require('express');
const router = express.Router();
const { createSmsLog, getSmsLogs, clearSmsLogs, syncOldSms } = require('../controllers/smsController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createSmsLog)
    .get(protect, getSmsLogs);

router.delete('/:deviceId', protect, clearSmsLogs);

// Alias for single upload from background task
router.post('/upload', protect, createSmsLog);

// Bulk old SMS sync — accepts array of up to 50 messages
router.post('/sync-old', protect, syncOldSms);

module.exports = router;
