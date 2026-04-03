import { evolution } from '@/lib/evolution'

export async function GET() {
  try {
    // Buscar conversas via Evolution API
    const chatsResponse = await evolutionFetch('/chat/get30ChatsWithMessages/' + process.env.EVOLUTION_INSTANCE)
    
    if (chatsResponse && chatsResponse.chats) {
      // Formatar conversas
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

// Função auxiliar para chamada na Evolution API
async function evolutionFetch(endpoint: string, method: string = 'GET', body?: any) {
  const apiUrl = process.env.EVOLUTION_API_URL || ''
  const apiKey = process.env.EVOLUTION_API_KEY || ''
  
  const url = `${apiUrl}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    'apikey': apiKey
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
