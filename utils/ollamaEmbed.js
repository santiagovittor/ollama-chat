const log = require('../src/log');

async function getOllamaEmbedding(text, model = "nomic-embed-text") {
    log(`Embedding request: model="${model}", text="${text.slice(0, 50).replace(/\n/g, ' ')}..."`);
    const response = await fetch('http://localhost:11434/api/embeddings', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model,
            prompt: text
        })
    });

    const data = await response.json();
    if (data.embedding) {
        log('Embedding: SUCCESS');
        return data.embedding;
    } else {
        log('Embedding: FAIL - No embedding returned from Ollama', data);
        throw new Error('No embedding returned from Ollama');
    }
}

module.exports = getOllamaEmbedding;
