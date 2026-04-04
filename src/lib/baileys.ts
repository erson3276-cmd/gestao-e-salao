const API_URL = process.env.BAILEYS_API_URL || ''
const API_KEY = process.env.BAILEYS_API_KEY || ''

async function evolutionFetch(endpoint: string, method: string = 'GET', body?: any) {
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

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options)
    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('Evolution API error:', error)
    return { error: error.message }
  }
}

export const baileys = {
  status: async (instanceId: string) => {
    try {
      const res = await evolutionFetch(`/instance/${instanceId}/status`)
      if (res.instance?.status === 'open') {
        return { connected: true, state: 'connected', hasSession: true }
      }
      return { connected: false, state: res.instance?.status || 'disconnected', hasSession: false }
    } catch (e: any) {
      return { connected: false, state: 'error', hasSession: false }
    }
  },
  
  qr: async (instanceId: string) => {
    try {
      await evolutionFetch(`/instance/${instanceId}/connect`, 'POST')
      await new Promise(r => setTimeout(r, 5000))
      const res = await evolutionFetch(`/instance/${instanceId}/qrcode`)
      if (res.qrcode) {
        return { qr: res.qrcode }
      }
      if (res.instance?.status === 'open') {
        return { qr: null, message: 'Já conectado!' }
      }
      return { qr: null, message: res.message || 'Aguardando QR code...' }
    } catch (e: any) {
      return { qr: null, message: e.message || 'Erro ao buscar QR code' }
    }
  },
  
  pairingCode: async (instanceId: string, phone: string) => {
    try {
      await evolutionFetch(`/instance/${instanceId}/connect`, 'POST')
      await new Promise(r => setTimeout(r, 3000))
      
      const cleanPhone = phone.replace(/\D/g, '')
      const res = await evolutionFetch(`/instance/${instanceId}/pairingcode`, 'POST', { 
        phoneNumber: cleanPhone
      })
      
      if (res.code) {
        return { code: res.code }
      }
      if (res.pairingCode) {
        return { code: res.pairingCode }
      }
      return { code: null, message: res.message || 'Erro ao gerar código' }
    } catch (e: any) {
      return { code: null, message: e.message || 'Erro ao gerar código' }
    }
  },
  
  sendText: async (instanceId: string, phone: string, text: string) => {
    try {
      let cleanPhone = phone.replace(/\D/g, '')
      if (!cleanPhone.startsWith('55')) cleanPhone = '55' + cleanPhone
      
      const res = await evolutionFetch(`/message/sendText/${instanceId}`, 'POST', {
        number: cleanPhone,
        text: text
      })
      return res
    } catch (error: any) {
      console.error('Send error:', error)
      throw error
    }
  },

  connect: async (instanceId: string) => {
    try {
      const res = await evolutionFetch(`/instance/${instanceId}/connect`, 'POST')
      return res
    } catch (e: any) {
      return { message: e.message }
    }
  },

  disconnect: async (instanceId: string) => {
    try {
      const res = await evolutionFetch(`/instance/${instanceId}/logout`, 'POST')
      return res
    } catch (e: any) {
      return { message: e.message }
    }
  },

  createInstance: async (instanceId: string) => {
    try {
      const res = await evolutionFetch('/instance/create', 'POST', {
        instanceName: instanceId,
        qrcode: true
      })
      return res
    } catch (e: any) {
      return { error: e.message }
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
