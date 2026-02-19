const express = require('express');
const router = express.Router();
const { authUser, registerUser, createUser, getUsers, deleteUser, updateUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', authUser);
router.post('/register', registerUser); // Typically protected or disabled
router.post('/users', protect, admin, createUser);
router.get('/users', protect, admin, getUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.put('/users/:id', protect, admin, updateUser);

module.exports = router;
