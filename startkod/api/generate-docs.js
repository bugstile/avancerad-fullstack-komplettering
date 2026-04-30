const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Komplettering API',
      version: '1.0.0',
      description: 'Minimal REST API för kompletteringsuppgift',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Lokalt' },
    ],
  },
  apis: ['./index.js'],
};

const spec = swaggerJsdoc(options);
fs.writeFileSync('./openapi.json', JSON.stringify(spec, null, 2));
console.log('openapi.json genererad.');
