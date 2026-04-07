const API_URL = process.env.BAILEYS_API_URL || ''
const API_KEY = process.env.BAILEYS_API_KEY || ''

async function baileysFetch(instanceId: string, endpoint: string, method: string = 'GET', body?: any) {
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

  const response = await fetch(`${API_URL}/instance/${instanceId}${endpoint}`, options)
  return response.json()
}

export const baileys = {
  status: async (instanceId: string) => {
    try {
      const res = await baileysFetch(instanceId, '/status')
      return res
    } catch {
      return { connected: false, state: 'error', hasSession: false }
    }
  },
  
  qr: async (instanceId: string) => {
    try {
      const res = await baileysFetch(instanceId, '/qr')
      return res
    } catch {
      return { qr: null, message: 'Erro ao buscar QR code' }
    }
  },
  
  sendText: async (instanceId: string, phone: string, text: string) => {
    try {
      let cleanPhone = phone.replace(/\D/g, '')
      if (!cleanPhone.startsWith('55')) cleanPhone = '55' + cleanPhone
      
      const res = await baileysFetch(instanceId, '/send', 'POST', {
        phone: cleanPhone,
        message: text
      })
      return res
    } catch (error) {
      console.error('Send error:', error)
      throw error
    }
  },

  connect: async (instanceId: string) => {
    try {
      const res = await baileysFetch(instanceId, '/connect', 'POST')
      return res
    } catch {
      return { message: 'Erro ao conectar' }
    }
  },

  disconnect: async (instanceId: string) => {
    try {
      const res = await baileysFetch(instanceId, '/logout', 'POST')
      return res
    } catch {
      return { message: 'Erro ao desconectar' }
    }
  }
}

export async function sendWhatsAppMessage(instanceId: string, phone: string, message: string) {
  return baileys.sendText(instanceId, phone, message)
}

export async function getWhatsAppStatus(instanceId: string) {
  return baileys.status(instanceId)
}

export async function getWhatsAppQR(instanceId: string) {
  return baileys.qr(instanceId)
}
