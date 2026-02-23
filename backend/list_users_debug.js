const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const listAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, 'username role');
        console.log('---ALL_USERS---');
        console.log(JSON.stringify(users, null, 2));
        console.log('---END---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
listAll();
