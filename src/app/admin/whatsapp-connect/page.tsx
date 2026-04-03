'use client'

import { useEffect, useState } from 'react'

export default function QRConnectPage() {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [status, setStatus] = useState('Conectando...')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchQR() {
      try {
        const res = await fetch('/api/wa-qr-store')
        const data = await res.json()
        
        if (data.state === 'connected') {
          setStatus('WhatsApp Conectado!')
          setQrCode(null)
          setLoading(false)
        } else if (data.qr) {
          setQrCode(data.qr)
          setStatus('Aguardando scan...')
          setLoading(false)
        } else {
          setStatus(data.message || 'Gerando QR Code...')
          setTimeout(fetchQR, 3000)
        }
      } catch {
        setStatus('Erro ao conectar. Tentando novamente...')
        setTimeout(fetchQR, 5000)
      }
    }

    fetchQR()
    const interval = setInterval(fetchQR, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#25D366] to-[#128C7E] bg-clip-text text-transparent">
          Gestão<span className="text-[#5E41FF]">E</span>Salão
        </h1>
        <p className="text-gray-400 mb-6 text-sm">Conecte seu WhatsApp para receber mensagens automáticas</p>
        
        <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6 ${
          status.includes('Conectado') ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
        }`}>
          {status}
        </div>
        
        {loading ? (
          <div className="text-gray-500 py-10">Gerando QR Code...</div>
        ) : qrCode ? (
          <>
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </div>
            <div className="bg-[#0f0f23] rounded-xl p-4 text-left text-sm text-gray-400 space-y-2">
              <p className="text-white font-semibold mb-2">Como conectar:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Abra o <strong className="text-white">WhatsApp</strong> no celular</li>
                <li>Vá em <strong className="text-white">Configurações</strong> → <strong className="text-white">Aparelhos conectados</strong></li>
                <li>Toque em <strong className="text-white">Conectar aparelho</strong></li>
                <li>Escaneie o QR code acima</li>
              </ol>
            </div>
          </>
        ) : (
          <div className="text-gray-500 py-10">{status}</div>
        )}
      </div>
    </div>
  )
}
