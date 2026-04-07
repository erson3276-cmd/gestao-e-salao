import { supabaseAdmin } from '@/lib/supabaseAdmin'

async function evolutionFetch(endpoint: string, method: string = 'GET', body?: any) {
  const apiUrl = process.env.BAILEYS_API_URL
  const apiKey = process.env.BAILEYS_API_KEY
  
  if (!apiUrl) return null
  
  const url = `${apiUrl}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': apiKey || ''
  }
  
  const options: RequestInit = {
    method,
    headers
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  try {
    const res = await fetch(url, options)
    return await res.json()
  } catch (error) {
    console.error('Evolution API error:', error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return Response.json({ error: 'Telefone é obrigatório' }, { status: 400 })
    }

    const instanceId = process.env.BAILEYS_INSTANCE_ID || 'salao'
    const messagesResponse = await evolutionFetch(
      `/chat/getMessages/${instanceId}/${phone}`
    )

    if (messagesResponse && messagesResponse.messages) {
      const messages = messagesResponse.messages.map((msg: any) => ({
        id: msg.key?.id || msg.key?.idMessage || '',
        from: msg.key?.fromMe ? 'me' : 'them',
        body: msg.message?.conversation || msg.message?.extendedTextMessage?.text || '',
        timestamp: msg.messageTimestamp ? new Date(msg.messageTimestamp * 1000).toISOString() : '',
        status: msg.status || 'delivered'
      }))

      return Response.json({ 
        success: true, 
        data: messages,
        phone
      })
    }

    return Response.json({ 
      success: true, 
      data: [],
      phone
    })

  } catch (error: any) {
    console.error('Erro ao buscar mensagens:', error)
    return Response.json({ 
      error: error.message || 'Erro ao buscar mensagens',
      success: false 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, message, customer_id, appointment_id } = body

    if (!phone || !message) {
      return Response.json({ error: 'Telefone e mensagem são obrigatórios' }, { status: 400 })
    }

    const instanceId = process.env.BAILEYS_INSTANCE_ID || 'salao'
    const cleanPhone = phone.replace(/\D/g, '')
    let brazilianPhone = cleanPhone
    if (!cleanPhone.startsWith('55')) brazilianPhone = '55' + cleanPhone

    const result = await evolutionFetch(`/message/sendText/${instanceId}`, 'POST', {
      number: brazilianPhone,
      text: message
    })

    if (result && result.key) {
      if (customer_id) {
        try {
          await supabaseAdmin.from('messages').insert({
            customer_id,
            phone,
            message,
            direction: 'outbound',
            appointment_id,
            status: 'sent'
          })
        } catch {
          // Ignora erro se tabela não existir
        }
      }

      return Response.json({ 
        success: true, 
        message: 'Mensagem enviada',
        key: result.key
      })
    }

    return Response.json({ 
      success: false,
      error: 'Erro ao enviar mensagem'
    }, { status: 500 })

  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error)
    return Response.json({ 
      error: error.message || 'Erro ao enviar mensagem',
      success: false 
    }, { status: 500 })
  }
}
