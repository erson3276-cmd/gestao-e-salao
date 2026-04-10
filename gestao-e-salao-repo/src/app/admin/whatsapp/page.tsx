'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, QrCode, CheckCircle2, XCircle, Loader2, RefreshCw, Smartphone, Unlink } from 'lucide-react'

export default function WhatsAppPage() {
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [error, setError] = useState('')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    const salonIdFromStorage = localStorage.getItem('salonId')
    if (salonIdFromStorage) {
      const id = `salon-${salonIdFromStorage.slice(0, 8)}`
      setSessionId(id)
    } else {
      setSessionId('default-salon')
    }
  }, [])

  useEffect(() => {
    if (sessionId) {
      checkStatus()
    } else {
      setLoading(false)
    }
  }, [sessionId])

  async function checkStatus() {
    if (!sessionId) return
    try {
      const res = await fetch(`/api/whatsapp-local/status?sessionId=${sessionId}`)
      const data = await res.json()
      setStatus(data)
      if (data.qr) {
        setQrCode(data.qr)
      }
      setLoading(false)
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  async function handleConnect() {
    setConnecting(true)
    setError('')
    try {
      const res = await fetch('/api/whatsapp-local/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
      const data = await res.json()
      
      if (data.success) {
        if (data.qr) {
          setQrCode(data.qr)
          setStatus({ connected: false, status: 'waiting_for_scan' })
        } else if (data.connected) {
          setStatus({ connected: true })
        }
      } else {
        setError(data.error || 'Erro ao conectar')
      }
    } catch (e: any) {
      setError(e.message)
    }
    setConnecting(false)
  }

  async function handleDisconnect() {
    setConnecting(true)
    try {
      await fetch('/api/whatsapp-local/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
      setStatus({ connected: false })
      setQrCode(null)
    } catch (e: any) {
      setError(e.message)
    }
    setConnecting(false)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (qrCode && !status?.connected) {
        checkStatus()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [qrCode, status?.connected])

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
                <p className="text-sm text-gray-500">Pronto para enviar mensagens!</p>
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
              <p className="text-sm text-emerald-400 font-bold">✓ Tudo funcionando!</p>
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
            {qrCode ? (
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-4">Escaneie o QR Code abaixo:</p>
                <div className="bg-white p-4 rounded-2xl inline-block">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                </div>
                <p className="text-xs text-gray-500 mt-4">O QR Code expira em 60 segundos. Atualize se necessário.</p>
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="mt-4 px-6 py-2 bg-[#5E41FF] text-white rounded-xl font-bold text-sm"
                >
                  <RefreshCw size={16} className="inline mr-2" /> Atualizar QR Code
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full py-4 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-[#5E41FF]/90 disabled:opacity-50"
              >
                {connecting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <><QrCode size={18} /> Conectar WhatsApp</>
                )}
              </button>
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
            <span>Conecte seu WhatsApp escaneando o QR Code</span>
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
