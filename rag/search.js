const log = require('../src/log');
const Chunk = require('../models/Chunk');
const getOllamaEmbedding = require('../utils/ollamaEmbed');

function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / ((normA * normB) || 1);
}

async function searchRelevantChunks(query, k = 4) {
    try {
        const queryEmbedding = await getOllamaEmbedding(query);
        const chunks = await Chunk.find();
        const scored = chunks.map(chunk => ({
            ...chunk.toObject(),
            score: cosineSimilarity(chunk.embedding, queryEmbedding)
        }));
        scored.sort((a, b) => b.score - a.score);
        const top = scored.slice(0, k);

        log(`RAG: Found ${top.length} relevant chunks for: "${query}"`);
        return top;
    } catch (err) {
        log("RAG search error:", err.message);
        throw err; // Propagate error up to main proxy for further handling/logging
    }
}

module.exports = { searchRelevantChunks };
