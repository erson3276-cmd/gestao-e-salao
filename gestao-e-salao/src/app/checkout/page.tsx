'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircle2, 
  Loader2, 
  Copy, 
  QrCode, 
  CreditCard, 
  Barcode,
  Pi,
  ArrowLeft,
  Lock,
  Shield
} from 'lucide-react'

interface PaymentData {
  id: string
  value: number
  dueDate: string
  billingType: string
  pixQrCode?: string
  pixCopiaECola?: string
  invoiceUrl?: string
}

const plans = [
  { id: 'monthly', label: 'Mensal', price: 49, period: 'mês' },
  { id: 'semiannual', label: 'Semestral', price: 249.90, period: '6 meses' },
  { id: 'annual', label: 'Anual', price: 449.90, period: '12 meses' },
]

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'monthly')
  const [selectedMethod, setSelectedMethod] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO'>('PIX')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '', cpf: '' })
  const [cardError, setCardError] = useState('')

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    try {
      const res = await fetch('/api/session')
      const data = await res.json()
      if (!data.salonId) {
        router.push('/register?plan=' + selectedPlan)
        return
      }
      createPayment()
    } catch (e) {
      router.push('/register?plan=' + selectedPlan)
    }
  }

  async function createPayment() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan, billingType: selectedMethod })
      })
      const data = await res.json()
      if (data.success) {
        setPaymentData(data.payment)
      } else {
        setError(data.error || 'Erro ao criar pagamento')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function changeMethod(method: 'PIX' | 'CREDIT_CARD' | 'BOLETO') {
    setSelectedMethod(method)
    setPaymentData(null)
    setLoading(true)
    setCardError('')
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan, billingType: method })
      })
      const data = await res.json()
      if (data.success) {
        setPaymentData(data.payment)
      } else {
        setError(data.error || 'Erro ao criar pagamento')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function processCardPayment() {
    if (!cardForm.number || !cardForm.expiry || !cardForm.cvv || !cardForm.name || !cardForm.cpf) {
      setCardError('Preencha todos os campos')
      return
    }
    setProcessingPayment(true)
    setCardError('')
    try {
      const res = await fetch('/api/payment/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          card: {
            holderName: cardForm.name,
            number: cardForm.number,
            expiryDate: cardForm.expiry,
            cvv: cardForm.cvv
          }
        })
      })
      const data = await res.json()
      if (data.success) {
        setPaymentData(data.payment)
      } else {
        setCardError(data.error || 'Erro no cartão')
      }
    } catch (e: any) {
      setCardError(e.message)
    } finally {
      setProcessingPayment(false)
    }
  }

  function copyPix() {
    if (paymentData?.pixCopiaECola) {
      navigator.clipboard.writeText(paymentData.pixCopiaECola)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const plan = plans.find(p => p.id === selectedPlan)!

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Criando pagamento...</p>
        </div>
      </div>
    )
  }

  if (paymentData?.billingType === 'CONFIRMED') {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Pagamento Confirmado!</h1>
          <p className="text-gray-400 mb-8">
            Obrigado! Seu pagamento foi processado com sucesso.
          </p>
          <Link href="/admin/gestao" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black">
            Acessar meu salão
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#030014]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/assine" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </Link>
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <Lock className="w-4 h-4" />
            <span>Pagamento seguro</span>
          </div>
        </div>
      </header>

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-black text-center mb-8">
            Finalize sua assinatura
          </h1>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Plano selecionado</p>
                <p className="text-xl font-black">{plan.label}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-purple-400">R$ {plan.price.toFixed(2).replace('.', ',')}</p>
                <p className="text-gray-400 text-sm">/{plan.period}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-8">
            <button
              onClick={() => changeMethod('PIX')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                selectedMethod === 'PIX' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <Pi className="w-8 h-8 text-purple-400" />
              <span className="text-sm font-medium">PIX</span>
            </button>
            <button
              onClick={() => changeMethod('CREDIT_CARD')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                selectedMethod === 'CREDIT_CARD' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <CreditCard className="w-8 h-8 text-purple-400" />
              <span className="text-sm font-medium">Cartão</span>
            </button>
            <button
              onClick={() => changeMethod('BOLETO')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                selectedMethod === 'BOLETO' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <Barcode className="w-8 h-8 text-purple-400" />
              <span className="text-sm font-medium">Boleto</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
            </div>
          ) : paymentData ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              {selectedMethod === 'PIX' && (
                <div className="text-center">
                  <p className="text-gray-400 mb-4">Escaneie o QR Code ou copie o código:</p>
                  {paymentData.pixQrCode && (
                    <div className="bg-white p-4 rounded-xl inline-block mb-4">
                      <img src={`data:image/png;base64,${paymentData.pixQrCode}`} alt="PIX QR Code" className="w-48 h-48" />
                    </div>
                  )}
                  {paymentData.pixCopiaECola && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-2">Código PIX:</p>
                      <div className="flex items-center gap-2 bg-black/40 rounded-xl p-3">
                        <input 
                          readOnly 
                          value={paymentData.pixCopiaECola} 
                          className="flex-1 bg-transparent text-sm text-gray-300 outline-none"
                        />
                        <button onClick={copyPix} className="p-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30">
                          {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-purple-400" />}
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-gray-500 text-sm">
                    Valor: <strong className="text-white">R$ {paymentData.value.toFixed(2).replace('.', ',')}</strong>
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Vencimento: {new Date(paymentData.dueDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}

              {selectedMethod === 'BOLETO' && (
                <div className="text-center">
                  <p className="text-gray-400 mb-4">Baixe ou visualize o boleto:</p>
                  <a 
                    href={paymentData.invoiceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 rounded-xl font-bold hover:bg-purple-700 transition-colors"
                  >
                    <Barcode className="w-5 h-5" />
                    Visualizar Boleto
                  </a>
                  <p className="text-gray-500 text-sm mt-4">
                    Valor: <strong className="text-white">R$ {paymentData.value.toFixed(2).replace('.', ',')}</strong>
                  </p>
                </div>
              )}

              {selectedMethod === 'CREDIT_CARD' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">Nome do titular</label>
                    <input 
                      value={cardForm.name}
                      onChange={e => setCardForm({...cardForm, name: e.target.value})}
                      placeholder="Nome como está no cartão"
                      className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">Número do cartão</label>
                    <input 
                      value={cardForm.number}
                      onChange={e => setCardForm({...cardForm, number: e.target.value})}
                      placeholder="0000 0000 0000 0000"
                      className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm block mb-2">Validade</label>
                      <input 
                        value={cardForm.expiry}
                        onChange={e => setCardForm({...cardForm, expiry: e.target.value})}
                        placeholder="MM/AA"
                        className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm block mb-2">CVV</label>
                      <input 
                        value={cardForm.cvv}
                        onChange={e => setCardForm({...cardForm, cvv: e.target.value})}
                        placeholder="123"
                        className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">CPF do titular</label>
                    <input 
                      value={cardForm.cpf}
                      onChange={e => setCardForm({...cardForm, cpf: e.target.value})}
                      placeholder="000.000.000-00"
                      className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                  {cardError && (
                    <p className="text-red-400 text-sm">{cardError}</p>
                  )}
                  <button 
                    onClick={processCardPayment}
                    disabled={processingPayment}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-black flex items-center justify-center gap-2"
                  >
                    {processingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Pagar R$ {paymentData.value.toFixed(2).replace('.', ',')}</>}
                  </button>
                </div>
              )}
            </div>
          ) : null}

          <div className="flex items-center justify-center gap-2 mt-8 text-gray-600 text-sm">
            <Shield className="w-4 h-4" />
            <span>Pagamento processado por Asaas</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Carregando...</p>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutContent />
    </Suspense>
  )
}
