const http = require('http');
const { URL } = require('url');

const TARGET = 'http://localhost:8082';
const PORT = 8080;

http.createServer((req, res) => {
  const url = new URL(req.url, TARGET);
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method: req.method,
    headers: { ...req.headers, host: url.host }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  req.pipe(proxyReq);

  proxyReq.on('error', (e) => {
    console.error('Proxy error:', e.message);
    res.writeHead(502);
    res.end('Bad Gateway: ' + e.message);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy running on port ${PORT} -> ${TARGET}`);
});
