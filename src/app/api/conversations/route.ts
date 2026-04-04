export async function GET() {
  try {
    const instanceId = process.env.BAILEYS_INSTANCE_ID || 'salao'
    const apiUrl = process.env.BAILEYS_API_URL
    const apiKey = process.env.BAILEYS_API_KEY
    
    if (!apiUrl) {
      return Response.json({ 
        success: false, 
        error: 'WhatsApp API não configurada',
        data: [],
        count: 0
      })
    }
    
    const url = `${apiUrl}/chat/get30ChatsWithMessages/${instanceId}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': apiKey || ''
    }
    
    const res = await fetch(url, { headers })
    
    if (!res.ok) {
      return Response.json({ 
        success: false, 
        error: 'Erro ao conectar com WhatsApp API',
        data: [],
        count: 0
      }, { status: 502 })
    }
    
    const chatsResponse = await res.json()
    
    if (chatsResponse && chatsResponse.chats) {
      const conversations = chatsResponse.chats.map((chat: any) => ({
        id: chat.id,
        name: chat.name || chat.id.split('@')[0],
        phone: chat.id.split('@')[0],
        lastMessage: chat.lastMessage || '',
        lastMessageTime: chat.lastMessageTime || '',
        unreadCount: chat.unreadCount || 0,
        messages: chat.messages || []
      })).sort((a: any, b: any) => {
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      })

      return Response.json({ 
        success: true, 
        data: conversations,
        count: conversations.length
      })
    }

    return Response.json({ 
      success: true, 
      data: [],
      count: 0,
      message: 'Nenhuma conversa encontrada'
    })

  } catch (error: any) {
    console.error('Erro ao buscar conversas:', error)
    return Response.json({ 
      error: error.message || 'Erro ao buscar conversas',
      success: false 
    }, { status: 500 })
  }
}
