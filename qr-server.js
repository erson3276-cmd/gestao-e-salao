const http = require('http');
const fs = require('fs');

http.createServer((req, res) => {
  if (req.url === '/qr.png') {
    const img = fs.readFileSync('/tmp/qr.png');
    res.writeHead(200, {'Content-Type': 'image/png'});
    res.end(img);
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    var html = '<!DOCTYPE html><html><head><title>Moça ChiQ - WhatsApp QR Code</title></head>';
    html += '<body style="display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1a1a1a;font-family:Arial,sans-serif;">';
    html += '<div style="background:white;padding:30px;border-radius:16px;text-align:center;">';
    html += '<h1 style="color:#333;margin-bottom:10px;">Moça ChiQ</h1>';
    html += '<p style="color:#666;margin-bottom:20px;">Escaneie o QR code com seu WhatsApp</p>';
    html += '<img src="/qr.png" alt="QR Code" style="width:300px;height:300px;" />';
    html += '<p style="color:#999;margin-top:20px;font-size:14px;">WhatsApp > Configurações > Aparelhos conectados > Conectar aparelho</p>';
    html += '</div></body></html>';
    res.end(html);
  }
}).listen(8080, '0.0.0.0', function() {
  console.log('QR server running on port 8080');
});
