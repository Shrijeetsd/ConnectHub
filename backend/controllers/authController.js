const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`[AUTH] Login attempt for: '${username}'`);

        const user = await User.findOne({ username });

        if (user) {
            console.log(`[AUTH] User found: '${user.username}', Role: ${user.role}`);
            const isMatch = await user.matchPassword(password);
            console.log(`[AUTH] Password match: ${isMatch}`);

            if (isMatch) {
                res.json({
                    _id: user._id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    token: generateToken(user._id),
                });
                return;
            }
        } else {
            console.log(`[AUTH] User not found: '${username}'`);
        }

        res.status(401).json({ message: 'Invalid username or password' });
    } catch (error) {
        console.error('Auth Error:', error.message);
        res.status(500).json({
            message: 'Authentication service unavailable',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Register a new user (For initial setup/admin)
// @route   POST /api/auth/register
// @access  Public (Should be protected or disabled in production)
const registerUser = async (req, res) => {
    const { username, password, secret } = req.body;

    // Check for registration secret
    if (secret !== process.env.REGISTRATION_SECRET && secret !== 'admin_secret_123') { // Fallback for dev
        return res.status(403).json({ message: 'Forbidden: Invalid registration secret' });
    }

    const userExists = await User.findOne({ username });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        username,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Create a new user (Admin only)
// @route   POST /api/auth/users
// @access  Private/Admin
const createUser = async (req, res) => {
    try {
        const { username, password, name, email, phoneNumber } = req.body;

        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            password,
            name,
            email,
            phoneNumber,
            role: 'user'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Create User Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) {
        console.error('Get Users Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        console.log(`[DELETE USER] Request to delete user with ID: ${req.params.id}`);
        const user = await User.findById(req.params.id);

        if (user) {
            console.log(`[DELETE USER] User found: ${user.username}, Role: ${user.role}`);

            if (user.role === 'admin') {
                console.log('[DELETE USER] Attempted to delete admin user, blocked.');
                return res.status(400).json({ message: 'Cannot delete admin user' });
            }

            await User.findByIdAndDelete(req.params.id);
            console.log(`[DELETE USER] User ${user.username} deleted successfully.`);
            res.json({ message: 'User removed' });
        } else {
            console.log('[DELETE USER] User not found.');
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.username = req.body.username || user.username;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update User Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { authUser, registerUser, createUser, getUsers, deleteUser, updateUser };
