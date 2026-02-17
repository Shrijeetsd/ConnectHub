const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        console.log('---USERS_START---');
        users.forEach(u => {
            console.log(JSON.stringify({
                username: u.username,
                role: u.role,
                hasPassword: !!u.password,
                updatedAt: u.updatedAt
            }));
        });
        console.log('---USERS_END---');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};

run();
