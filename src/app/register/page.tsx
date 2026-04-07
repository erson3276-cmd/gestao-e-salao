'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircle2, 
  Loader2, 
  CreditCard, 
  Pi,
  Barcode,
  Lock,
  ArrowRight
} from 'lucide-react'

const plans = [
  { id: 'monthly', label: 'Mensal', price: 49, total: 49 },
  { id: 'semiannual', label: 'Semestral', price: 41.65, total: 249.90 },
  { id: 'annual', label: 'Anual', price: 37.49, total: 449.90 },
]

export default function RegisterCheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'monthly')
  
  const [formData, setFormData] = useState({
    salonName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: '',
    cpf: ''
  })

  const plan = plans.find(p => p.id === selectedPlan)!

  async function handleRegister() {
    if (!formData.salonName || !formData.ownerName || !formData.ownerEmail || !formData.ownerPhone || !formData.ownerPassword) {
      setError('Preencha todos os campos')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonName: formData.salonName,
          ownerName: formData.ownerName,
          ownerEmail: formData.ownerEmail,
          ownerPassword: formData.ownerPassword,
          ownerPhone: formData.ownerPhone,
          ownerCpf: formData.cpf
        })
      })
      const data = await res.json()
      
      if (data.success) {
        setStep(2)
      } else {
        setError(data.error || 'Erro ao criar conta')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePayment() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan })
      })
      const data = await res.json()
      
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setError(data.error || 'Erro ao criar pagamento')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black italic text-white">
            Gestão<span className="text-[#5E41FF]">E</span>Salão
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Complete seu cadastro
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-center">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="bg-[#121021]/50 border border-white/5 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Dados do seu salão</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      selectedPlan === p.id 
                        ? 'border-[#5E41FF] bg-[#5E41FF]/10 text-white' 
                        : 'border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {p.label}
                    <br />
                    <span className="text-xs">R$ {p.total.toFixed(2).replace('.', ',')}</span>
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={formData.salonName}
                onChange={e => setFormData({...formData, salonName: e.target.value})}
                placeholder="Nome do salão"
                className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder:text-gray-800"
              />
              <input
                type="text"
                value={formData.ownerName}
                onChange={e => setFormData({...formData, ownerName: e.target.value})}
                placeholder="Seu nome completo"
                className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder:text-gray-800"
              />
              <input
                type="email"
                value={formData.ownerEmail}
                onChange={e => setFormData({...formData, ownerEmail: e.target.value})}
                placeholder="Seu email"
                className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder:text-gray-800"
              />
              <input
                type="tel"
                value={formData.ownerPhone}
                onChange={e => setFormData({...formData, ownerPhone: e.target.value})}
                placeholder="WhatsApp"
                className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder:text-gray-800"
              />
              <input
                type="text"
                value={formData.cpf}
                onChange={e => setFormData({...formData, cpf: e.target.value})}
                placeholder="CPF (opcional)"
                className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder:text-gray-800"
              />
              <input
                type="password"
                value={formData.ownerPassword}
                onChange={e => setFormData({...formData, ownerPassword: e.target.value})}
                placeholder="Crie uma senha"
                className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder:text-gray-800"
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full mt-6 py-4 bg-[#5E41FF] text-white rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continuar para pagamento <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-[#121021]/50 border border-white/5 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Resumo do pedido</h2>
            
            <div className="bg-black/40 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Plano</span>
                <span className="text-white font-bold">{plan.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total</span>
                <span className="text-2xl font-black text-[#5E41FF]">R$ {plan.total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-gray-400 text-sm">Escolha a forma de pagamento:</p>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full p-4 bg-[#5E41FF] text-white rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{'Pagar agora'} <ArrowRight className="w-5 h-5" />}</>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
              <Lock className="w-4 h-4" />
              <span>Pagamento seguro via Asaas</span>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full mt-4 text-gray-500 text-sm hover:text-white"
            >
              ← Voltar para editar dados
            </button>
          </div>
        )}

        <p className="text-center text-gray-600 text-xs">
          Ao continuar, você concorda com os termos de uso
        </p>
      </div>
    </div>
  )
}
