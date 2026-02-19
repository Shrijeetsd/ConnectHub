const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Production optimizations
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);

        // Mask the URI to safely log it
        const maskedURI = process.env.MONGO_URI
            ? process.env.MONGO_URI.replace(/:([^:@]{1,})@/, ':****@')
            : 'UNDEFINED';
        console.log(`Connection URI: ${maskedURI}`);

        mongoose.connection.on('error', err => {
            console.error(`MongoDB runtime error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
