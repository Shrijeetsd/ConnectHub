const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const reset = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ username: 'admin' });
        if (user) {
            user.password = 'admin123';
            await user.save();
            console.log('---SUCCESS---');
        } else {
            console.log('---NOT_FOUND---');
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};

reset();
