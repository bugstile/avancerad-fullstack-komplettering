const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

// Logga varje inkommande request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// In-memory cache för GET /
let cachedResponse = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5000;

app.get('/', (req, res) => {
  const now = Date.now();
  if (cachedResponse && now - cacheTimestamp < CACHE_TTL_MS) {
    return res.json(cachedResponse);
  }
  cachedResponse = { message: 'API körs', timestamp: new Date().toISOString() };
  cacheTimestamp = now;
  res.json(cachedResponse);
});

app.get('/health', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.status(200).json({ status: 'ok' });
});

app.listen(port, HOST, () => {
  console.log(`[${new Date().toISOString()}] API lyssnar på ${HOST}:${port}`);
});

module.exports = app;
