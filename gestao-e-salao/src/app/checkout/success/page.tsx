'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'

declare global {
  interface Window {
    fbq: any
  }
}

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: 49,
        currency: 'BRL',
        content_type: 'subscription',
        content_name: 'Gestão E Salão'
      })
    }
    checkPayment()
  }, [])

  async function checkPayment() {
    try {
      const res = await fetch('/api/session')
      const data = await res.json()
      if (data.salonId) {
        setLoading(false)
      } else {
        setError('Aguarde a confirmação do pagamento...')
        setTimeout(() => checkPayment(), 5000)
      }
    } catch {
      setError('Erro ao verificar pagamento')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#5E41FF] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verificando pagamento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-white mb-4">Aguardando confirmação</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#5E41FF] text-white rounded-2xl font-black">
            Ir para Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4">Pagamento confirmado!</h2>
        <p className="text-gray-400 mb-6">Seu salão está pronto para usar.</p>
        <Link href="/admin/gestao" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#5E41FF] text-white rounded-2xl font-black">
          Acessar meu salão
        </Link>
      </div>
    </div>
  )
}
