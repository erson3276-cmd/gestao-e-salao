'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, CheckCircle2, XCircle, Loader2, RefreshCw, Smartphone, Link, Copy } from 'lucide-react'

export default function WhatsAppPage() {
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [error, setError] = useState('')
  const [serverHealth, setServerHealth] = useState<any>(null)
  const [phone, setPhone] = useState('')
  const [pairingCode, setPairingCode] = useState('')

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
    if (!phone || phone.length < 10) {
      setError('Digite um número válido com DDD')
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
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode)
    }
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
        <p className="text-gray-500 text-sm mt-1">Conecte seu WhatsApp para enviar lembretes automáticos.</p>
      </div>

      {/* Server Status */}
      <div className={`p-6 rounded-3xl border ${serverHealth?.online ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <div className="flex items-center gap-4">
          {serverHealth?.online ? (
            <CheckCircle2 className="text-emerald-500" size={24} />
          ) : (
            <XCircle className="text-red-500" size={24} />
          )}
          <div>
            <p className="font-bold text-white">Servidor WhatsApp</p>
            <p className="text-sm text-gray-400">{serverHealth?.online ? 'Online' : 'Offline'}</p>
          </div>
          <button onClick={checkServer} className="ml-auto p-2 hover:bg-white/10 rounded-xl">
            <RefreshCw size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Connection Card */}
      <div className={`p-8 rounded-3xl border ${status?.connected ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[#121021] border-white/5'}`}>
        {status?.connected ? (
          <div className="text-center space-y-4">
            <Smartphone className="w-16 h-16 text-emerald-400 mx-auto" />
            <p className="text-xl font-black text-emerald-400">WhatsApp Conectado!</p>
            <p className="text-gray-500 text-sm">Lembretes automáticos estão ativos</p>
            <button
              onClick={handleDisconnect}
              className="mt-4 px-6 py-3 bg-red-600 text-white rounded-xl font-bold"
            >
              Desconectar
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg font-black text-white">Conectar WhatsApp</p>
            </div>

            {/* Phone Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-400">
                Número do WhatsApp (com DDD)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="21999999999"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-lg outline-none focus:border-[#5E41FF] transition-all"
              />
              <p className="text-xs text-gray-600">Digite apenas números, ex: 21999999999</p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {pairingCode && (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                <p className="text-sm text-gray-400 mb-2">Código de Pareamento:</p>
                <div className="flex items-center justify-center gap-4">
                  <p className="text-4xl font-black tracking-widest text-emerald-400">{pairingCode}</p>
                  <button onClick={copyCode} className="p-2 hover:bg-white/10 rounded-lg" title="Copiar">
                    <Copy size={20} className="text-gray-400" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-4">Digite este código no WhatsApp</p>
              </div>
            )}

            <button
              onClick={handlePairingCode}
              disabled={connecting || !serverHealth?.online || phone.length < 10}
              className="w-full py-4 bg-[#5E41FF] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-[#5E41FF]/90 disabled:opacity-50"
            >
              {connecting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Link size={24} />
                  Gerar Código de Pareamento
                </>
              )}
            </button>

            {!serverHealth?.online && (
              <p className="text-xs text-red-400 text-center">
                Servidor indisponível
              </p>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-6 bg-[#121021]/50 border border-white/5 rounded-3xl">
        <h3 className="font-bold text-white mb-4">Como conectar:</h3>
        <ol className="space-y-3 text-sm text-gray-400">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#5E41FF]/20 text-[#5E41FF] flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <span>Digite o número do WhatsApp que será conectado</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#5E41FF]/20 text-[#5E41FF] flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <span>Clique em "Gerar Código de Pareamento"</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#5E41FF]/20 text-[#5E41FF] flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <span>No WhatsApp, vá em Configurações &gt; Dispositivos Conectados &gt; Conectar um dispositivo</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#5E41FF]/20 text-[#5E41FF] flex items-center justify-center text-xs font-bold shrink-0">4</span>
            <span>Digite o código de pareamento exibido acima</span>
          </li>
        </ol>
      </div>
    </div>
  )
}
