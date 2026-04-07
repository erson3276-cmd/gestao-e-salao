const API_URL = 'http://167.234.248.199:8080'
const API_KEY = ''  // AUTH_TYPE=none
const INSTANCE = 'salao'

export async function evolutionFetch(endpoint: string, method: string = 'GET', body?: any) {
  const headers = {
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

export const evolution = {
  // Conectar e pegar QR Code
  connect: () => evolutionFetch(`/instance/connect/${INSTANCE}`),
  
  // Ver status da conexão
  status: () => evolutionFetch(`/instance/connectionState/${INSTANCE}`),
  
  // Desconectar (Logout)
  logout: () => evolutionFetch(`/instance/logout/${INSTANCE}`, 'DELETE'),
  
  // Enviar mensagem de texto
  sendText: (phone: string, text: string) => {
    let cleanPhone = phone.replace(/\D/g, '')
    if (!cleanPhone.startsWith('55')) cleanPhone = '55' + cleanPhone
    
    return evolutionFetch(`/message/sendText/${INSTANCE}`, 'POST', {
      number: cleanPhone,
      text: text
    })
  }
}
