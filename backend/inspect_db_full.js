const mongoose = require('mongoose');
require('dotenv').config();

const inspect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('--- DB INSPECTION ---');

        for (let coll of collections) {
            const data = await db.collection(coll.name).find({}).toArray();
            console.log(`\nCollection: ${coll.name}`);
            console.log(JSON.stringify(data, (key, value) => key === 'password' ? '***' : value, 2));
        }
        console.log('\n--- END ---');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};

inspect();
