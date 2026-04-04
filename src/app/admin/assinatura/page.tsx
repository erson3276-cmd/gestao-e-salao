'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Calendar, CheckCircle2, Copy, Check, MessageSquare, Clock, Shield, ArrowUpRight, Zap } from 'lucide-react'

const plans = [
  { id: 'monthly', label: 'Mensal', months: 1, price: 49.90, discount: 0 },
  { id: 'semiannual', label: 'Semestral', months: 6, price: 249.90, discount: 16, original: 299.40 },
  { id: 'annual', label: 'Anual', months: 12, price: 449.90, discount: 25, original: 598.80 },
]

export default function SubscriptionPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    loadSession()
  }, [])

  async function loadSession() {
    try {
      const res = await fetch('/api/session')
      if (res.ok) {
        const data = await res.json()
        setSession(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function copyPix() {
    navigator.clipboard.writeText('21982755539')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function sendProof(plan: typeof plans[0]) {
    const msg = `Olá! Sou do salão *${session?.salonName || ''}* e acabei de enviar o comprovante da renovação do plano *${plan.label}* (R$ ${plan.price.toFixed(2).replace('.', ',')}).`
    window.open(`https://wa.me/5521982755539?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#5E41FF]/30 border-t-[#5E41FF] rounded-full animate-spin" />
      </div>
    )
  }

  const expiresAt = session?.subscriptionEndsAt ? new Date(session.subscriptionEndsAt) : null
  const now = new Date()
  const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
  const isExpired = daysLeft !== null && daysLeft <= 0

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black italic uppercase flex items-center gap-3">
          <CreditCard className="text-[#5E41FF]" size={28} /> Assinatura
        </h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie seu plano e renove sua assinatura.</p>
      </div>

      {/* Status Card */}
      <div className={`p-8 rounded-3xl border ${isExpired ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
        <div className="flex items-center gap-4 mb-6">
          {isExpired ? (
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Clock className="text-red-500" size={24} />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="text-emerald-500" size={24} />
            </div>
          )}
          <div>
            <p className="text-lg font-black uppercase italic">{isExpired ? 'Assinatura Expirada' : 'Assinatura Ativa'}</p>
            <p className="text-sm text-gray-500">Plano {session?.plan || 'Profissional'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-black/30 rounded-2xl">
            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Vencimento</p>
            <p className="text-lg font-black text-white">{expiresAt ? expiresAt.toLocaleDateString('pt-BR') : 'N/A'}</p>
          </div>
          <div className="p-4 bg-black/30 rounded-2xl">
            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Dias Restantes</p>
            <p className={`text-lg font-black ${daysLeft !== null && daysLeft <= 7 ? 'text-red-500' : 'text-emerald-500'}`}>
              {daysLeft !== null ? `${daysLeft} dias` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-black uppercase italic mb-4">Renovar Assinatura</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`p-6 rounded-3xl border text-left transition-all ${
                selectedPlan === plan.id
                  ? 'bg-[#5E41FF]/10 border-[#5E41FF]/40 ring-2 ring-[#5E41FF]/20'
                  : 'bg-[#121021]/50 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black uppercase">{plan.label}</h3>
                {plan.discount > 0 && (
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black">
                    -{plan.discount}%
                  </span>
                )}
              </div>
              <div className="mb-1">
                <span className="text-2xl font-black">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
              </div>
              {plan.original && (
                <p className="text-xs text-gray-600 line-through">De R$ {plan.original.toFixed(2).replace('.', ',')}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                R$ {(plan.price / plan.months).toFixed(2).replace('.', ',')}/mês
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Payment */}
      {selectedPlan && (
        <div className="p-8 bg-[#121021] border border-[#5E41FF]/10 rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="text-[#5E41FF]" size={20} />
            <h3 className="text-sm font-black uppercase">Pagamento via PIX</h3>
          </div>

          <div className="p-4 bg-black/40 rounded-2xl space-y-4">
            <div>
              <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1">Chave PIX (Telefone)</p>
              <div className="flex items-center gap-3">
                <code className="text-lg font-mono font-bold text-white">(21) 98275-5539</code>
                <button onClick={copyPix} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#5E41FF]/10 border border-[#5E41FF]/20 rounded-xl">
              <p className="text-sm font-bold text-[#5E41FF]">
                {plans.find(p => p.id === selectedPlan)?.label} — R$ {plans.find(p => p.id === selectedPlan)?.price.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                +{plans.find(p => p.id === selectedPlan)?.months} dias de acesso completo
              </p>
            </div>
          </div>

          <button
            onClick={() => sendProof(plans.find(p => p.id === selectedPlan)!)}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all border-b-4 border-emerald-800"
          >
            <MessageSquare size={18} /> Já Paguei — Enviar Comprovante
          </button>

          <p className="text-xs text-gray-600 text-center">
            Após o envio do comprovante, seu acesso é reativado em até 5 minutos.
          </p>
        </div>
      )}
    </div>
  )
}
