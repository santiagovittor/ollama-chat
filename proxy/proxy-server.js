// proxy/proxy-server.js

const express = require('express');
const http = require('http');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const log = require('../src/log');
const connectDB = require('../src/db');
const { searchRelevantChunks } = require('../rag/search');

// ==== Message memory & token utils ====
const Message = require('../models/Message');
const countTokens = require('../utils/tokenCount');

// ====== CONNECT TO MONGODB ======
connectDB();

// ====== EXPRESS APP ======
const app = express();

// ====== CORS CONFIGURATION ======
const ALLOWED_ORIGINS = [
  'https://chatkikiti.vercel.app',
  'http://localhost:3000',
];

const corsOptionsDelegate = (origin, callback) => {
  console.log("CORS origin:", origin); // Debug log
  if (!origin) return callback(null, true); // allow non-browser requests
  if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
  return callback(new Error('Not allowed by CORS'));
};

app.use(cors({
  origin: corsOptionsDelegate,
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: false, // set true if you ever use cookies/sessions
}));

app.use(express.json());

// =============== TOOLS ===============
const tools = [
  {
    name: "get_weather",
    function: async ({ city }) => {
      const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=3`);
      return await res.text();
    }
  },
  {
    name: "search_google",
    function: async ({ query }) => {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;
      const res = await fetch(url);
      if (!res.ok) return "No results found.";
      const data = await res.json();

      if (data.AbstractText) return data.AbstractText;
      if (data.Answer) return data.Answer;
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        return data.RelatedTopics[0].Text || "No short answer found.";
      }
      return "No answer found.";
    }
  },
  {
    name: "search_wikipedia",
    function: async ({ query }) => {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) return "No Wikipedia page found.";
      const data = await res.json();
      return data.extract || "No summary available.";
    }
  }
];

// =============== SYSTEM PROMPT ===============
function getSystemPrompt(lang = 'en') {
  const file = lang === 'es'
    ? path.join(__dirname, '..', 'prompts', 'systemPrompt_es.md')
    : path.join(__dirname, '..', 'prompts', 'systemPrompt_en.md');
  try {
    return fs.readFileSync(file, 'utf-8');
  } catch (err) {
    log('⚠️  System prompt file not found:', file);
    return '# FALLBACK\nYou are a helpful assistant.';
  }
}

// =============== UTILS ===============
function extractJSONFromCodeBlock(str) {
  const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (match) return match[1];
  return str;
}

// =============== MEMORY: Save & Fetch ===============
async function saveMessage({ sessionId, userId, role, content }) {
  const tokenCountVal = countTokens(content || "");
  const message = new Message({ sessionId, userId, role, content, tokenCount: tokenCountVal });
  await message.save();
}

const CONTEXT_TOKEN_LIMIT = 2000; // adjust for your model
async function fetchContextWindow(sessionId) {
  const messages = await Message.find({ sessionId })
    .sort({ timestamp: -1 })
    .limit(30)
    .exec();

  let context = [];
  let totalTokens = 0;
  for (const msg of messages) {
    if (totalTokens + (msg.tokenCount || 0) > CONTEXT_TOKEN_LIMIT) break;
    context.unshift(msg);
    totalTokens += (msg.tokenCount || 0);
  }
  return context;
}

// =============== MAIN CHAT ROUTE ===============
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, lang, sessionId, userId } = req.body;
    if (!sessionId) return res.status(400).json({ response: "Missing sessionId" });

    // --- 1. Save user message to memory ---
    await saveMessage({ sessionId, userId, role: "user", content: prompt });

    // --- 2. Get context window from memory ---
    const historyContext = await fetchContextWindow(sessionId);

    // --- 3. Get relevant context via RAG ---
    let ragContext = "";
    try {
      const relevantChunks = await searchRelevantChunks(prompt, 4);
      ragContext = relevantChunks.map(c => c.text).join('\n---\n');
      log(`RAG: Found ${relevantChunks.length} relevant chunks for: "${prompt}"`);
    } catch (e) {
      log("RAG search failed:", e);
    }

    // --- 4. Build prompt (history + SOP context) ---
    const chatHistory = historyContext
      .map(m => `${m.role === "assistant" ? "Gemma" : "User"}: ${m.content}`)
      .join('\n');

    const systemPrompt = getSystemPrompt(lang || 'en');

    const userPrompt = `
${systemPrompt}

[Relevant SOPs]
${ragContext}

[Chat History]
${chatHistory}

User: ${prompt}
`;

    // --- 5. Call Ollama ---
    const options = {
      hostname: 'localhost',
      port: 11434,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': 'localhost'
      }
    };

    log("Using model:", req.body.model || "llama3:8b");

    const proxyRes = await new Promise((resolve, reject) => {
      const proxy = http.request(options, (resp) => {
        let data = '';
        resp.on('data', (chunk) => (data += chunk));
        resp.on('end', () => resolve(data));
      });
      proxy.on('error', reject);
      proxy.write(JSON.stringify({
        model: req.body.model || "llama3:8b",
        prompt: userPrompt,
        stream: false // NON-STREAMING
      }));
      proxy.end();
    });

    // --- 6. Handle tool calls and normal replies as before ---
    let parsed = null;
    try {
      parsed = JSON.parse(proxyRes);
    } catch { }

    let toolCallObj = null;
    if (parsed && typeof parsed.response === "string") {
      const jsonCandidate = extractJSONFromCodeBlock(parsed.response);
      try {
        toolCallObj = JSON.parse(jsonCandidate);
      } catch { }
    }

    if (toolCallObj && toolCallObj.tool_call) {
      const { name, arguments: args } = toolCallObj.tool_call;
      const tool = tools.find(t => t.name === name);

      if (!tool) {
        return res.json({ response: `Tool '${name}' not found.` });
      }

      const result = await tool.function(args);
      const isSpanish = lang === 'es';
      const replyInstruction = isSpanish
        ? `Responde en español de manera amistosa, usando el siguiente resultado de mi herramienta: ${result}`
        : `Reply in English in a friendly way, using my tool result: ${result}`;

      const secondPrompt = {
        model: req.body.model || "llama3:8b",
        prompt: replyInstruction,
        stream: false
      };

      log("Tool call follow-up, using model:", req.body.model || "llama3:8b");

      const finalResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(secondPrompt)
      });

      const finalData = await finalResponse.json();

      // --- 7. Save assistant reply (tool) to memory ---
      await saveMessage({ sessionId, userId, role: "assistant", content: finalData.response });

      return res.json({ response: finalData.response });
    }

    if (parsed && typeof parsed.response === "string") {
      // --- 8. Save normal assistant reply to memory ---
      await saveMessage({ sessionId, userId, role: "assistant", content: parsed.response });
      return res.json({ response: parsed.response });
    }

    // --- 9. Save raw Ollama reply if parsing fails ---
    await saveMessage({ sessionId, userId, role: "assistant", content: proxyRes });
    return res.json({ response: proxyRes });

  } catch (err) {
    log('Proxy error:', err);
    res.status(500).json({ response: "Proxy error: " + err.message });
  }
});

// =============== SERVER START ===============
app.listen(5000, () => {
  log('✅ Proxy server running on http://localhost:5000');
});
