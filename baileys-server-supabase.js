const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const { createClient } = require('@supabase/supabase-js')
const express = require('express')
const cors = require('cors')
const qrcode = require('qrcode')
const pino = require('pino')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8082
const API_KEY = process.env.API_KEY || 'salao2024'
const SESSION_FOLDER = './auth_info'

const supabase = createClient('https://ssdqkvsbhebrqihoekzz.supabase.co', 'sbp_af83d57a1f0e37e51fd995a2fb63ec5f340cab73')

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

async function saveQRToSupabase(qr) {
  try {
    const qrImage = await qrcode.toDataURL(qr)
    const { error } = await supabase
      .from('whatsapp_qr')
      .upsert({ id: 1, qr_code: qrImage, state: connectionState, updated_at: new Date().toISOString() })
    if (error) console.error('Supabase QR save error:', error)
    else console.log('QR code saved to Supabase')
  } catch (err) {
    console.error('Error saving QR to Supabase:', err)
  }
}

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
      saveQRToSupabase(qr)
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
      supabase.from('whatsapp_qr').upsert({ id: 1, qr_code: null, state: 'connected', updated_at: new Date().toISOString() })
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

async function start() {
  await initSock()
  app.listen(PORT, '0.0.0.0', () => {
    console.log('Baileys service running on port ' + PORT)
    console.log('API Key: ' + API_KEY)
    console.log('WhatsApp status: ' + connectionState)
  })
}

start().catch(console.error)
