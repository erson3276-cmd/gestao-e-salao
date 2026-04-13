'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { trackPurchase } from '@/lib/meta-pixel'

export default function SucessoPage() {
  useEffect(() => {
    trackPurchase(49.90, 'BRL', 'Assinatura Premium Gestão E Salão')
  }, [])

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>

        <div>
          <h1 className="text-3xl font-black italic text-white mb-4">
            Assinatura<span className="text-[#5E41FF]">Confirmada!</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Bem-vindo ao plano Premium do Gestão E Salão!
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Seu acesso está liberado. Comece a usar agora mesmo.
          </p>
        </div>

        <div className="space-y-4">
          <Link 
            href="/admin" 
            className="block w-full py-4 bg-[#5E41FF] text-white rounded-2xl font-black text-center hover:bg-[#5E41FF]/90 transition-all"
          >
            Ir para o Painel
          </Link>
          
          <Link 
            href="/admin/gestao" 
            className="block w-full py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-bold text-center hover:bg-white/10 transition-all"
          >
            Configurar meu salão
          </Link>
        </div>

        <p className="text-xs text-gray-600">
          Dúvidas? Entre em contato pelo WhatsApp do seu salão.
        </p>
      </div>
    </main>
  )
}