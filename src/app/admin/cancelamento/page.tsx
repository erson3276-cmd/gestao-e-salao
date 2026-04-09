'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertTriangle, CheckCircle2, ArrowLeft, Info } from 'lucide-react'

export default function RefundPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [reason, setReason] = useState('')

  async function handleRefund() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Erro ao processar reembolso')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-black text-white mb-4">Reembolso Solicitado!</h1>
          <p className="text-gray-400 mb-6">
            Seu reembolso foi processado com sucesso. O valor será devolvido para o método de pagamento utilizado.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Você será redirecionado para a página inicial...
          </p>
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5E41FF] text-white rounded-xl font-bold">
            Voltar para Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/gestao" className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-2xl font-black text-white">
            Solicitar Reembolso
          </h1>
        </div>

        <div className="bg-[#121021]/50 border border-white/5 rounded-3xl p-6 space-y-6">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-yellow-400 font-bold text-sm mb-1">
                  Direito de Arrependimento
                </h3>
                <p className="text-yellow-400/80 text-xs">
                  Conforme a legislação brasileira (Código de Defesa do Consumidor), você tem até 7 dias após a compra para solicitar o reembolso integral.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-blue-400 font-bold text-sm mb-1">
                  Como funciona o reembolso
                </h3>
                <ul className="text-blue-400/80 text-xs space-y-1">
                  <li>• O valor será devolvido para o mesmo método de pagamento</li>
                  <li>• PIX: retorno em segundos</li>
                  <li>• Cartão de crédito: até na próxima fatura</li>
                  <li>• Boleto: em até 7 dias úteis</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Motivo do cancelamento (opcional)
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full p-3 bg-black/40 border border-white/5 rounded-xl text-white"
            >
              <option value="">Selecione um motivo</option>
              <option value="Produto não atendeu expectativas">Produto não atendeu expectativas</option>
              <option value="Preço maior que esperado">Preço maior que esperado</option>
              <option value="Encontrou outra solução">Encontrou outra solução</option>
              <option value="Erro ao realizar compra">Erro ao realizar compra</option>
              <option value="Outro motivo">Outro motivo</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleRefund}
            disabled={loading}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <AlertTriangle className="w-5 h-5" />
                Confirmar Reembolso
              </>
            )}
          </button>

          <div className="text-center">
            <Link href="/admin/gestao" className="text-gray-500 text-sm hover:text-white">
              Não quero cancelar, voltar ao sistema
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}