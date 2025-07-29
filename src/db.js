// src/db.js
const mongoose = require('mongoose');
const log = require('./log');

async function connectDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/gemma-messenger');
        log('✅ MongoDB connected');
    } catch (err) {
        log('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }

    // Extra: log disconnects and errors for robust ops
    mongoose.connection.on('disconnected', () => log('⚠️  MongoDB disconnected'));
    mongoose.connection.on('error', (err) => log('❌ MongoDB error:', err));
}

module.exports = connectDB;
