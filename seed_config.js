require('dotenv').config();
const mongoose_lib = require('mongoose');
const Config = require('./models/Config');

async function seedConfig() {
    try {
        await mongoose_lib.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        const exists = await Config.findOne({ key: 'WEBSITE_URL' });
        if (!exists) {
            await Config.create({
                key: 'WEBSITE_URL',
                value: 'https://connecthubapp.bond',
                description: 'Main redirection URL'
            });
            console.log('Seed: WEBSITE_URL created');
        } else {
            console.log('Seed: WEBSITE_URL already exists');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedConfig();
