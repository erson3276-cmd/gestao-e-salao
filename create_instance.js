const https = require('http');

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/instance/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'salao123'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(JSON.stringify({
  instanceName: 'salao',
  integration: 'WHATSAPP-BAILEYS'
}));
req.end();
