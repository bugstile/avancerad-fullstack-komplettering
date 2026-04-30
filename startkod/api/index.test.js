const request = require('supertest');
const app = require('./index');

test('GET / svarar med status 200 och message: API körs', async () => {
  const res = await request(app).get('/');
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe('API körs');
});

test('GET / svarar med Content-Type application/json', async () => {
  const res = await request(app).get('/');
  expect(res.headers['content-type']).toMatch(/application\/json/);
  expect(res.body).toHaveProperty('timestamp');
});

test('GET /health svarar med status 200 och status: ok', async () => {
  const res = await request(app).get('/health');
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('ok');
  expect(res.headers['cache-control']).toBe('public, max-age=60');
});

test('okänd route ger 404', async () => {
  const res = await request(app).get('/finns-inte');
  expect(res.statusCode).toBe(404);
});

test('GET / har CORS-header i svaret', async () => {
  const res = await request(app).get('/').set('Origin', 'http://localhost:5173');
  expect(res.headers['access-control-allow-origin']).toBeDefined();
});

test('GET / returnerar cachat svar vid upprepade anrop', async () => {
  const res1 = await request(app).get('/');
  const res2 = await request(app).get('/');
  expect(res1.body.timestamp).toBe(res2.body.timestamp);
});
