'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowRight, Lock, Check } from 'lucide-react'
import { trackLead } from '@/lib/meta-pixel'

const plans = [
  { id: 'monthly', label: 'Mensal', price: 49, total: 49, savings: '0%' },
  { id: 'semiannual', label: 'Semestral', price: 41.65, total: 249.90, savings: '15% OFF' },
  { id: 'annual', label: 'Anual', price: 37.49, total: 449.90, savings: '23% OFF' },
]

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#5E41FF]/30 border-t-[#5E41FF] rounded-full animate-spin" /></div>}>
      <RegisterContent />
    </Suspense>
  )
}

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'monthly')
  const plan = plans.find(p => p.id === selectedPlan)!
  
  const [formData, setFormData] = useState({
    salonName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: '',
    cpfCnpj: ''
  })

  async function handleRegister() {
    if (!formData.salonName || !formData.ownerName || !formData.ownerEmail || !formData.ownerPhone || !formData.ownerPassword || !formData.cpfCnpj) {
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
          ownerCpf: formData.cpfCnpj
        })
      })
      const data = await res.json()
      
      if (data.success) {
        trackLead()
        router.push(`/checkout?plan=${selectedPlan}`)
      } else {
        setError(data.error || 'Erro ao criar conta')
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
            Crie sua conta
          </p>
        </div>

        <div className="bg-[#121021]/50 border border-white/5 rounded-3xl p-6">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 mb-4">
            <p className="text-gray-400 text-sm mb-3">Escolha seu plano:</p>
            <div className="grid grid-cols-3 gap-2">
              {plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`p-2 rounded-xl border-2 text-center transition-all ${
                    selectedPlan === p.id 
                      ? 'border-[#5E41FF] bg-[#5E41FF]/10' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className="text-xs font-bold text-white">{p.label}</p>
                  <p className="text-sm font-black text-[#5E41FF]">R$ {p.price.toFixed(2).replace('.', ',')}</p>
                  {p.savings !== '0%' && (
                    <span className="text-xs text-emerald-400">{p.savings}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
              <div>
                <span className="text-gray-400 text-sm">Plano:</span>
                <p className="text-lg font-black text-white">{plan.label}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[#5E41FF]">R$ {plan.total.toFixed(2).replace('.', ',')}</p>
                <p className="text-gray-400 text-xs">R$ {plan.price.toFixed(2).replace('.', ',')}/mês</p>
              </div>
            </div>
            {plan.savings !== '0%' && (
              <div className="mt-2 text-center">
                <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  {plan.savings} de desconto
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={formData.salonName}
              onChange={e => setFormData({...formData, salonName: e.target.value})}
              placeholder="Nome do salão"
              className="w-full p-3 bg-black/40 border border-white/5 rounded-xl text-white placeholder:text-gray-600"
            />
            <input
              type="text"
              value={formData.ownerName}
              onChange={e => setFormData({...formData, ownerName: e.target.value})}
              placeholder="Seu nome completo"
              className="w-full p-3 bg-black/40 border border-white/5 rounded-xl text-white placeholder:text-gray-600"
            />
            <input
              type="email"
              value={formData.ownerEmail}
              onChange={e => setFormData({...formData, ownerEmail: e.target.value})}
              placeholder="Seu email"
              className="w-full p-3 bg-black/40 border border-white/5 rounded-xl text-white placeholder:text-gray-600"
            />
            <input
              type="tel"
              value={formData.ownerPhone}
              onChange={e => setFormData({...formData, ownerPhone: e.target.value})}
              placeholder="WhatsApp (com DDD)"
              className="w-full p-3 bg-black/40 border border-white/5 rounded-xl text-white placeholder:text-gray-600"
            />
            <input
              type="text"
              value={formData.cpfCnpj}
              onChange={e => setFormData({...formData, cpfCnpj: e.target.value})}
              placeholder="CPF ou CNPJ (obrigatório para pagamento)"
              className="w-full p-3 bg-black/40 border border-white/5 rounded-xl text-white placeholder:text-gray-600"
            />
            <input
              type="password"
              value={formData.ownerPassword}
              onChange={e => setFormData({...formData, ownerPassword: e.target.value})}
              placeholder="Crie uma senha"
              className="w-full p-3 bg-black/40 border border-white/5 rounded-xl text-white placeholder:text-gray-600"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm mt-4 text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full mt-4 py-3 bg-[#5E41FF] text-white rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continuar <ArrowRight className="w-5 h-5" /></>}
          </button>

          <div className="flex items-center justify-center gap-2 text-gray-600 text-xs mt-4">
            <Lock className="w-3 h-3" />
            <span>Seus dados estão seguros</span>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs">
          <Link href="/login" className="hover:text-white">Já tem conta? Login</Link>
        </p>
      </div>
    </div>
  )
}