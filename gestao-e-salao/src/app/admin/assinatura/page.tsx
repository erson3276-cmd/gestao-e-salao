'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Loader2, Check, Copy, X, Lock, AlertTriangle, Clock, Shield } from 'lucide-react'

const plans = [
  { 
    id: 'monthly', 
    label: 'Mensal', 
    price: 49.90, 
    days: 30,
    description: 'Ideal para quem está começando'
  },
  { 
    id: 'semiannual', 
    label: 'Semestral', 
    price: 249.90, 
    days: 180,
    original: 299.40,
    discount: 17,
    description: 'Melhor custo-benefício'
  },
  { 
    id: 'annual', 
    label: 'Anual', 
    price: 449.90, 
    days: 365,
    original: 598.80,
    discount: 25,
    description: 'Para salões estabelecidos'
  },
]

const billingTypes = [
  { id: 'PIX', label: 'PIX', icon: '📱', description: 'Aprovação instantânea' },
  { id: 'BOLETO', label: 'Boleto', icon: '📄', description: 'Aprovação em até 2 dias' },
  { id: 'CREDIT_CARD', label: 'Cartão', icon: '💳', description: 'Aprovação imediata' },
]

export default function SubscriptionPage() {
  const router = useRouter()
  const [step, setStep] = useState<'plans' | 'data' | 'payment' | 'success'>('plans')
  const [loading, setLoading] = useState(true)
  const [creatingPayment, setCreatingPayment] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    address: ''
  })
  
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)
  const [selectedBilling, setSelectedBilling] = useState('PIX')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadSession()
  }, [])

  async function loadSession() {
    try {
      const res = await fetch('/api/session')
      if (res.ok) {
        const data = await res.json()
        if (data.salonId) {
          loadProfile(data.salonId)
        }
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function loadProfile(salonId: string) {
    try {
      const res = await fetch('/api/gestao/profile')
      const data = await res.json()
      if (data.profile) {
        setFormData({
          name: data.profile.professional_name || '',
          email: data.profile.owner_email || '',
          phone: data.profile.whatsapp_number || '',
          cpf: data.profile.cpf_cnpj || '',
          address: data.profile.address || ''
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  function validateForm() {
    const errs: Record<string, string> = {}
    
    if (!formData.name.trim()) errs.name = 'Nome é obrigatório'
    if (!formData.email.trim()) errs.email = 'Email é obrigatório'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Email inválido'
    
    if (!formData.phone.trim()) errs.phone = 'Telefone é obrigatório'
    
    if (!formData.cpf.trim()) errs.cpf = 'CPF é obrigatório'
    else if (formData.cpf.replace(/\D/g, '').length !== 11) errs.cpf = 'CPF inválido'
    
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handlePlanSelect(plan: typeof plans[0]) {
    setSelectedPlan(plan)
    setStep('data')
  }

  function handleDataContinue() {
    if (validateForm()) {
      setStep('payment')
    }
  }

  async function handleCreatePayment() {
    if (!selectedPlan) return
    
    setCreatingPayment(true)
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingType: selectedBilling,
          customerData: formData
        })
      })
      const data = await res.json()
      
      if (data.success) {
        setPaymentData(data.payment)
        setStep('success')
      } else {
        alert(data.error || 'Erro ao criar pagamento')
      }
    } catch (e: any) {
      alert('Erro: ' + e.message)
    }
    setCreatingPayment(false)
  }

  function copyPixCode() {
    if (paymentData?.pixCopiaECola) {
      navigator.clipboard.writeText(paymentData.pixCopiaECola)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black italic uppercase flex items-center gap-3">
          <CreditCard className="text-[#5E41FF]" size={28} /> Assinatura
        </h1>
        <p className="text-gray-500 text-sm mt-1">Escolha seu plano e comece a usar o Gestão E Salão</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {['Plano', 'Dados', 'Pagamento'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              (step === 'plans' && i === 0) || (step === 'data' && i === 1) || (step === 'payment' && i === 2) || step === 'success'
                ? 'bg-[#5E41FF] text-white' 
                : 'bg-white/10 text-gray-500'
            }`}>
              {i + 1}
            </div>
            <span className="text-sm text-gray-400">{label}</span>
            {i < 2 && <span className="text-gray-600">→</span>}
          </div>
        ))}
      </div>

      {/* Step 1: Plans */}
      {step === 'plans' && (
        <div className="space-y-6">
          <h2 className="text-xl font-black">Escolha seu plano</h2>
          
          <div className="grid gap-4">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handlePlanSelect(plan)}
                className="p-6 bg-[#121021] border border-white/10 rounded-2xl text-left hover:border-[#5E41FF]/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black">{plan.label}</h3>
                      {plan.discount && (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">
                          -{plan.discount}%
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">R$ {plan.price.toFixed(2).replace('.', ',')}</p>
                    {plan.original && (
                      <p className="text-sm text-gray-600 line-through">R$ {plan.original.toFixed(2).replace('.', ',')}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{plan.days} dias de acesso</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* 7-day guarantee */}
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
            <Shield className="text-emerald-400 shrink-0 mt-1" size={20} />
            <div>
              <p className="font-bold text-emerald-400">Garantia de 7 dias</p>
              <p className="text-sm text-gray-400">Você tem 7 dias para testar o sistema. Se não gostar, devolvemos 100% do seu dinheiro, sem perguntas.</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Data */}
      {step === 'data' && selectedPlan && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Seus dados</h2>
            <button onClick={() => setStep('plans')} className="text-gray-400 hover:text-white">
              ← Voltar
            </button>
          </div>

          <p className="text-gray-400 text-sm">
            Plano: <span className="text-white font-bold">{selectedPlan.label}</span> - 
            R$ {selectedPlan.price.toFixed(2).replace('.', ',')}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Nome completo *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:border-[#5E41FF] outline-none"
                placeholder="Seu nome"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:border-[#5E41FF] outline-none"
                placeholder="seu@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">WhatsApp *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:border-[#5E41FF] outline-none"
                placeholder="21999999999"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">CPF * (para emissão de NF)</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '')
                  if (v.length <= 11) {
                    const formatted = v.length <= 9 
                      ? v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2')
                      : v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                    setFormData({...formData, cpf: formatted})
                  }
                }}
                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:border-[#5E41FF] outline-none"
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
              <p className="text-xs text-gray-600 mt-1">O CPF é necessário para emitir notas fiscais e cobranças</p>
            </div>
          </div>

          <button
            onClick={handleDataContinue}
            className="w-full py-4 bg-[#5E41FF] text-white rounded-xl font-black"
          >
            Continuar para pagamento →
          </button>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 'payment' && selectedPlan && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Forma de pagamento</h2>
            <button onClick={() => setStep('data')} className="text-gray-400 hover:text-white">
              ← Voltar
            </button>
          </div>

          {/* Billing Options */}
          <div className="grid grid-cols-3 gap-3">
            {billingTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedBilling(type.id)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  selectedBilling === type.id
                    ? 'border-[#5E41FF] bg-[#5E41FF]/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <p className="font-bold">{type.label}</p>
                <p className="text-xs text-gray-500 mt-1">{type.description}</p>
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="p-6 bg-[#121021] border border-white/10 rounded-xl">
            <h3 className="font-bold mb-4">Resumo do pedido</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Plano</span>
                <span className="font-bold">{selectedPlan?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Período</span>
                <span>{selectedPlan?.days} dias</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Forma de pagamento</span>
                <span>{billingTypes.find(t => t.id === selectedBilling)?.label}</span>
              </div>
              <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="text-xl font-black text-emerald-400">
                  R$ {selectedPlan?.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>

          {/* 7-day guarantee */}
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
            <AlertTriangle className="text-emerald-400" size={20} />
            <p className="text-sm text-gray-300">
              <strong className="text-emerald-400">Garantia:</strong> 7 dias para solicitar reembolso total. Riscos zero.
            </p>
          </div>

          <button
            onClick={handleCreatePayment}
            disabled={creatingPayment}
            className="w-full py-4 bg-[#5E41FF] text-white rounded-xl font-black flex items-center justify-center gap-2"
          >
            {creatingPayment ? (
              <><Loader2 className="animate-spin" /> Processando...</>
            ) : (
              <><Lock size={18} /> Confirmar e pagar</>
            )}
          </button>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 'success' && paymentData && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-emerald-400" size={32} />
            </div>
            <h2 className="text-xl font-black text-emerald-400">Pagamento gerado!</h2>
          </div>

          {selectedBilling === 'PIX' && (
            <div className="space-y-4">
              {paymentData.pixQrCode && (
                <div className="w-64 h-64 mx-auto bg-white rounded-2xl p-4">
                  <img 
                    src={`data:image/png;base64,${paymentData.pixQrCode}`} 
                    alt="QR Code PIX" 
                    className="w-full h-full" 
                  />
                </div>
              )}
              
              {paymentData.pixCopiaECola && (
                <div className="p-4 bg-black/40 rounded-xl">
                  <p className="text-xs text-gray-500 mb-2">PIX Copia e Cola:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-gray-400 flex-1 truncate font-mono">
                      {paymentData.pixCopiaECola}
                    </code>
                    <button 
                      onClick={copyPixCode}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
                    >
                      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedBilling === 'BOLETO' && paymentData.boletoUrl && (
            <a
              href={paymentData.boletoUrl}
              target="_blank"
              className="block w-full py-4 bg-white text-gray-900 rounded-xl font-black text-center"
            >
              📄 Baixar Boleto
            </a>
          )}

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-sm text-gray-300">
              <strong className="text-emerald-400">Valor:</strong> R$ {paymentData.value?.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-sm text-gray-300 mt-1">
              <strong className="text-emerald-400">Vencimento:</strong> {new Date(paymentData.dueDate).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="p-4 bg-[#121021] border border-white/10 rounded-xl">
            <p className="text-sm text-gray-400">
              O pagamento será confirmado automaticamente. Você receberá um email quando for aprovado.
            </p>
          </div>

          <button
            onClick={() => router.push('/admin')}
            className="w-full py-4 bg-white/10 text-white rounded-xl font-bold"
          >
            Voltar ao painel
          </button>
        </div>
      )}
    </div>
  )
}
