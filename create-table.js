const https = require('https');

const sql = `CREATE TABLE IF NOT EXISTS whatsapp_qr (
  id INTEGER PRIMARY KEY DEFAULT 1, 
  qr_code TEXT, 
  state TEXT DEFAULT 'disconnected', 
  updated_at TIMESTAMP DEFAULT NOW()
);
INSERT INTO whatsapp_qr (id, state) VALUES (1, 'disconnected') ON CONFLICT (id) DO NOTHING;`;

const data = JSON.stringify({ query: sql });

const options = {
  hostname: 'ssdqkvsbhebrqihoekzz.supabase.co',
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'apikey': 'sbp_af83d57a1f0e37e51fd995a2fb63ec5f340cab73',
    'Authorization': 'Bearer sbp_af83d57a1f0e37e51fd995a2fb63ec5f340cab73',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
