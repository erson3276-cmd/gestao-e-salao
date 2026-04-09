'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Lock } from 'lucide-react'
import { trackLead } from '@/lib/meta-pixel'

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
      
      if (data.success) {
        trackLead()
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