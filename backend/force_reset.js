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
            console.log('Admin password successfully reset to: admin123');
        } else {
            const newUser = await User.create({
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            });
            console.log('Admin user created with password: admin123');
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};

reset();
