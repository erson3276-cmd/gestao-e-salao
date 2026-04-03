const API_URL = process.env.BAILEYS_API_URL || 'http://localhost:8080'
const API_KEY = process.env.BAILEYS_API_KEY || ''

async function baileysFetch(endpoint: string, method: string = 'GET', body?: any) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': API_KEY
  }

  const options: RequestInit = {
    method,
    headers,
    cache: 'no-store'
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_URL}${endpoint}`, options)
  return response.json()
}

export const baileys = {
  status: async () => {
    try {
      const res = await baileysFetch('/status')
      return res
    } catch {
      return { connected: false, state: 'error', hasSession: false }
    }
  },
  
  qr: async () => {
    try {
      const res = await baileysFetch('/qr')
      return res
    } catch {
      return { qr: null, message: 'Erro ao buscar QR code' }
    }
  },
  
  sendText: async (phone: string, text: string) => {
    try {
      let cleanPhone = phone.replace(/\D/g, '')
      if (!cleanPhone.startsWith('55')) cleanPhone = '55' + cleanPhone
      
      const res = await baileysFetch('/send', 'POST', {
        phone: cleanPhone,
        message: text
      })
      return res
    } catch (error) {
      console.error('Send error:', error)
      throw error
    }
  }
}

export async function sendWhatsAppMessage(phone: string, message: string) {
  return baileys.sendText(phone, message)
}

export async function getWhatsAppStatus() {
  return baileys.status()
}

export async function getWhatsAppQR() {
  return baileys.qr()
}
