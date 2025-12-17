const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB Connected: ${conn.connection.host}');

        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error: ${err}');
        })

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
        })
    } catch (err) {
        console.error(`MongoDB connection failed:`, err);
        process.exit(1);
    }
}

module.exports = connectDB;