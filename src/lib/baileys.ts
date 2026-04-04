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
  status: async (instanceName: string) => {
    try {
      const res = await evolutionFetch(`/instance/connectionState/${instanceName}`)
      if (res.instance?.status === 'open' || res.state === 'open') {
        return { connected: true, state: 'connected', hasSession: true }
      }
      return { connected: false, state: res.instance?.status || res.state || 'disconnected', hasSession: false }
    } catch (e: any) {
      return { connected: false, state: 'error', hasSession: false }
    }
  },
  
  createInstance: async (instanceName: string) => {
    try {
      const res = await evolutionFetch('/instance/create', 'POST', {
        instanceName,
        integration: 'WHATSAPP-BAILEYS',
        qrcode: false
      })
      return res
    } catch (e: any) {
      return { error: e.message }
    }
  },
  
  connect: async (instanceName: string) => {
    try {
      const res = await evolutionFetch(`/instance/connect/${instanceName}`, 'POST')
      return res
    } catch (e: any) {
      return { message: e.message }
    }
  },
  
  qr: async (instanceName: string) => {
    try {
      const res = await evolutionFetch(`/instance/connect/${instanceName}`)
      if (res.qrcode) {
        return { qr: res.qrcode }
      }
      if (res.pairingCode) {
        return { code: res.pairingCode }
      }
      if (res.instance?.status === 'open') {
        return { qr: null, message: 'Já conectado!' }
      }
      return { qr: null, message: res.message || 'Aguardando QR code...' }
    } catch (e: any) {
      return { qr: null, message: e.message || 'Erro ao buscar QR code' }
    }
  },
  
  pairingCode: async (instanceName: string, phone: string) => {
    try {
      let cleanPhone = phone.replace(/\D/g, '')
      if (!cleanPhone.startsWith('55')) cleanPhone = '55' + cleanPhone
      
      const res = await evolutionFetch(`/instance/connect/${instanceName}?number=${cleanPhone}`)
      
      if (res.pairingCode) {
        return { code: res.pairingCode }
      }
      if (res.code) {
        return { code: res.code }
      }
      return { code: null, message: res.message || 'Erro ao gerar código' }
    } catch (e: any) {
      return { code: null, message: e.message || 'Erro ao gerar código' }
    }
  },
  
  sendText: async (instanceName: string, phone: string, text: string) => {
    try {
      let cleanPhone = phone.replace(/\D/g, '')
      if (!cleanPhone.startsWith('55')) cleanPhone = '55' + cleanPhone
      
      const res = await evolutionFetch(`/message/sendText/${instanceName}`, 'POST', {
        number: cleanPhone,
        text: text
      })
      return res
    } catch (error: any) {
      console.error('Send error:', error)
      throw error
    }
  },

  disconnect: async (instanceName: string) => {
    try {
      const res = await evolutionFetch(`/instance/logout/${instanceName}`, 'DELETE')
      return res
    } catch (e: any) {
      return { message: e.message }
    }
  }
}

export async function sendWhatsAppMessage(instanceName: string, phone: string, message: string) {
  return baileys.sendText(instanceName, phone, message)
}

export async function getWhatsAppStatus(instanceName: string) {
  return baileys.status(instanceName)
}

export async function getWhatsAppQR(instanceName: string) {
  return baileys.qr(instanceName)
}
