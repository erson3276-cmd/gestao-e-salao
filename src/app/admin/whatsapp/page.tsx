'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, QrCode, CheckCircle2, XCircle, Loader2, RefreshCw, Smartphone, Link, Unlink } from 'lucide-react'

export default function WhatsAppPage() {
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [error, setError] = useState('')
  const [serverHealth, setServerHealth] = useState<any>(null)
  const [action, setAction] = useState<'connect' | 'pairing'>('connect')

  useEffect(() => {
    loadStatus()
    checkServer()
  }, [])

  async function loadStatus() {
    setLoading(true)
    try {
      const res = await fetch('/api/salon-whatsapp')
      const data = await res.json()
      setStatus(data)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  async function checkServer() {
    try {
      const res = await fetch('/api/salon-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'health' })
      })
      const data = await res.json()
      setServerHealth(data)
    } catch (e: any) {
      setServerHealth({ online: false, error: e.message })
    }
  }

  async function handleConnect() {
    setConnecting(true)
    setError('')
    try {
      const res = await fetch('/api/salon-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action === 'connect' ? 'connect' : 'pairingCode', phone: '21982755539' })
      })
      const data = await res.json()
      
      if (data.success) {
        setStatus({ connected: true, instanceId: data.code || data.qr, ...data })
      } else {
        setError(data.error || data.details || 'Erro ao conectar')
      }
    } catch (e: any) {
      setError(e.message)
    }
    setConnecting(false)
  }

  async function handleDisconnect() {
    setConnecting(true)
    try {
      await fetch('/api/salon-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' })
      })
      setStatus({ connected: false, instanceId: null })
    } catch (e: any) {
      setError(e.message)
    }
    setConnecting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#5E41FF] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black italic uppercase flex items-center gap-3">
          <MessageCircle className="text-[#5E41FF]" size={28} /> WhatsApp
        </h1>
        <p className="text-gray-500 text-sm mt-1">Conecte seu WhatsApp para enviar lembretes automáticos aos clientes.</p>
      </div>

      {/* Server Status */}
      <div className={`p-6 rounded-3xl border ${serverHealth?.online ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <div className="flex items-center gap-4">
          {serverHealth?.online ? (
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="text-emerald-500" size={24} />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <XCircle className="text-red-500" size={24} />
            </div>
          )}
          <div>
            <p className="font-bold text-white">Servidor WhatsApp</p>
            <p className="text-sm text-gray-400">{serverHealth?.online ? 'Online e disponível' : serverHealth?.error || 'Offline'}</p>
          </div>
          <button onClick={checkServer} className="ml-auto p-2 hover:bg-white/10 rounded-xl">
            <RefreshCw size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`p-8 rounded-3xl border ${status?.connected ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[#121021] border-white/5'}`}>
        <div className="flex items-center gap-4 mb-6">
          {status?.connected ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Smartphone className="text-emerald-500" size={24} />
              </div>
              <div>
                <p className="text-lg font-black uppercase italic text-emerald-400">WhatsApp Conectado</p>
                <p className="text-sm text-gray-500">Instance: {status.instanceId}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-[#5E41FF]/10 border border-[#5E41FF]/20 flex items-center justify-center">
                <QrCode className="text-[#5E41FF]" size={24} />
              </div>
              <div>
                <p className="text-lg font-black uppercase italic text-white">WhatsApp Não Conectado</p>
                <p className="text-sm text-gray-500">Conecte para enviar lembretes automáticos</p>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {status?.connected ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-sm text-emerald-400 font-bold">✓ everything funcionando!</p>
              <p className="text-xs text-gray-500 mt-1">Lembretes automáticos estão ativos.</p>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={connecting}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50"
            >
              {connecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Unlink size={18} /> Desconectar WhatsApp</>}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-3">
              <button
                onClick={() => setAction('connect')}
                className={`flex-1 p-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${action === 'connect' ? 'bg-[#5E41FF]/10 border-[#5E41FF]/40' : 'border-white/10 hover:border-white/20'}`}
              >
                <QrCode size={18} className={action === 'connect' ? 'text-[#5E41FF]' : 'text-gray-500'} />
                <span className="font-bold text-sm">QR Code</span>
              </button>
              <button
                onClick={() => setAction('pairing')}
                className={`flex-1 p-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${action === 'pairing' ? 'bg-[#5E41FF]/10 border-[#5E41FF]/40' : 'border-white/10 hover:border-white/20'}`}
              >
                <Link size={18} className={action === 'pairing' ? 'text-[#5E41FF]' : 'text-gray-500'} />
                <span className="font-bold text-sm">Código de Pareamento</span>
              </button>
            </div>

            <button
              onClick={handleConnect}
              disabled={connecting || !serverHealth?.online}
              className="w-full py-4 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-[#5E41FF]/90 disabled:opacity-50"
            >
              {connecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{action === 'connect' ? <QrCode size={18} /> : <Link size={18} />} Conectar WhatsApp</>}
            </button>

            {!serverHealth?.online && (
              <p className="text-xs text-gray-600 text-center">
                Servidor indisponível. Tente novamente mais tarde.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-6 bg-[#121021]/50 border border-white/5 rounded-3xl">
        <h3 className="font-bold text-white mb-4">Como funciona:</h3>
        <ul className="space-y-3 text-sm text-gray-400">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#5E41FF]/20 flex items-center justify-center text-[#5E41FF] text-xs font-bold shrink-0">1</div>
            <span>Conecte seu WhatsApp escaneando o QR Code ou usando código de pareamento</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#5E41FF]/20 flex items-center justify-center text-[#5E41FF] text-xs font-bold shrink-0">2</div>
            <span>Quando um cliente agendar, você receberá uma notificação de confirmação</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#5E41FF]/20 flex items-center justify-center text-[#5E41FF] text-xs font-bold shrink-0">3</div>
            <span>Um lembrete automático será enviado 24h antes do atendimento</span>
          </li>
        </ul>
      </div>
    </div>
  )
}