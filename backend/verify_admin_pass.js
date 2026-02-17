const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ username: 'admin' });
        if (user) {
            const isMatch = await bcrypt.compare('admin123', user.password);
            console.log('---VERIFY_START---');
            console.log(JSON.stringify({
                username: user.username,
                passwordMatchesAdmin123: isMatch,
                hash: user.password.substring(0, 10) + '...'
            }));
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
