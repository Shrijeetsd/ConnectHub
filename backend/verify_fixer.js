const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const username = 'fixer';
        const passwordToTest = 'fixer123';

        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log('User found:', user.username);
        console.log('Stored Hash:', user.password);

        const isMatch = await user.matchPassword(passwordToTest);
        console.log('bcrypt.compare result:', isMatch);

        if (!isMatch) {
            console.log('Password does NOT match. Resetting now...');
            user.password = passwordToTest;
            await user.save();
            console.log('Password has been RESET using .save() to ensure hashing.');
            
            const newVerify = await user.matchPassword(passwordToTest);
            console.log('New verify result:', newVerify);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verify();
