'use client'

import { useEffect, useState, useRef } from 'react'
import { 
  MessageCircle, 
  Send, 
  Search, 
  Phone,
  Wifi,
  WifiOff,
  RefreshCw,
  QrCode,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  ArrowLeft,
  Check,
  CheckCheck,
  LogOut
} from 'lucide-react'
import { format, parseISO, isToday, isYesterday } from 'date-fns'

interface WhatsAppMessage {
  id: string
  phone: string
  message: string
  status: string
  created_at: string
  sent_at: string | null
  error: string | null
}

interface Conversation {
  id: string
  phone: string
  name: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export default function ManagerTalkPage() {
  const [waMessages, setWaMessages] = useState<WhatsAppMessage[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [waConnected, setWaConnected] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkStatus()
    fetchWhatsAppMessages()
    const interval = setInterval(() => {
      checkStatus()
      fetchWhatsAppMessages()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedChat) {
      setMessages(waMessages.filter(m => m.phone === selectedChat.phone))
    }
  }, [selectedChat, waMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function checkStatus() {
    try {
      const res = await fetch('/api/wa-status')
      const data = await res.json()
      setWaConnected(data.connected === true)
    } catch {
      setWaConnected(false)
    }
  }

  async function fetchWhatsAppMessages() {
    try {
      const res = await fetch('/api/whatsapp-messages')
      const data = await res.json()
      if (data.success) {
        setWaMessages(data.data)
        
        // Build conversations from messages
        const convMap = new Map<string, Conversation>()
        for (const msg of data.data) {
          if (!convMap.has(msg.phone)) {
            convMap.set(msg.phone, {
              id: msg.phone,
              phone: msg.phone,
              name: msg.phone,
              lastMessage: msg.message,
              lastMessageTime: msg.created_at,
              unreadCount: 0
            })
          } else {
            const conv = convMap.get(msg.phone)!
            if (new Date(msg.created_at) > new Date(conv.lastMessageTime)) {
              conv.lastMessage = msg.message
              conv.lastMessageTime = msg.created_at
            }
          }
        }
        setConversations(Array.from(convMap.values()).sort((a, b) => 
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        ))
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedChat || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: selectedChat.phone,
          message: newMessage.trim()
        })
      })
      const data = await res.json()
      
      if (data.success) {
        setNewMessage('')
        fetchWhatsAppMessages()
      }
    } catch (e) {
      console.error(e)
    }
    setSending(false)
  }

  async function handleDisconnect() {
    if (!confirm('Deseja desconectar o WhatsApp? Será necessário escanear um novo QR Code.')) return
    
    try {
      await fetch('/api/wa-disconnect', { method: 'POST' })
      setWaConnected(false)
      setQrCode(null)
      setShowQRModal(true)
    } catch (e) {
      console.error(e)
    }
  }

  function formatTime(timestamp: string) {
    if (!timestamp) return ''
    const date = parseISO(timestamp)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    }
    if (isYesterday(date)) {
      return 'Ontem ' + format(date, 'HH:mm')
    }
    return format(date, 'dd/MM HH:mm')
  }

  function formatPhone(phone: string) {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 12) {
      return `(${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
    }
    return phone
  }

  const filteredConversations = conversations.filter(c => {
    if (!search) return true
    return c.name.toLowerCase().includes(search.toLowerCase()) ||
           c.phone.includes(search)
  })

  return (
    <div className="h-[calc(100vh-80px)] flex bg-[#0A0A0A]">
      {/* QR Code Modal */}
      {showQRModal && !waConnected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121021] rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <QrCode className="text-emerald-400" />
                Conectar WhatsApp
              </h2>
              <button 
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">
              Escaneie o QR code com seu WhatsApp para conectar
            </p>
            
            <div className="bg-white p-4 rounded-xl mb-4">
              <p className="text-center text-gray-500">QR Code será gerado automaticamente pelo servidor</p>
              <p className="text-center text-xs text-gray-400 mt-2">O WhatsApp está sendo configurado no servidor...</p>
            </div>
            
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Lista de conversas */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r border-white/10 bg-[#0A0A0A]`}>
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageCircle size={24} className="text-emerald-400" />
              <h1 className="text-xl font-bold">Conversas</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${waConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-xs text-gray-400">
                {waConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          
          {!waConnected && (
            <div className="mb-3 p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-left">
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <QrCode size={18} />
                <span>WhatsApp não conectado</span>
              </div>
            </div>
          )}
          
          {/* Busca */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar conversa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#121021] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-emerald-400" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-gray-500 px-4">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">Nenhuma conversa encontrada</p>
              <p className="text-xs mt-1">As conversas aparecerão quando mensagens forem enviadas</p>
            </div>
          ) : (
            filteredConversations.map(chat => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-all border-b border-white/5 ${
                  selectedChat?.id === chat.id ? 'bg-emerald-500/10' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium truncate">{formatPhone(chat.phone)}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer com refresh */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={fetchWhatsAppMessages}
            className="w-full flex items-center justify-center gap-2 py-2 bg-[#121021] rounded-xl text-sm text-gray-400 hover:text-white transition-all"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Área de chat */}
      <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#0A0A0A]`}>
        {selectedChat ? (
          <>
            {/* Header do chat */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-2 hover:bg-white/10 rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <User size={18} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold">{formatPhone(selectedChat.phone)}</h2>
                <p className="text-xs text-gray-500">{selectedChat.phone}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                waConnected 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {waConnected ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {waConnected ? 'Online' : 'Offline'}
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={24} className="animate-spin text-emerald-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Nenhuma mensagem nesta conversa</p>
                  </div>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.status === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      msg.status === 'sent'
                        ? 'bg-emerald-500 text-white rounded-br-md'
                        : msg.status === 'failed'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30 rounded-bl-md'
                        : 'bg-[#121021] text-white border border-white/10 rounded-bl-md'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${
                        msg.status === 'sent' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                        {msg.status === 'sent' && <CheckCheck size={14} />}
                        {msg.status === 'failed' && <XCircle size={14} />}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensagem */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder={waConnected ? "Digite uma mensagem..." : "WhatsApp offline"}
                    disabled={!waConnected}
                    rows={1}
                    className="w-full bg-[#121021] border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all resize-none disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending || !waConnected}
                  className="p-3 bg-emerald-500 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">Selecione uma conversa</p>
              <p className="text-sm opacity-60">Veja e responda mensagens dos clientes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
