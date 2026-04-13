'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Clock, MessageCircle, ArrowLeft, CreditCard } from 'lucide-react'
import { salonLogout } from '@/app/actions/salon-auth'

export default function SubscriptionExpiredPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await salonLogout()
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="w-20 h-20 mx-auto bg-yellow-500/10 border border-yellow-500/20 rounded-[2rem] flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-yellow-500" />
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tighter italic uppercase text-white/90 mb-3">
            Assinatura Expirada
          </h1>
          <p className="text-gray-500 text-sm">
            Sua assinatura expirou. Para continuar usando o Gestão E Salão, renove agora.
          </p>
        </div>

        <div className="bg-[#121021]/50 border border-yellow-500/10 rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-black/30 rounded-2xl">
            <Clock className="text-yellow-500 shrink-0" size={24} />
            <div className="text-left">
              <p className="text-sm font-bold text-white">Valor da renovação</p>
              <p className="text-2xl font-black text-[#5E41FF]">R$ 49,90<span className="text-sm text-gray-500 font-bold">/mês</span></p>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="https://wa.me/5521982755539?text=Oi! Quero renovar minha assinatura do Gestão E Salão."
              target="_blank"
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all border-b-4 border-emerald-800"
            >
              <MessageCircle size={16} /> Renovar via WhatsApp
            </a>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full py-4 bg-white/5 border border-white/10 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white/10 hover:text-white transition-all"
            >
              <ArrowLeft size={16} /> {loading ? 'Saindo...' : 'Voltar ao Login'}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-700">
          Após o pagamento, seu acesso é reativado em até 5 minutos.
        </p>
      </div>
    </main>
  )
}
