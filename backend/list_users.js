const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sms_receiver')
    .then(async () => {
        const users = await User.find({});
        console.log('USERS_IN_DB:');
        users.forEach(u => {
            console.log(`- Username: ${u.username}, Role: ${u.role}`);
        });
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
