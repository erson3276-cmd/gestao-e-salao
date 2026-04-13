'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react'
import { trackCompleteRegistration } from '@/lib/meta-pixel'

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#5E41FF]/30 border-t-[#5E41FF] rounded-full animate-spin" /></div>}>
      <RegisterContent />
    </Suspense>
  )
}

function RegisterContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [salonId, setSalonId] = useState('')
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  
  const [formData, setFormData] = useState({
    salonName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: ''
  })

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
          ownerPhone: formData.ownerPhone
        })
      })
      const data = await res.json()
      
      if (data.success && data.step === 'verification') {
        setSalonId(data.salonId)
        setStep('verify')
      } else if (data.success) {
        trackCompleteRegistration()
        router.push('/admin')
      } else {
        setError(data.error || 'Erro ao criar conta')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    const code = verificationCode.join('').toUpperCase()
    if (code.length !== 6) {
      setError('Digite o código completo')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonId, code })
      })
      const data = await res.json()
      
      if (data.success) {
        trackCompleteRegistration()
        router.push('/admin')
      } else {
        setError(data.error || 'Código incorreto')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleCodeChange(index: number, value: string) {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return
    
    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)
    
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus()
    }
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#5E41FF]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#5E41FF]" />
            </div>
            <h1 className="text-2xl font-black italic text-white">
              Confirme seu email
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Enviamos um código para <span className="text-white">{formData.ownerEmail}</span>
            </p>
          </div>

          <div className="bg-[#121021]/50 border border-white/5 rounded-3xl p-6">
            <div className="flex justify-center gap-2 mb-6">
              {verificationCode.map((digit, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleCodeChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-12 h-14 bg-black/40 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:border-[#5E41FF] focus:outline-none"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm mt-4 text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || verificationCode.join('').length < 6}
              className="w-full mt-4 py-3 bg-[#5E41FF] text-white rounded-xl font-black disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirmar <ArrowRight className="w-5 h-5" /></>}
            </button>

            <button
              onClick={() => setStep('register')}
              className="w-full mt-3 py-2 text-gray-500 text-sm flex items-center justify-center gap-2 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </div>

          <p className="text-center text-gray-600 text-xs">
            Não recebeu o código? <button className="text-[#5E41FF] hover:underline" onClick={handleRegister}>Reenviar</button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black italic text-white">
            Gestão<span className="text-[#5E41FF]">E</span>Salão
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Crie sua conta grátis
          </p>
        </div>

        <div className="bg-[#121021]/50 border border-white/5 rounded-3xl p-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-emerald-400 font-black text-lg">TESTE GRÁTIS POR 14 DIAS</p>
            <p className="text-gray-400 text-sm">Sem compromisso, sem cartão de crédito</p>
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
            className="w-full mt-6 py-3 bg-[#5E41FF] text-white rounded-xl font-black disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'CRIAR CONTA GRÁTIS'}
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