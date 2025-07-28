const express = require('express');
const http = require('http');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Weather tool
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

function getSystemPrompt(lang = 'en') {
    const file = lang === 'es'
        ? path.join(__dirname, '..', 'prompts', 'systemPrompt_es.md')
        : path.join(__dirname, '..', 'prompts', 'systemPrompt_en.md');
    try {
        return fs.readFileSync(file, 'utf-8');
    } catch (err) {
        console.error('⚠️  System prompt file not found:', file);
        return '# FALLBACK\nYou are a helpful assistant.'; // mínimo de seguridad
    }
}


// Helper: Extract JSON from Markdown code block or plain text
function extractJSONFromCodeBlock(str) {
    const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match) return match[1];
    return str;
}

app.post('/api/generate', async (req, res) => {
    try {
        const systemPrompt = getSystemPrompt(req.body.lang || 'en');
        const userPrompt = `${systemPrompt}\n\nUser: ${req.body.prompt}`;

        // 1. Call Ollama (first round)
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

        const proxyRes = await new Promise((resolve, reject) => {
            const proxy = http.request(options, (resp) => {
                let data = '';
                resp.on('data', (chunk) => (data += chunk));
                resp.on('end', () => resolve(data));
            });
            proxy.on('error', reject);
            proxy.write(JSON.stringify({
                model: req.body.model,
                prompt: userPrompt,
                stream: false
            }));
            proxy.end();
        });

        // Parse outer { response: ... }
        let parsed = null;
        try {
            parsed = JSON.parse(proxyRes);
        } catch { }

        // Try to parse the *inner* response as JSON, even if wrapped in code block
        let toolCallObj = null;
        if (parsed && typeof parsed.response === "string") {
            const jsonCandidate = extractJSONFromCodeBlock(parsed.response);
            try {
                toolCallObj = JSON.parse(jsonCandidate);
            } catch { }
        }

        // If it's a tool_call, run the tool and do the roundtrip
        if (toolCallObj && toolCallObj.tool_call) {
            const { name, arguments: args } = toolCallObj.tool_call;
            const tool = tools.find(t => t.name === name);

            if (!tool) {
                return res.json({ response: `Tool '${name}' not found.` });
            }

            const result = await tool.function(args);

            // Get language from frontend (recommended)
            const isSpanish = req.body.lang === 'es';
            const replyInstruction = isSpanish
                ? `Responde en español de manera amistosa, usando el siguiente resultado de mi herramienta: ${result}`
                : `Reply in English in a friendly way, using my tool result: ${result}`;

            const secondPrompt = {
                model: req.body.model,
                prompt: replyInstruction,
                stream: false
            };

            const finalResponse = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(secondPrompt)
            });

            const finalData = await finalResponse.json();
            return res.json({ response: finalData.response });
        }

        // If not a tool call, just return the normal response text
        if (parsed && typeof parsed.response === "string") {
            return res.json({ response: parsed.response });
        }

        // If all else fails
        return res.json({ response: proxyRes });

    } catch (err) {
        console.error('Proxy error:', err);
        res.status(500).json({ response: "Proxy error: " + err.message });
    }
});

app.listen(5000, () => {
    console.log('✅ Proxy server running on http://localhost:5000');
});
