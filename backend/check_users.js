const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const checkUsers = async () => {
    try {
        await connectDB();
        const users = await User.find({}, '-password'); // Don't show hashed password
        console.log('--- Current Users ---');
        console.log(JSON.stringify(users, null, 2));
        console.log('--- End ---');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
