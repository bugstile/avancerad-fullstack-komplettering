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

app.get('/', (req, res) => {
  res.json({ message: 'API körs', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, HOST, () => {
  console.log(`[${new Date().toISOString()}] API lyssnar på ${HOST}:${port}`);
});

module.exports = app;
