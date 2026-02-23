const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sms_receiver')
    .then(async () => {
        let user = await User.findOne({ username: 'admin' });
        if (!user) {
            user = new User({ username: 'admin', role: 'admin' });
        }
        user.password = 'password123';
        user.role = 'admin'; // Ensure role is admin
        await user.save();

        console.log('Admin user updated/created with password: password123');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
