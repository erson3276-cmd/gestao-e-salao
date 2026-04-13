'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Clock, QrCode, Loader2, Copy, Check } from 'lucide-react'
import { salonLogout } from '@/app/actions/salon-auth'

export default function SubscriptionExpiredPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    if (showPayment && !paymentData) {
      createPayment()
    }
  }, [showPayment])

  async function createPayment() {
    setLoading(true)
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'monthly', billingType: 'PIX' })
      })
      const data = await res.json()
      if (data.success) {
        setPaymentData(data.payment)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    setLoading(true)
    await salonLogout()
    router.push('/login')
  }

  function copyPix() {
    if (paymentData?.pixCopiaECola) {
      navigator.clipboard.writeText(paymentData.pixCopiaECola)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (showPayment && paymentData) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="w-20 h-20 mx-auto bg-[#5E41FF]/10 border border-[#5E41FF]/20 rounded-[2rem] flex items-center justify-center">
            <QrCode className="w-10 h-10 text-[#5E41FF]" />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tighter italic uppercase text-white/90 mb-3">
              Assine para Continuar
            </h1>
            <p className="text-gray-500 text-sm">
              Escaneie o QR Code ou copie o PIX para pagar
            </p>
          </div>

          <div className="bg-[#121021]/50 border border-[#5E41FF]/10 rounded-[2rem] p-8 space-y-6">
            {paymentData.pixQrCode ? (
              <div className="bg-white p-4 rounded-xl">
                <img src={paymentData.pixQrCode} alt="PIX QR Code" className="w-full max-w-[200px] mx-auto" />
              </div>
            ) : (
              <div className="bg-white p-4 rounded-xl flex items-center justify-center">
                <QrCode className="w-32 h-32 text-black" />
              </div>
            )}

            <div className="p-4 bg-black/30 rounded-2xl">
              <p className="text-sm font-bold text-white">Valor</p>
              <p className="text-3xl font-black text-[#5E41FF]">R$ 49,90<span className="text-sm text-gray-500 font-bold">/mês</span></p>
            </div>

            <div className="space-y-3">
              <button
                onClick={copyPix}
                className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10"
              >
                {copied ? <><Check size={16} className="text-emerald-400" /> Copiado!</> : <><Copy size={16} /> Copiar Código PIX</>}
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-[#5E41FF] text-white rounded-xl font-black"
              >
                Já Paguei - Verificar
              </button>

              <button
                onClick={() => setShowPayment(false)}
                className="w-full py-3 text-gray-500 text-sm hover:text-white"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="w-20 h-20 mx-auto bg-yellow-500/10 border border-yellow-500/20 rounded-[2rem] flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-yellow-500" />
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tighter italic uppercase text-white/90 mb-3">
            Teste Grátis Expirado
          </h1>
          <p className="text-gray-500 text-sm">
            Seu período de teste terminou. Para continuar usando o Gestão E Salão, assine agora.
          </p>
        </div>

        <div className="bg-[#121021]/50 border border-yellow-500/10 rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-black/30 rounded-2xl">
            <Clock className="text-yellow-500 shrink-0" size={24} />
            <div className="text-left">
              <p className="text-sm font-bold text-white">Plano Mensal</p>
              <p className="text-2xl font-black text-[#5E41FF]">R$ 49,90<span className="text-sm text-gray-500 font-bold">/mês</span></p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/admin/assinatura')}
              disabled={loading}
              className="w-full py-4 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#5E41FF]/90 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>ASSINAR AGORA</>}
            </button>

            <button
              onClick={() => setShowPayment(true)}
              className="w-full py-3 bg-white/5 border border-white/10 text-gray-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/10"
            >
              Ver opções de pagamento
            </button>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full py-4 bg-white/5 border border-white/10 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white/10 hover:text-white transition-all"
            >
              Sair da Conta
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-700">
          Pagamento rápido via PIX. Após confirmação, seu acesso é liberado instantaneamente.
        </p>
      </div>
    </main>
  )
}
