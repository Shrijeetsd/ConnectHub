const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ username: 'admin' });
        if (user) {
            // Manually hash 'admin123' to see if it matches what is in DB
            const isMatch = await bcrypt.compare('admin123', user.password);
            console.log('---VERIFY_START---');
            console.log(JSON.stringify({
                username: user.username,
                passwordMatchesAdmin123: isMatch,
                storedHash: user.password,
                role: user.role
            }, null, 2));

            // Allow manual verification by creating a fresh hash of 'admin123'
            const salt = await bcrypt.genSalt(10);
            const freshHash = await bcrypt.hash('admin123', salt);
            console.log('Fresh Hash of admin123:', freshHash);

            console.log('---VERIFY_END---');
        } else {
            console.log('Admin user not found');
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};

run();
