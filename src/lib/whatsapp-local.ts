const API_URL = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001'
const API_KEY = process.env.WHATSAPP_SERVER_KEY || 'local-dev'

async function localFetch(endpoint: string, method: string = 'GET', body?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    cache: 'no-store'
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options)
    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('Local WhatsApp Server error:', error)
    return { error: error.message, online: false }
  }
}

export const whatsappServer = {
  status: async () => {
    const res = await localFetch('/status')
    return { 
      connected: res.connected || res.status === 'connected', 
      state: res.status || 'disconnected',
      online: true
    }
  },
  
  health: async () => {
    return await localFetch('/health')
  },

  qr: async () => {
    return await localFetch('/qr')
  },
  
  sendText: async (phone: string, text: string) => {
    return await localFetch('/send', 'POST', { phone, message: text })
  },

  disconnect: async () => {
    return await localFetch('/logout', 'POST')
  },

  reconnect: async () => {
    return await localFetch('/reconnect', 'POST')
  }
}

export async function sendWhatsAppMessage(phone: string, message: string) {
  return whatsappServer.sendText(phone, message)
}

export async function getWhatsAppStatus() {
  return whatsappServer.status()
}

export async function getWhatsAppQR() {
  return whatsappServer.qr()
}
