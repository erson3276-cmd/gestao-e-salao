'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    salonName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPhone: ''
  })
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (data.success) {
        router.push(data.redirect || '/admin/gestao')
      } else {
        setError(data.error || 'Erro ao fazer login')
      }
    } catch {
      setError('Erro de conexão')
    }
    setLoading(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        router.push(data.redirect || '/admin/gestao')
      } else {
        setError(data.error || 'Erro ao criar conta')
      }
    } catch {
      setError('Erro de conexão')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black italic text-white">GESTÃO</h1>
          <p className="text-[#5E41FF] text-lg font-bold">E SALÃO</p>
        </div>

        {/* Form */}
        <div className="bg-[#121021] border border-white/5 p-8 rounded-3xl">
          {isRegister ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-6">Criar Conta</h2>
              
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Nome do Salão</label>
                <input
                  type="text"
                  value={formData.salonName}
                  onChange={e => setFormData({...formData, salonName: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-[#5E41FF]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Seu Nome</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={e => setFormData({...formData, ownerName: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-[#5E41FF]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">E-mail</label>
                <input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={e => setFormData({...formData, ownerEmail: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-[#5E41FF]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Senha</label>
                <input
                  type="password"
                  value={formData.ownerPassword}
                  onChange={e => setFormData({...formData, ownerPassword: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-[#5E41FF]"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#5E41FF] text-white font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>

              <p className="text-center text-gray-500 text-sm">
                Já tem conta?{' '}
                <button onClick={() => setIsRegister(false)} className="text-[#5E41FF] hover:underline">
                  Fazer login
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-6">Entrar</h2>
              
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">E-mail</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-[#5E41FF]"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Senha</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-[#5E41FF]"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#5E41FF] text-white font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <p className="text-center text-gray-500 text-sm">
                Não tem conta?{' '}
                <button onClick={() => setIsRegister(true)} className="text-[#5E41FF] hover:underline">
                  Criar conta
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
