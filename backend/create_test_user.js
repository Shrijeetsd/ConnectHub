const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const username = 'fixer';
        const password = 'access123';

        // Delete if exists
        await User.findOneAndDelete({ username });

        // Create new
        const user = await User.create({
            username,
            password,
            role: 'user',
            name: 'Fixer User'
        });

        if (user) {
            console.log('SUCCESS: Mobile Test User Created');
            console.log('Username: fixer');
            console.log('Password: access123');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createTestUser();
