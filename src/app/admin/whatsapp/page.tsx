'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, QrCode, Wifi, WifiOff, Loader2, LogOut, RefreshCw, Copy, Check, Smartphone, Maximize2, X } from 'lucide-react'

export default function WhatsAppPage() {
  const [status, setStatus] = useState<any>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [polling, setPolling] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [phone, setPhone] = useState('')
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [pairingLoading, setPairingLoading] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  async function loadStatus() {
    try {
      const res = await fetch('/api/salon-whatsapp')
      const data = await res.json()
      setStatus(data)
      if (data.connected) {
        setQrCode(null)
        setConnecting(false)
        setPairingCode(null)
      }
    } catch (e) {
      console.error('Error loading WhatsApp status:', e)
    }
  }

  async function handleConnect() {
    setConnecting(true)
    setQrCode(null)
    setPairingCode(null)
    try {
      const res = await fetch('/api/salon-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' })
      })
      const data = await res.json()
      if (data.qr) {
        setQrCode(data.qr)
        startPolling()
      }
    } catch (e) {
      console.error('Error connecting:', e)
    }
  }

  async function handlePairingCode() {
    if (!phone || phone.length < 10) {
      alert('Digite o número com DDD (ex: 21982755539)')
      return
    }
    setPairingLoading(true)
    try {
      const res = await fetch('/api/salon-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pairingCode', phone })
      })
      const data = await res.json()
      if (data.code) {
        setPairingCode(data.code)
      } else {
        alert('Erro ao gerar código. Tente novamente.')
      }
    } catch (e) {
      console.error('Error pairing:', e)
    } finally {
      setPairingLoading(false)
    }
  }

  async function handleDisconnect() {
    setLoading(true)
    try {
      await fetch('/api/salon-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' })
      })
      setStatus({ connected: false, instanceId: null })
      setQrCode(null)
      setConnecting(false)
      setPairingCode(null)
    } catch (e) {
      console.error('Error disconnecting:', e)
    } finally {
      setLoading(false)
    }
  }

  function startPolling() {
    setPolling(true)
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/salon-whatsapp')
        const data = await res.json()
        setStatus(data)
        if (data.connected) {
          setQrCode(null)
          setPairingCode(null)
          setPolling(false)
          setConnecting(false)
          clearInterval(interval)
        }
      } catch { /* keep polling */ }
    }, 3000)
    setTimeout(() => {
      clearInterval(interval)
      setPolling(false)
    }, 120000)
  }

  function copyInstanceId() {
    if (status?.instanceId) {
      navigator.clipboard.writeText(status.instanceId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black italic uppercase flex items-center gap-3">
          <MessageSquare className="text-[#5E41FF]" size={28} /> WhatsApp
        </h1>
        <p className="text-gray-500 text-sm mt-1">Conecte o WhatsApp do seu salão para enviar confirmações automáticas.</p>
      </div>

      {/* Status Card */}
      <div className={`p-8 rounded-3xl border ${status?.connected ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[#121021]/50 border-white/5'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {status?.connected ? (
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Wifi className="text-emerald-500" size={24} />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <WifiOff className="text-red-500" size={24} />
              </div>
            )}
            <div>
              <p className="text-lg font-black uppercase italic">{status?.connected ? 'Conectado' : 'Desconectado'}</p>
              {status?.instanceId && (
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs text-gray-600 font-mono">{status.instanceId}</code>
                  <button onClick={copyInstanceId} className="text-gray-600 hover:text-white transition-colors">
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {status?.connected && (
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <><LogOut size={14} /> Desconectar</>}
              </button>
            )}
            <button
              onClick={loadStatus}
              className="p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all"
            >
              <RefreshCw size={16} className={`text-gray-400 ${polling ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Connection Options */}
        {!status?.connected && (
          <div className="space-y-6">
            {/* Option 1: Pairing Code (for mobile) */}
            <div className="p-6 bg-black/30 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="text-[#5E41FF]" size={20} />
                <h3 className="text-sm font-black uppercase">Código de Pareamento (Celular)</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">Digite seu número com DDD. Um código de 6 dígitos aparecerá para você digitar no WhatsApp do celular.</p>
              <div className="flex gap-3">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 21982755539"
                  className="flex-1 p-3 bg-black/40 border border-white/10 rounded-xl text-sm outline-none focus:border-[#5E41FF]/50"
                />
                <button
                  onClick={handlePairingCode}
                  disabled={pairingLoading || !phone}
                  className="px-6 py-3 bg-[#5E41FF] text-white rounded-xl text-sm font-black uppercase hover:bg-[#4a33cc] transition-all disabled:opacity-50"
                >
                  {pairingLoading ? <Loader2 size={16} className="animate-spin" /> : 'Gerar Código'}
                </button>
              </div>
              {pairingCode && (
                <div className="mt-4 p-4 bg-[#5E41FF]/10 border border-[#5E41FF]/20 rounded-xl text-center">
                  <p className="text-xs text-gray-400 mb-2">Seu código de pareamento:</p>
                  <p className="text-4xl font-black text-[#5E41FF] tracking-widest">{pairingCode}</p>
                  <p className="text-xs text-gray-500 mt-2">Abra o WhatsApp → Aparelhos conectados → Conectar com código</p>
                </div>
              )}
            </div>

            {/* Option 2: QR Code (for desktop) */}
            <div className="p-6 bg-black/30 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <QrCode className="text-[#5E41FF]" size={20} />
                  <h3 className="text-sm font-black uppercase">QR Code (Computador)</h3>
                </div>
                {qrCode && (
                  <button onClick={() => setShowQrModal(true)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                    <Maximize2 size={16} className="text-gray-400" />
                  </button>
                )}
              </div>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-black uppercase hover:bg-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {connecting ? <><Loader2 size={16} className="animate-spin" /> Conectando...</> : <><QrCode size={16} /> Gerar QR Code</>}
              </button>
              {connecting && polling && (
                <div className="mt-4 text-center">
                  <div className="w-8 h-8 border-2 border-[#5E41FF]/30 border-t-[#5E41FF] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Aguardando leitura do QR Code...</p>
                  {qrCode && (
                    <p className="text-xs text-gray-600 mt-1">Clique no ícone de expandir para ver o QR Code em tela cheia</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-6 bg-[#121021]/50 border border-white/5 rounded-2xl space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Como conectar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-bold text-[#5E41FF] mb-2">📱 No Celular (Código)</h4>
            <ol className="space-y-2">
              <li className="text-xs text-gray-500">1. Digite seu número com DDD acima</li>
              <li className="text-xs text-gray-500">2. Clique em "Gerar Código"</li>
              <li className="text-xs text-gray-500">3. Abra o WhatsApp no celular</li>
              <li className="text-xs text-gray-500">4. Configurações → Aparelhos conectados</li>
              <li className="text-xs text-gray-500">5. "Conectar com código" → Digite o código</li>
            </ol>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#5E41FF] mb-2">💻 No Computador (QR Code)</h4>
            <ol className="space-y-2">
              <li className="text-xs text-gray-500">1. Clique em "Gerar QR Code"</li>
              <li className="text-xs text-gray-500">2. Abra o WhatsApp no celular</li>
              <li className="text-xs text-gray-500">3. Configurações → Aparelhos conectados</li>
              <li className="text-xs text-gray-500">4. Escaneie o QR Code na tela</li>
            </ol>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && qrCode && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={() => setShowQrModal(false)}>
          <div className="relative bg-[#121021] border border-white/10 rounded-3xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-all">
              <X size={20} className="text-gray-400" />
            </button>
            <h3 className="text-center text-sm font-black uppercase text-gray-400 mb-6">Escaneie o QR Code</h3>
            <div className="w-64 h-64 mx-auto bg-white rounded-2xl flex items-center justify-center mb-4">
              {qrCode.startsWith('data:') ? (
                <img src={qrCode} alt="QR Code" className="w-56 h-56" />
              ) : (
                <QrCode size={80} className="text-gray-800" />
              )}
            </div>
            <p className="text-center text-xs text-gray-500">Abra o WhatsApp → Aparelhos conectados → Conectar aparelho</p>
          </div>
        </div>
      )}
    </div>
  )
}
