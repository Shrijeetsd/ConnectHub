const express = require('express');
const router = express.Router();
const { getConfig, updateConfig } = require('../controllers/configController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:key')
    .get(protect, getConfig);

router.route('/')
    .put(protect, updateConfig);

module.exports = router;
