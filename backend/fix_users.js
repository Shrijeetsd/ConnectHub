const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const fixUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Ensure 't1' user exists with reliable password
        await User.findOneAndDelete({ username: { $regex: /^t1$/i } });
        await User.create({
            username: 't1',
            password: 't1',
            role: 'user',
            name: 'T1 User'
        });
        console.log('SUCCESS: User "t1" reset to password "t1"');

        // 2. Ensure 'admin' user exists with reliable password
        await User.findOneAndDelete({ username: { $regex: /^admin$/i } });
        await User.create({
            username: 'admin',
            password: 'admin',
            role: 'admin',
            name: 'System Admin'
        });
        console.log('SUCCESS: User "admin" reset to password "admin"');

        // 3. Create a fallback 'user' account
        await User.findOneAndDelete({ username: { $regex: /^user$/i } });
        await User.create({
            username: 'user',
            password: 'user',
            role: 'user',
            name: 'General User'
        });
        console.log('SUCCESS: User "user" reset to password "user"');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixUsers();
