// models/Document.js
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  filename: String,
  type: String,
  uploadedBy: String,
  uploadDate: { type: Date, default: Date.now },
  metadata: Object
});

module.exports = mongoose.model('Document', DocumentSchema);
