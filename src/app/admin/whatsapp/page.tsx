'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, QrCode, Wifi, WifiOff, Loader2, LogOut, RefreshCw, Copy, Check } from 'lucide-react'

export default function WhatsAppPage() {
  const [status, setStatus] = useState<any>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  async function loadStatus() {
    try {
      const res = await fetch('/api/salon-whatsapp')
      const data = await res.json()
      setStatus(data)
      if (data.connected && data.instanceId) {
        setQrCode(null)
        setConnecting(false)
      }
    } catch (e) {
      console.error('Error loading WhatsApp status:', e)
    }
  }

  async function handleConnect() {
    setConnecting(true)
    setQrCode(null)
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
          setPolling(false)
          clearInterval(interval)
        }
      } catch {
        // keep polling
      }
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

        {/* QR Code */}
        {connecting && !status?.connected && (
          <div className="p-8 bg-black/40 rounded-2xl border border-white/5 text-center">
            {polling ? (
              <div className="space-y-4">
                <div className="w-8 h-8 border-2 border-[#5E41FF]/30 border-t-[#5E41FF] rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-400">Aguardando leitura do QR Code...</p>
                <p className="text-xs text-gray-600">Abra o WhatsApp no celular → Configurações → Aparelhos conectados → Conectar</p>
              </div>
            ) : qrCode ? (
              <div className="space-y-4">
                <div className="w-64 h-64 mx-auto bg-white rounded-2xl flex items-center justify-center">
                  {qrCode.startsWith('data:') ? (
                    <img src={qrCode} alt="QR Code" className="w-56 h-56" />
                  ) : (
                    <QrCode size={80} className="text-gray-800" />
                  )}
                </div>
                <p className="text-sm text-gray-400">Escaneie o QR Code com seu WhatsApp</p>
                <p className="text-xs text-gray-600">WhatsApp → Configurações → Aparelhos conectados → Conectar aparelho</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Loader2 size={32} className="animate-spin mx-auto text-[#5E41FF]" />
                <p className="text-sm text-gray-400">Gerando QR Code...</p>
              </div>
            )}
          </div>
        )}

        {/* Connect Button */}
        {!status?.connected && !connecting && (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full py-4 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all border-b-4 border-[#3D28B8] shadow-xl shadow-[#5E41FF]/20 disabled:opacity-50"
          >
            <QrCode size={20} /> Conectar WhatsApp
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="p-6 bg-[#121021]/50 border border-white/5 rounded-2xl space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Como conectar</h3>
        <ol className="space-y-3">
          {[
            'Clique em "Conectar WhatsApp" acima',
            'Abra o WhatsApp no seu celular',
            'Vá em Configurações → Aparelhos conectados',
            'Toque em "Conectar um aparelho"',
            'Escaneie o QR Code que aparecer na tela',
            'Pronto! As confirmações serão enviadas automaticamente'
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#5E41FF]/10 border border-[#5E41FF]/20 flex items-center justify-center text-[#5E41FF] text-xs font-black shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-gray-400">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
