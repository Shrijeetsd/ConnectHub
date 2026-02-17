const express = require('express');
const router = express.Router();
const { createSmsLog, getSmsLogs, clearSmsLogs } = require('../controllers/smsController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createSmsLog)
    .get(protect, getSmsLogs);

router.delete('/:deviceId', protect, clearSmsLogs);

// Add alias for /upload as requested
router.post('/upload', protect, createSmsLog);

module.exports = router;
