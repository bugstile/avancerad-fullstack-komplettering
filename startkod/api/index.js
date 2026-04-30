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

/**
 * @openapi
 * /:
 *   get:
 *     summary: Hälsningssvar från API:et
 *     tags: [Root]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: API körs
 *                 timestamp:
 *                   type: string
 *                   example: '2026-01-01T00:00:00.000Z'
 */
app.get('/', (req, res) => {
  const now = Date.now();
  if (cachedResponse && now - cacheTimestamp < CACHE_TTL_MS) {
    return res.json(cachedResponse);
  }
  cachedResponse = { message: 'API körs', timestamp: new Date().toISOString() };
  cacheTimestamp = now;
  res.json(cachedResponse);
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Hälsokontroll
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get('/health', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.status(200).json({ status: 'ok' });
});

app.listen(port, HOST, () => {
  console.log(`[${new Date().toISOString()}] API lyssnar på ${HOST}:${port}`);
});

module.exports = app;
