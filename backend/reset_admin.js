const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // ACTUAL MODEL WITH HOOKS
const connectDB = require('./config/db');

dotenv.config();

const resetPassword = async () => {
    try {
        await connectDB();

        let user = await User.findOne({ username: 'admin' });
        if (user) {
            user.password = 'password123';
            await user.save();
            console.log('Admin password hashed and updated');
        } else {
            await User.create({
                username: 'admin',
                password: 'password123',
                role: 'admin'
            });
            console.log('Admin user created and password hashed');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetPassword();
