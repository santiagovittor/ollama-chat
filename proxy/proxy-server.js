const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate', (req, res) => {
  const options = {
    hostname: 'localhost',
    port: 11434,
    path: '/api/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Host': 'localhost' // << critical for Ollama to handle request
    },
  };

  const proxy = http.request(options, (resp) => {
    let data = '';
    resp.on('data', (chunk) => (data += chunk));
    resp.on('end', () => {
      res.status(resp.statusCode).send(data);
    });
  });

  proxy.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.status(500).send('Proxy error: ' + err.message);
  });

  proxy.write(JSON.stringify(req.body));
  proxy.end();
});

app.listen(5000, () => {
  console.log('✅ Minimal reverse proxy listening on http://localhost:5000');
});
