const http = require('http');
const data = JSON.stringify({
  phone: '5521982755539',
  message: 'Teste Moça ChiQ - WhatsApp funcionando!'
});
const opts = {
  hostname: 'localhost',
  port: 8082,
  path: '/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'salao2024',
    'Content-Length': Buffer.byteLength(data)
  }
};
const req = http.request(opts, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => console.log(body));
});
req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
