const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const express = require('express')
const cors = require('cors')
const qrcode = require('qrcode')
const pino = require('pino')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8080
const API_KEY = process.env.API_KEY || 'salao2024'
const SESSION_FOLDER = './auth_info'

let sock = null
let qrData = null
let connectionState = 'disconnected'

const logger = pino({ level: 'info' })

const checkAuth = (req, res, next) => {
  const key = req.headers['apikey']
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

app.use(checkAuth)

async function initSock() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER)
  const { version } = await fetchLatestBaileysVersion()
  
  sock = makeWASocket({
    version,
    auth: state,
    logger: logger
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    
    if (qr) {
      qrData = qr
      connectionState = 'qr_ready'
      console.log('QR Code received')
    }
    
    if (connection === 'close') {
      connectionState = 'disconnected'
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) {
        initSock()
      }
    } else if (connection === 'open') {
      connectionState = 'connected'
      qrData = null
      console.log('WhatsApp connected!')
    }
  })

  sock.ev.on('qr', (qr) => {
    qrData = qr
    connectionState = 'qr_ready'
  })

  console.log('WhatsApp socket initialized')
}

function sessionExists() {
  const fs = require('fs')
  return fs.existsSync(SESSION_FOLDER + '/creds.json')
}

app.get('/status', async (req, res) => {
  res.json({
    connected: connectionState === 'connected',
    state: connectionState,
    hasSession: sessionExists()
  })
})

app.get('/qr', async (req, res) => {
  if (!qrData) {
    return res.json({ 
      qr: null, 
      message: connectionState === 'connected' ? 'Already connected' : 'Waiting for QR code...'
    })
  }
  
  try {
    const qrImage = await qrcode.toDataURL(qrData)
    res.json({ qr: qrImage })
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' })
  }
})

app.post('/send', async (req, res) => {
  const { phone, message } = req.body
  
  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message are required' })
  }
  
  if (!sock || connectionState !== 'connected') {
    return res.status(400).json({ error: 'WhatsApp not connected' })
  }
  
  try {
    let cleanPhone = phone.replace(/\D/g, '')
    if (!cleanPhone.endsWith('@s.whatsapp.net')) {
      cleanPhone = cleanPhone + '@s.whatsapp.net'
    }
    
    await sock.sendMessage(cleanPhone, { text: message })
    res.json({ success: true, to: phone })
  } catch (err) {
    console.error('Send error:', err)
    res.status(500).json({ error: 'Failed to send message', details: err.message })
  }
})

app.post('/logout', async (req, res) => {
  if (sock) {
    try {
      await sock.logout()
      connectionState = 'disconnected'
      qrData = null
      res.json({ success: true })
    } catch (err) {
      res.status(500).json({ error: 'Failed to logout' })
    }
  } else {
    res.json({ success: true })
  }
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/', (req, res) => {
  const html = '<!DOCTYPE html><html><head><title>Moça ChiQ - WhatsApp QR Code</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #111; color: #fff; min-height: 100vh; display: flex; justify-content: center; align-items: center; } .container { text-align: center; padding: 40px; background: #1a1a2e; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); max-width: 450px; width: 90%; } h1 { font-size: 28px; margin-bottom: 8px; background: linear-gradient(135deg, #25D366, #128C7E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; } .subtitle { color: #888; margin-bottom: 30px; font-size: 14px; } .qr-box { background: #fff; padding: 20px; border-radius: 16px; display: inline-block; margin-bottom: 24px; } .qr-box img { width: 280px; height: 280px; } .status { padding: 12px 24px; border-radius: 30px; font-size: 14px; font-weight: 600; display: inline-block; margin-bottom: 16px; } .status.connecting { background: #f59e0b22; color: #f59e0b; } .status.connected { background: #25D36622; color: #25D366; } .status.disconnected { background: #ef444422; color: #ef4444; } .instructions { color: #aaa; font-size: 13px; line-height: 1.6; margin-top: 16px; text-align: left; background: #0f0f23; padding: 16px; border-radius: 12px; } .instructions ol { padding-left: 20px; } .instructions li { margin-bottom: 6px; } #qr-container { display: none; } .loading { color: #888; font-size: 16px; padding: 40px; } .refresh-btn { background: #25D366; color: #fff; border: none; padding: 12px 28px; border-radius: 30px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 12px; } .refresh-btn:hover { background: #128C7E; }</style></head><body><div class="container"><h1>Moça ChiQ</h1><p class="subtitle">Conecte seu WhatsApp para receber mensagens automáticas</p><div id="status-bar" class="status connecting">Conectando...</div><div id="loading" class="loading">Gerando QR Code...</div><div id="qr-container"><div class="qr-box"><img id="qr-image" src="" alt="QR Code" /></div><br/><button class="refresh-btn" onclick="loadQR()">Atualizar QR Code</button></div><div class="instructions"><strong>Como conectar:</strong><ol><li>Abra o <strong>WhatsApp</strong> no celular</li><li>Vá em <strong>Configurações</strong> > <strong>Aparelhos conectados</strong></li><li>Toque em <strong>Conectar aparelho</strong></li><li>Escaneie o QR code acima</li></ol></div></div><script>async function loadQR() { try { const res = await fetch("/qr", { headers: { "apikey": "salao2024" } }); const data = await res.json(); if (data.qr) { document.getElementById("qr-image").src = data.qr; document.getElementById("qr-container").style.display = "block"; document.getElementById("loading").style.display = "none"; document.getElementById("status-bar").className = "status connecting"; document.getElementById("status-bar").textContent = "Aguardando scan..."; } else { document.getElementById("loading").textContent = data.message || "Aguardando QR Code..."; setTimeout(loadQR, 3000); } } catch (e) { document.getElementById("loading").textContent = "Erro ao carregar. Tentando novamente..."; setTimeout(loadQR, 3000); } } async function checkStatus() { try { const res = await fetch("/status", { headers: { "apikey": "salao2024" } }); const data = await res.json(); if (data.connected) { document.getElementById("status-bar").className = "status connected"; document.getElementById("status-bar").textContent = "WhatsApp Conectado!"; document.getElementById("qr-container").style.display = "none"; document.getElementById("loading").style.display = "none"; } else { document.getElementById("status-bar").className = "status connecting"; document.getElementById("status-bar").textContent = "Aguardando scan..."; } } catch (e) {} } loadQR(); setInterval(checkStatus, 5000);</script></body></html>'
  res.send(html)
})

async function start() {
  await initSock()
  app.listen(PORT, '0.0.0.0', () => {
    console.log('Baileys service running on port ' + PORT)
    console.log('API Key: ' + API_KEY)
    console.log('WhatsApp status: ' + connectionState)
  })
}

start().catch(console.error)
