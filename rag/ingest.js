// rag/ingest.js
const path = require('path');
const fs = require('fs/promises');
const pdfParse = require('pdf-parse');
const MarkdownIt = require('markdown-it');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter'); // this one is fine
const Document = require('../models/Document');
const Chunk = require('../models/Chunk');
const getOllamaEmbedding = require('../utils/ollamaEmbed');

const DOCS_FOLDER = './sop_docs';

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buf = await fs.readFile(filePath);

  if (ext === '.pdf') {
    return (await pdfParse(buf)).text;
  } else if (ext === '.md') {
    return new MarkdownIt().render(buf.toString());
  } else if (ext === '.txt') {
    return buf.toString();
  }
  throw new Error('Unsupported file type: ' + ext);
}

async function ingestDocs() {
  const files = await fs.readdir(DOCS_FOLDER);
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 512, chunkOverlap: 50 });

  for (const file of files) {
    const filePath = path.join(DOCS_FOLDER, file);
    const text = await extractText(filePath);

    const doc = await Document.create({
      filename: file,
      type: path.extname(file).slice(1),
      uploadedBy: 'admin',
      metadata: {}
    });

    const chunks = await splitter.createDocuments([text]);

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i].pageContent;
      const embedding = await getOllamaEmbedding(chunkText);

      await Chunk.create({
        docId: doc._id,
        chunkIndex: i,
        text: chunkText,
        embedding
      });
    }

    console.log(`✅ Ingested: ${file}`);
  }
}

module.exports = { ingestDocs };
