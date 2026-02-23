const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    createUser,
    getUsers,
    deleteUser,
    updateUser,
    login2FA,
    setup2FA,
    verifySetup2FA,
    disable2FA,
    getMe
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/me', protect, getMe);
router.post('/login', authUser);
router.post('/verify-2fa', login2FA);
router.post('/register', registerUser);
router.post('/users', protect, admin, createUser);
router.get('/users', protect, admin, getUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.put('/users/:id', protect, admin, updateUser);

router.post('/setup-2fa', protect, setup2FA);
router.post('/verify-setup-2fa', protect, verifySetup2FA);
router.post('/disable-2fa', protect, disable2FA);

module.exports = router;
