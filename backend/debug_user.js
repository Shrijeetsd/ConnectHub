const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ username: 'admin' });
        if (user) {
            console.log('---CHECK---');
            console.log(JSON.stringify({
                found: true,
                username: user.username,
                role: user.role,
                updatedAt: user.updatedAt
            }));
            console.log('---END---');
        } else {
            console.log('---CHECK---');
            console.log(JSON.stringify({ found: false }));
            console.log('---END---');
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
})();
