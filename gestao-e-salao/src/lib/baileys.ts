const API_URL = process.env.WHATSAPP_API_URL || 'http://167.234.248.199:8083'

async function apiFetch(endpoint: string, method: string = 'GET', body?: any) {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }
  if (body) options.body = JSON.stringify(body)

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options)
    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('WhatsApp API error:', error)
    return { error: error.message }
  }
}

export const baileys = {
  status: async (sessionId: string) => {
    try {
      const res = await apiFetch(`/session/${sessionId}/status`)
      return { 
        connected: res.connected || false, 
        state: res.status || 'disconnected',
        hasSession: !!res.status
      }
    } catch (e: any) {
      return { connected: false, state: 'error', hasSession: false }
    }
  },
  
  createInstance: async (sessionId: string) => {
    try {
      const res = await apiFetch(`/session/${sessionId}`, 'POST')
      return res
    } catch (e: any) {
      return { error: e.message }
    }
  },
  
  connect: async (sessionId: string) => {
    try {
      const res = await apiFetch(`/session/${sessionId}`, 'POST')
      return res
    } catch (e: any) {
      return { message: e.message }
    }
  },
  
  qr: async (sessionId: string) => {
    try {
      const res = await apiFetch(`/session/${sessionId}/status`)
      if (res.qr) {
        return { qr: res.qr }
      }
      if (res.status === 'connected') {
        return { qr: null, message: 'Ja conectado!' }
      }
      return { qr: null, message: res.status || 'Aguardando QR code...' }
    } catch (e: any) {
      return { qr: null, message: e.message || 'Erro ao buscar QR code' }
    }
  },
  
  pairingCode: async (sessionId: string, phone: string) => {
    return { code: null, message: 'Codigo de pareamento nao suportado' }
  },
  
  sendText: async (sessionId: string, phone: string, text: string) => {
    try {
      let cleanPhone = phone.replace(/\D/g, '')
      
      const res = await apiFetch('/send', 'POST', {
        sessionId,
        phone: cleanPhone,
        message: text
      })
      return res
    } catch (error: any) {
      console.error('Send error:', error)
      throw error
    }
  },

  disconnect: async (sessionId: string) => {
    try {
      const res = await apiFetch(`/session/${sessionId}`, 'DELETE')
      return res
    } catch (e: any) {
      return { message: e.message }
    }
  }
}

export async function sendWhatsAppMessage(sessionId: string, phone: string, message: string) {
  return baileys.sendText(sessionId, phone, message)
}

export async function getWhatsAppStatus(sessionId: string) {
  return baileys.status(sessionId)
}

export async function getWhatsAppQR(sessionId: string) {
  return baileys.qr(sessionId)
}
