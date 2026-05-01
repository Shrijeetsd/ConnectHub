const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token (Step 1)
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`[AUTH] Login attempt for: '${username}' (Password Length: ${password ? password.length : 0})`);

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });

        if (user) {
            const isMatch = await user.matchPassword(password);
            if (isMatch) {
                // Check if 2FA is enabled
                if (user.twoFactorEnabled) {
                    return res.json({
                        mfaRequired: true,
                        userId: user._id,
                        username: user.username
                    });
                }

                const token = generateToken(user._id);
                console.log(`[AUTH] SUCCESS for user: '${username}'`);
                return res.json({
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                    token: token,
                });
            } else {
                console.log(`[AUTH] FAILED: Password mismatch for user: '${username}'`);
            }
        } else {
            console.log(`[AUTH] FAILED: User not found: '${username}'`);
        }

        return res.status(401).json({ message: 'Invalid username or password' });
    } catch (error) {
        console.error('[AUTH ERROR]:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// @desc    Verify 2FA Token for Login (Step 2)
// @route   POST /api/auth/verify-2fa
// @access  Public
const login2FA = async (req, res) => {
    try {
        const { userId, token: mfaToken } = req.body;

        const user = await User.findById(userId);
        if (!user || !user.twoFactorEnabled) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        const isValid = authenticator.verify({
            token: mfaToken,
            secret: user.twoFactorSecret
        });

        if (isValid) {
            const token = generateToken(user._id);
            return res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                token: token,
            });
        } else {
            return res.status(401).json({ message: 'Invalid 2FA code' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Setup 2FA (Get QR Code)
// @route   POST /api/auth/setup-2fa
// @access  Private
const setup2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.username, 'ConnectHub', secret);
        const qrCodeUrl = await qrcode.toDataURL(otpauth);

        user.twoFactorSecret = secret;
        await user.save();

        res.json({ qrCodeUrl, secret });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify & Enable 2FA
// @route   POST /api/auth/verify-setup-2fa
// @access  Private
const verifySetup2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user._id);

        const isValid = authenticator.verify({
            token,
            secret: user.twoFactorSecret
        });

        if (isValid) {
            user.twoFactorEnabled = true;
            await user.save();
            res.json({ message: '2FA enabled successfully' });
        } else {
            res.status(400).json({ message: 'Invalid token' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Disable 2FA
// @route   POST /api/auth/disable-2fa
// @access  Private
const disable2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.twoFactorEnabled = false;
        user.twoFactorSecret = null;
        await user.save();
        res.json({ message: '2FA disabled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
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

module.exports = { authUser, registerUser, createUser, getUsers, deleteUser, updateUser, login2FA, setup2FA, verifySetup2FA, disable2FA, getMe };
