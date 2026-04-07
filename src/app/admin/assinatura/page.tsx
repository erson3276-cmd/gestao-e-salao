'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Calendar, CheckCircle2, Copy, Check, MessageSquare, Clock, Shield, ArrowUpRight, Zap, Loader2, QrCode, FileText, X, Lock } from 'lucide-react'

const plans = [
  { id: 'monthly', label: 'Mensal', months: 1, days: 30, price: 49.90, discount: 0 },
  { id: 'semiannual', label: 'Semestral', months: 6, days: 180, price: 249.90, discount: 16, original: 299.40 },
  { id: 'annual', label: 'Anual', months: 12, days: 365, price: 449.90, discount: 25, original: 598.80 },
]

interface CreditCardForm {
  holderName: string
  number: string
  expiryDate: string
  cvv: string
}

export default function SubscriptionPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingType, setBillingType] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO'>('PIX')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [payment, setPayment] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [showCardModal, setShowCardModal] = useState(false)
  const [cardForm, setCardForm] = useState<CreditCardForm>({
    holderName: '',
    number: '',
    expiryDate: '',
    cvv: ''
  })
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({})

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

  async function createPayment() {
    if (!selectedPlan || !session?.salonId) return
    setPaymentLoading(true)
    setPayment(null)
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId: session.salonId,
          planId: selectedPlan,
          billingType
        })
      })
      const data = await res.json()
      if (data.success) {
        setPayment(data.payment)
      } else {
        alert(data.error || 'Erro ao criar pagamento')
      }
    } catch {
      alert('Erro ao conectar ao servidor')
    } finally {
      setPaymentLoading(false)
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePayClick() {
    if (billingType === 'CREDIT_CARD') {
      setShowCardModal(true)
    } else {
      createPayment()
    }
  }

  function formatCardNumber(value: string): string {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(' ') : v
  }

  function formatExpiryDate(value: string): string {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  function validateCardForm() {
    const errors: Record<string, string> = {}
    if (!cardForm.holderName.trim()) errors.holderName = 'Nome obrigatório'
    if (cardForm.number.replace(/\s/g, '').length < 13) errors.number = 'Número do cartão inválido'
    if (!cardForm.expiryDate || cardForm.expiryDate.length < 5) errors.expiryDate = 'Validade obrigatória'
    if (!cardForm.cvv || cardForm.cvv.length < 3) errors.cvv = 'CVV obrigatório'
    setCardErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function submitCardPayment() {
    if (!validateCardForm()) return
    setPaymentLoading(true)
    try {
      const res = await fetch('/api/payment/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          creditCard: {
            holderName: cardForm.holderName,
            number: cardForm.number.replace(/\s/g, ''),
            expiryDate: cardForm.expiryDate,
            cvv: cardForm.cvv
          }
        })
      })
      const data = await res.json()
      setShowCardModal(false)
      if (data.success) {
        setPayment({
          id: data.payment.id,
          status: data.payment.status,
          value: data.payment.value,
          cardProcessed: true
        })
      } else {
        alert(data.error || 'Erro ao processar cartão')
      }
    } catch {
      alert('Erro ao conectar ao servidor')
    } finally {
      setPaymentLoading(false)
    }
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
              onClick={() => { setSelectedPlan(plan.id); setPayment(null); }}
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

      {/* Payment Method */}
      {selectedPlan && !payment && (
        <div className="p-8 bg-[#121021] border border-[#5E41FF]/10 rounded-3xl space-y-6">
          <h3 className="text-sm font-black uppercase">Forma de Pagamento</h3>
          
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'PIX', icon: QrCode, label: 'PIX' },
              { id: 'CREDIT_CARD', icon: CreditCard, label: 'Cartão' },
              { id: 'BOLETO', icon: FileText, label: 'Boleto' },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setBillingType(method.id as any)}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  billingType === method.id
                    ? 'bg-[#5E41FF]/10 border-[#5E41FF]/40'
                    : 'bg-black/30 border-white/5 hover:border-white/10'
                }`}
              >
                <method.icon size={20} className={billingType === method.id ? 'text-[#5E41FF]' : 'text-gray-500'} />
                <span className="text-xs font-bold">{method.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 bg-[#5E41FF]/10 border border-[#5E41FF]/20 rounded-xl">
            <p className="text-sm font-bold text-[#5E41FF]">
              {plans.find(p => p.id === selectedPlan)?.label} — R$ {plans.find(p => p.id === selectedPlan)?.price.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              +{plans.find(p => p.id === selectedPlan)?.days} dias de acesso completo
            </p>
          </div>

          <button
            onClick={handlePayClick}
            disabled={paymentLoading}
            className="w-full py-4 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 border-b-4 border-[#3D28B8]"
          >
            {paymentLoading ? (
              <><Loader2 size={18} className="animate-spin" /> Gerando pagamento...</>
            ) : (
              <>
                <Zap size={18} /> Pagar Agora
              </>
            )}
          </button>
        </div>
      )}

      {/* Payment Result */}
      {payment && (
        <div className="p-8 bg-[#121021] border border-emerald-500/20 rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-500" size={24} />
            <h3 className="text-sm font-black uppercase">Pagamento Gerado</h3>
          </div>

          {billingType === 'PIX' && (
            <div className="space-y-4">
              {payment.pixQrCode && (
                <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-4">
                  <img src={`data:image/png;base64,${payment.pixQrCode}`} alt="QR Code PIX" className="w-full h-full" />
                </div>
              )}
              {payment.pixCopiaECola && (
                <div>
                  <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-2">PIX Copia e Cola</p>
                  <div className="flex items-center gap-2 p-3 bg-black/40 rounded-xl">
                    <code className="text-xs text-gray-400 font-mono flex-1 truncate">{payment.pixCopiaECola}</code>
                    <button onClick={() => copyText(payment.pixCopiaECola)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 shrink-0">
                      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-gray-400" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {billingType === 'CREDIT_CARD' && (
            <div className="space-y-4">
              {payment.cardProcessed ? (
                <div className="text-center py-4">
                  <p className="text-emerald-500 font-bold">Cartão processado com sucesso!</p>
                  <p className="text-gray-400 text-sm mt-2">Aguarde a confirmação do pagamento.</p>
                </div>
              ) : payment.invoiceUrl ? (
                <a
                  href={payment.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all border-b-4 border-[#3D28B8]"
                >
                  <CreditCard size={18} /> Pagar com Cartão de Crédito
                </a>
              ) : (
                <div className="p-6 bg-black/40 rounded-2xl text-center">
                  <p className="text-sm text-gray-400 mb-4">O link de pagamento será gerado em breve.</p>
                </div>
              )}
              {!payment.cardProcessed && <p className="text-xs text-gray-500 text-center">Clique no botão acima para inserir os dados do cartão com segurança.</p>}
            </div>
          )}

          {billingType === 'BOLETO' && payment.boletoUrl && (
            <div className="space-y-4">
              <a
                href={payment.boletoUrl}
                target="_blank"
                className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-gray-100 transition-all border-b-4 border-gray-300"
              >
                <FileText size={18} /> Baixar Boleto
              </a>
            </div>
          )}

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-xs text-emerald-400 font-bold">
              ✅ Assim que o pagamento for confirmado, seu acesso será renovado automaticamente por +{plans.find(p => p.id === selectedPlan)?.days} dias.
            </p>
          </div>
        </div>
      )}

      {/* Credit Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121021] border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase flex items-center gap-2">
                <CreditCard className="text-[#5E41FF]" size={20} /> Dados do Cartão
              </h3>
              <button onClick={() => setShowCardModal(false)} className="p-2 hover:bg-white/10 rounded-xl">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Nome no Cartão</label>
                <input
                  type="text"
                  value={cardForm.holderName}
                  onChange={e => setCardForm({...cardForm, holderName: e.target.value})}
                  placeholder="Nome como está no cartão"
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl mt-1 focus:border-[#5E41FF]/50 outline-none"
                />
                {cardErrors.holderName && <p className="text-red-500 text-xs mt-1">{cardErrors.holderName}</p>}
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Número do Cartão</label>
                <input
                  type="text"
                  value={cardForm.number}
                  onChange={e => setCardForm({...cardForm, number: formatCardNumber(e.target.value)})}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl mt-1 focus:border-[#5E41FF]/50 outline-none"
                />
                {cardErrors.number && <p className="text-red-500 text-xs mt-1">{cardErrors.number}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Validade</label>
                  <input
                    type="text"
                    value={cardForm.expiryDate}
                    onChange={e => setCardForm({...cardForm, expiryDate: formatExpiryDate(e.target.value)})}
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl mt-1 focus:border-[#5E41FF]/50 outline-none"
                  />
                  {cardErrors.expiryDate && <p className="text-red-500 text-xs mt-1">{cardErrors.expiryDate}</p>}
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">CVV</label>
                  <input
                    type="text"
                    value={cardForm.cvv}
                    onChange={e => setCardForm({...cardForm, cvv: e.target.value.replace(/\D/g, '')})}
                    placeholder="123"
                    maxLength={4}
                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl mt-1 focus:border-[#5E41FF]/50 outline-none"
                  />
                  {cardErrors.cvv && <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#5E41FF]/10 border border-[#5E41FF]/20 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total a pagar:</span>
                <span className="text-xl font-black text-white">R$ {plans.find(p => p.id === selectedPlan)?.price.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Lock size={14} className="text-emerald-500" />
              Pagamento seguro via Asaas
            </div>

            <button
              onClick={submitCardPayment}
              disabled={paymentLoading}
              className="w-full py-4 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 border-b-4 border-[#3D28B8]"
            >
              {paymentLoading ? (
                <><Loader2 size={18} className="animate-spin" /> Processando...</>
              ) : (
                <>
                  <Zap size={18} /> Pagar Agora
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
