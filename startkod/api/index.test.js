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
});
