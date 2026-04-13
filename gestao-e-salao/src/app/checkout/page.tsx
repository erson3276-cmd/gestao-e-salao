'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircle2, 
  Loader2, 
  Copy, 
  CreditCard, 
  Barcode,
  Pi,
  ArrowLeft,
  Lock,
  RefreshCw,
  Shield
} from 'lucide-react'
import { trackInitiateCheckout } from '@/lib/meta-pixel'

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
  { id: 'monthly', label: 'Mensal', price: 49, total: 49, savings: '0%' },
  { id: 'semiannual', label: 'Semestral', price: 41.65, total: 249.90, savings: '15% OFF' },
  { id: 'annual', label: 'Anual', price: 37.49, total: 449.90, savings: '23% OFF' },
]

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#5E41FF]/30 border-t-[#5E41FF] rounded-full animate-spin" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'monthly')
  const [selectedMethod, setSelectedMethod] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO'>('PIX')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [checkingPayment, setCheckingPayment] = useState(false)

  const plan = plans.find(p => p.id === selectedPlan)!

  useEffect(() => {
    generatePayment()
  }, [selectedMethod])

  async function generatePayment() {
    setLoading(true)
    setError('')
    setPaymentData(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: selectedPlan,
          billingType: selectedMethod
        })
      })
      const data = await res.json()
      
      console.log('Checkout response:', data)
      
      if (data.success && data.payment) {
        setPaymentData(data.payment)
        trackInitiateCheckout(plan.total)
      } else {
        setError(data.error || 'Erro ao criar pagamento')
      }
    } catch (e: any) {
      console.error('Checkout error:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function changeMethod(method: 'PIX' | 'CREDIT_CARD' | 'BOLETO') {
    setSelectedMethod(method)
  }

  function copyPix() {
    if (paymentData?.pixCopiaECola) {
      navigator.clipboard.writeText(paymentData.pixCopiaECola)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  async function checkPaymentStatus() {
    if (!paymentData?.id) return
    
    setCheckingPayment(true)
    try {
      const res = await fetch('/api/payment/check-status?paymentId=' + paymentData.id)
      const data = await res.json()
      
      if (data.status === 'CONFIRMED' || data.status === 'RECEIVED') {
        router.push('/checkout/success')
      } else {
        setError('Pagamento ainda não confirmado. Realize o pagamento e tente novamente.')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCheckingPayment(false)
    }
  }

  if (error && !paymentData) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Erro no checkout</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={generatePayment} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5E41FF] text-white rounded-xl font-bold">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/register" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </Link>
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <Lock className="w-4 h-4" />
            <span>Pagamento seguro</span>
          </div>
        </div>
      </header>

      <div className="pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-black text-center mb-6">
            Pagamento
          </h1>

          <div className="bg-[#121021]/50 border border-white/5 rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Plano</p>
                <p className="text-lg font-bold">{plan.label}</p>
                {plan.savings !== '0%' && (
                  <span className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded mt-1">
                    {plan.savings}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[#5E41FF]">R$ {plan.total.toFixed(2).replace('.', ',')}</p>
                <p className="text-gray-400 text-xs">R$ {plan.price.toFixed(2).replace('.', ',')}/mês</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 text-red-400 text-center text-sm">
              {error}
            </div>
          )}

          <div className="bg-[#121021]/50 border border-white/5 rounded-2xl p-4 mb-6">
            <p className="text-gray-400 text-sm mb-3">Forma de pagamento:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => changeMethod('PIX')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  selectedMethod === 'PIX' 
                    ? 'border-[#5E41FF] bg-[#5E41FF]/10' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <Pi className="w-6 h-6 text-[#5E41FF]" />
                <span className="text-xs text-gray-400">PIX</span>
              </button>
              <button
                onClick={() => changeMethod('CREDIT_CARD')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  selectedMethod === 'CREDIT_CARD' 
                    ? 'border-[#5E41FF] bg-[#5E41FF]/10' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <CreditCard className="w-6 h-6 text-[#5E41FF]" />
                <span className="text-xs text-gray-400">Cartão</span>
              </button>
              <button
                onClick={() => changeMethod('BOLETO')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  selectedMethod === 'BOLETO' 
                    ? 'border-[#5E41FF] bg-[#5E41FF]/10' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <Barcode className="w-6 h-6 text-[#5E41FF]" />
                <span className="text-xs text-gray-400">Boleto</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-[#5E41FF] animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Gerando pagamento...</p>
            </div>
          ) : paymentData ? (
            <div className="space-y-4">
              {selectedMethod === 'PIX' && (
                <div className="bg-[#121021]/50 border border-white/5 rounded-2xl p-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white mb-4">Pagamento via PIX</p>
                    
                    {paymentData.pixQrCode ? (
                      <div className="bg-white p-4 rounded-xl inline-block mb-4">
                        <img src={`data:image/png;base64,${paymentData.pixQrCode}`} alt="PIX QR Code" className="w-48 h-48" />
                      </div>
                    ) : (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4 text-yellow-400">
                        QR Code não disponível
                      </div>
                    )}
                    
                    {paymentData.pixCopiaECola ? (
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm mb-2">Código PIX:</p>
                        <div className="flex items-center gap-2 bg-black/40 rounded-xl p-3">
                          <input 
                            readOnly 
                            value={paymentData.pixCopiaECola} 
                            className="flex-1 bg-transparent text-sm text-gray-300 outline-none"
                          />
                          <button onClick={copyPix} className="p-2 bg-[#5E41FF]/20 rounded-lg hover:bg-[#5E41FF]/30">
                            {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-[#5E41FF]" />}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm">
                        Código PIX não disponível
                      </div>
                    )}
                    
                    <p className="text-gray-400 text-sm">
                      Valor: <strong className="text-white">R$ {paymentData.value?.toFixed(2).replace('.', ',')}</strong>
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Vencimento: {new Date(paymentData.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}

              {selectedMethod === 'CREDIT_CARD' && (
                <div className="bg-[#121021]/50 border border-white/5 rounded-2xl p-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white mb-4">Pagamento via Cartão</p>
                    {paymentData.invoiceUrl ? (
                      <a 
                        href={paymentData.invoiceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5E41FF] rounded-xl font-bold hover:bg-[#5E41FF]/80 transition-colors"
                      >
                        <CreditCard className="w-5 h-5" />
                        Pagar com Cartão
                      </a>
                    ) : (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-yellow-400">
                        Link de pagamento não disponível
                      </div>
                    )}
                    <p className="text-gray-400 text-sm mt-4">
                      Valor: <strong className="text-white">R$ {paymentData.value?.toFixed(2).replace('.', ',')}</strong>
                    </p>
                  </div>
                </div>
              )}

              {selectedMethod === 'BOLETO' && (
                <div className="bg-[#121021]/50 border border-white/5 rounded-2xl p-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white mb-4">Pagamento via Boleto</p>
                    {paymentData.invoiceUrl ? (
                      <a 
                        href={paymentData.invoiceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5E41FF] rounded-xl font-bold hover:bg-[#5E41FF]/80 transition-colors"
                      >
                        <Barcode className="w-5 h-5" />
                        Visualizar Boleto
                      </a>
                    ) : (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-yellow-400">
                        Boleto não disponível
                      </div>
                    )}
                    <p className="text-gray-400 text-sm mt-4">
                      Valor: <strong className="text-white">R$ {paymentData.value?.toFixed(2).replace('.', ',')}</strong>
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Vencimento: {new Date(paymentData.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={checkPaymentStatus}
                disabled={checkingPayment}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {checkingPayment ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Verificar pagamento
                  </>
                )}
              </button>
            </div>
          ) : null}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">
            <p className="text-blue-400 text-sm text-center">
              💡 Após realizar o pagamento, clique em "Verificar pagamento" para confirmar e acessar o sistema.
            </p>
          </div>

          {/* Garantias e Políticas */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-gray-500 text-xs">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <strong className="text-gray-400">Garantia de 7 dias</strong>
                <p className="text-gray-600">Direito de arrependimento conforme CDC</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-500 text-xs">
              <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <strong className="text-gray-400">Pagamento 100% seguro</strong>
                <p className="text-gray-600">Seus dados protegidos pelo Asaas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-500 text-xs">
              <div className="w-8 h-8 bg-cyan-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-cyan-500" />
              </div>
              <div>
                <strong className="text-gray-400">Suporte prioritário</strong>
                <p className="text-gray-600">Equipe pronta para ajudar você</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 text-gray-600 text-xs">
            <Lock className="w-3 h-3" />
            <span>Pagamento processado por Asaas</span>
          </div>
        </div>
      </div>
    </div>
  )
}