const mongoose = require('mongoose');
require('dotenv').config();

const inspect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('--- COLLECTIONS ---');
        console.log(collections.map(c => c.name));

        for (let coll of collections) {
            const count = await db.collection(coll.name).countDocuments();
            console.log(`Collection: ${coll.name}, Count: ${count}`);
            if (coll.name === 'users') {
                const users = await db.collection('users').find({}).toArray();
                console.log('Users (limited):', users.map(u => ({ username: u.username, role: u.role, password_present: !!u.password })));
            }
        }
        console.log('--- END ---');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};

inspect();
