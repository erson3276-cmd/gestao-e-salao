// WhatsApp Manager - Usa API local na Oracle Cloud
// Servidor: http://167.234.248.199:3001

const API_URL = process.env.WHATSAPP_API_URL || 'http://167.234.248.199:8083'

async function apiFetch(endpoint: string, method: string = 'GET', body?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
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
    console.error('WhatsApp API error:', error)
    return { error: error.message }
  }
}

export const whatsappManager = {
  createSession: async (salonId: string) => {
    const res = await apiFetch(`/session/${salonId}`, 'POST')
    return res
  },

  status: async (salonId: string) => {
    const res = await apiFetch(`/session/${salonId}/status`)
    return {
      connected: res.connected || res.status === 'connected',
      state: res.status || 'unknown',
      qr: res.qr
    }
  },

  qr: async (salonId: string) => {
    const res = await apiFetch(`/session/${salonId}/status`)
    return res
  },

  sendText: async (salonId: string, phone: string, text: string) => {
    let cleanPhone = phone.replace(/\D/g, '')
    
    const res = await apiFetch('/send', 'POST', {
      sessionId: salonId,
      phone: cleanPhone,
      message: text
    })
    return res
  },

  disconnect: async (salonId: string) => {
    return await apiFetch(`/session/${salonId}`, 'DELETE')
  },

  health: async () => {
    const res = await apiFetch('/health')
    return { 
      online: res.status === 'ok', 
      url: API_URL,
      sessions: res.sessions,
      connected: res.connected
    }
  }
}

export async function sendWhatsAppMessage(salonId: string, phone: string, message: string) {
  return whatsappManager.sendText(salonId, phone, message)
}

export async function getWhatsAppStatus(salonId: string) {
  return whatsappManager.status(salonId)
}

export async function getWhatsAppQR(salonId: string) {
  return whatsappManager.qr(salonId)
}
