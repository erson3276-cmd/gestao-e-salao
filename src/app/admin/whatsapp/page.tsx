'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Wifi, WifiOff, Loader2, LogOut, RefreshCw, Copy, Check, Smartphone } from 'lucide-react'

export default function WhatsAppPage() {
  const [status, setStatus] = useState<{connected?: boolean; instanceId?: string} | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
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
    } catch (e) {
      console.error('Error loading WhatsApp status:', e)
    }
  }

  async function handlePairingCode() {
    if (!phone || phone.length < 10) {
      alert('Digite o número com DDD (ex: 99 999999999)')
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
        alert('Erro ao gerar código: ' + (data.error || 'Tente novamente.'))
      }
    } catch (e) {
      console.error('Error pairing:', e)
      alert('Erro ao conectar com servidor.')
    } finally {
      setPairingLoading(false)
    }
  }

  async function handleDisconnect() {
    if (!confirm('Desconectar WhatsApp?')) return
    setLoading(true)
    try {
      await fetch('/api/salon-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' })
      })
      setStatus({ connected: false, instanceId: null })
      setPairingCode(null)
    } catch (e) {
      console.error('Error disconnecting:', e)
    } finally {
      setLoading(false)
    }
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
              <RefreshCw size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Pairing Code Section */}
        {!status?.connected && (
          <div className="p-6 bg-black/30 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="text-[#5E41FF]" size={20} />
              <h3 className="text-sm font-black uppercase">Código de Pareamento</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">Digite seu número com DDD. Um código de 6 dígitos aparecerá para você digitar no WhatsApp.</p>
            <div className="flex gap-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="11999999999"
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
                <p className="text-xs text-gray-400 mb-2">Código de pareamento:</p>
                <p className="text-4xl font-black text-[#5E41FF] tracking-widest">{pairingCode}</p>
                <p className="text-xs text-gray-500 mt-3">WhatsApp → Configurações → Aparelhos conectados → Conectar com código</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-6 bg-[#121021]/50 border border-white/5 rounded-2xl space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Como conectar</h3>
        <ol className="space-y-2">
          <li className="text-xs text-gray-500">1. Digite seu número de WhatsApp com DDD acima</li>
          <li className="text-xs text-gray-500">2. Clique em "Gerar Código"</li>
          <li className="text-xs text-gray-500">3. Abra o WhatsApp no celular</li>
          <li className="text-xs text-gray-500">4. Acesse Configurações → Aparelhos conectados</li>
          <li className="text-xs text-gray-500">5. Clique em "Conectar com código" e digite o código</li>
        </ol>
      </div>
    </div>
  )
}
