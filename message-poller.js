const { createClient } = require('@supabase/supabase-js')
const http = require('http')

const supabase = createClient(
  'https://ssdqkvsbhebrqihoekzz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZHFrdnNiaGVicnFpaG9la3p6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4NjkxOSwiZXhwIjoyMDkwNDYyOTE5fQ.lMnYZRJVYSOVPTvEvIjb-hxBIBp4I02oRTK8qvHZ9SM'
)

const BAILEYS_URL = 'http://localhost:8082'
const BAILEYS_KEY = 'salao2024'
const POLL_INTERVAL = 5000
const processingIds = new Set()

async function sendViaBaileys(phone, message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ phone, message })
    const options = {
      hostname: 'localhost',
      port: 8082,
      path: '/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': BAILEYS_KEY,
        'Content-Length': Buffer.byteLength(data)
      }
    }
    
    const req = http.request(options, res => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch {
          resolve({ success: false, error: 'Invalid response' })
        }
      })
    })
    
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function checkBaileysStatus() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8082,
      path: '/status',
      method: 'GET',
      headers: { 'apikey': BAILEYS_KEY }
    }
    
    const req = http.request(options, res => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch {
          resolve({ connected: false, state: 'error' })
        }
      })
    })
    
    req.on('error', () => resolve({ connected: false, state: 'error' }))
    req.end()
  })
}

async function updateStatusInSupabase() {
  try {
    const status = await checkBaileysStatus()
    
    await supabase
      .from('whatsapp_status')
      .upsert({
        id: 1,
        connected: status.connected || false,
        state: status.state || 'error',
        has_session: status.hasSession || false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
  } catch (err) {
    console.error('Error updating status:', err.message)
  }
}

async function checkPendingMessages() {
  try {
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5)
    
    if (error || !messages || messages.length === 0) return
    
    console.log(`Found ${messages.length} pending messages`)
    
    for (const msg of messages) {
      if (processingIds.has(msg.id)) {
        console.log(`Message ${msg.id} already processing, skipping`)
        continue
      }
      
      processingIds.add(msg.id)
      
      try {
        const result = await sendViaBaileys(msg.phone, msg.message)
        
        await supabase
          .from('whatsapp_messages')
          .update({ 
            status: result.success ? 'sent' : 'failed',
            sent_at: new Date().toISOString(),
            error: result.success ? null : (result.error || 'Unknown error')
          })
          .eq('id', msg.id)
        
        console.log(`Message ${msg.id}: ${result.success ? 'SENT' : 'FAILED'}`)
      } catch (err) {
        console.error(`Error sending message ${msg.id}:`, err.message)
        await supabase
          .from('whatsapp_messages')
          .update({ status: 'failed', error: err.message })
          .eq('id', msg.id)
      } finally {
        processingIds.delete(msg.id)
      }
    }
  } catch (err) {
    console.error('Error checking messages:', err.message)
  }
}

async function main() {
  console.log('WhatsApp Poller started')
  console.log('Polling every', POLL_INTERVAL, 'ms')
  
  await updateStatusInSupabase()
  await checkPendingMessages()
  
  setInterval(updateStatusInSupabase, 15000)
  setInterval(checkPendingMessages, POLL_INTERVAL)
}

main()
