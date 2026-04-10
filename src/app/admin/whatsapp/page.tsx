'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, QrCode, CheckCircle2, XCircle, Loader2, RefreshCw, Smartphone, Link, Unlink, Copy } from 'lucide-react'

export default function WhatsAppPage() {
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [error, setError] = useState('')
  const [serverHealth, setServerHealth] = useState<any>(null)
  const [phone, setPhone] = useState('')
  const [pairingCode, setPairingCode] = useState('')
  const [showPhoneInput, setShowPhoneInput] = useState(false)

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

  async function handlePairingCode() {
    if (!phone) {
      setError('Digite o número do WhatsApp')
      return
    }

    setConnecting(true)
    setError('')
    setPairingCode('')

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
        setError(data.error || 'Erro ao gerar código')
      }
    } catch (e: any) {
      setError(e.message)
    }
    setConnecting(false)
  }

  async function handleConnect() {
    setConnecting(true)
    setError('')
    try {
      const res = await fetch('/api/salon-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' })
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

  function copyCode() {
    navigator.clipboard.writeText(pairingCode)
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

        {pairingCode && (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Código de Pareamento:</p>
            <div className="flex items-center justify-center gap-4">
              <p className="text-4xl font-black tracking-widest text-emerald-400">{pairingCode}</p>
              <button onClick={copyCode} className="p-2 hover:bg-white/10 rounded-lg" title="Copiar">
                <Copy size={20} className="text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">Digite este código no seu WhatsApp</p>
          </div>
        )}

        {status?.connected ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-sm text-emerald-400 font-bold">✓ Funcionando!</p>
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
            {/* Phone Input for Pairing */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-400">
                Número do WhatsApp (apenas dígitos)
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="21999999999"
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#5E41FF] transition-all"
                />
                <button
                  onClick={handlePairingCode}
                  disabled={connecting || !serverHealth?.online || phone.length < 10}
                  className="px-6 py-3 bg-[#5E41FF] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#5E41FF]/90 disabled:opacity-50"
                >
                  {connecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Link size={18} />}
                  Gerar Código
                </button>
              </div>
              <p className="text-xs text-gray-500">Digite o número com DDD, ex: 21999999999</p>
            </div>

            {/* QR Code Option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#121021] px-2 text-gray-500">ou</span>
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={connecting || !serverHealth?.online}
              className="w-full py-4 bg-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/20 disabled:opacity-50"
            >
              {connecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><QrCode size={18} /> Escanear QR Code</>}
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
            <span>Conecte seu WhatsApp usando código de pareamento ou QR Code</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#5E41FF]/20 flex items-center justify-center text-[#5E41FF] text-xs font-bold shrink-0">2</div>
            <span>Quando um cliente agendar, você receberá uma notificação de confirmação</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#5E41FF]/20 flex items-center justify-center text-[#5E41FF] text-xs font-bold shrink-0">3</div>
            <span>Um lembrete automático será enviado 2h antes do atendimento</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
