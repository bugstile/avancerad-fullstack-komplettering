const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API körs', timestamp: new Date().toISOString() });
});

app.listen(port, HOST, () => {
  console.log(`API lyssnar på ${HOST}:${port}`);
});

module.exports = app;
