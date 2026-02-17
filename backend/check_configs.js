const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Config = require('./models/Config');
const connectDB = require('./config/db');

dotenv.config();

const checkConfig = async () => {
    try {
        await connectDB();
        const configs = await Config.find({});
        console.log('--- Current Configs ---');
        console.log(JSON.stringify(configs, null, 2));
        console.log('--- End ---');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkConfig();
