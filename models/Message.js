// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userId: { type: String }, // Optional if multi-user
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  tokenCount: { type: Number }, // For efficient context window management
});

module.exports = mongoose.model('Message', MessageSchema);
