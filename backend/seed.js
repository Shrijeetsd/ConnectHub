const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seedUser = async () => {
    try {
        await connectDB();

        // Check if admin exists
        const userExists = await User.findOne({ username: 'admin' });
        if (userExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        // Create admin with plain text password (middleware hashes it)
        const user = await User.create({
            username: 'admin',
            password: 'password123'
        });

        console.log('Admin user created successfully');
        console.log('Username: admin');
        console.log('Password: password123');
        process.exit();
    } catch (error) {
        console.error('Error seeding user:', error);
        process.exit(1);
    }
};

seedUser();
