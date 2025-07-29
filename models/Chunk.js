// models/Chunk.js
const mongoose = require('mongoose');

const ChunkSchema = new mongoose.Schema({
  docId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  chunkIndex: Number,
  text: String,
  embedding: [Number]
});

module.exports = mongoose.model('Chunk', ChunkSchema);
