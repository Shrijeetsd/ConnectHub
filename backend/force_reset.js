const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sms_receiver')
    .then(async () => {
        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.findOneAndUpdate(
            { username: 'admin' },
            { password: hashedPassword },
            { upsert: true }
        );

        console.log('Admin password reset to: password123');
        console.log('Hash:', hashedPassword);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
