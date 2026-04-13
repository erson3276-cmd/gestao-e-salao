'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, ShieldCheck, ArrowLeft, Mail, Loader2, Check, Copy } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      
      if (data.success) {
        setSuccess(true)
        setNewPassword(data.newPassword || '')
      } else {
        setError(data.error || 'Erro ao processar solicitação')
      }
    } catch {
      setError('Erro ao conectar ao servidor')
    } finally {
      setLoading(false)
    }
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(newPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 selection:bg-[#5E41FF]/30">
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
              <Check className="w-12 h-12 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter italic uppercase text-white/90">Nova Senha</h1>
              <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-gray-500 mt-2">Gerada com Sucesso</p>
            </div>
          </div>

          <div className="bg-[#121021]/50 border border-white/5 rounded-[3rem] p-10 shadow-3xl">
            <div className="space-y-6">
              <p className="text-gray-400 text-sm text-center">
                Sua nova senha foi gerada. <strong className="text-white">Copie agora!</strong>
              </p>
              
              <div className="p-4 bg-black/40 border border-[#5E41FF]/20 rounded-2xl">
                <div className="flex items-center justify-between gap-4">
                  <code className="text-xl font-mono text-[#5E41FF] break-all flex-1">{newPassword}</code>
                  <button
                    onClick={copyPassword}
                    className="p-3 bg-[#5E41FF]/10 rounded-xl hover:bg-[#5E41FF]/20 transition-all flex-shrink-0"
                  >
                    {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                <p className="text-yellow-500 text-xs font-bold text-center">
                  ⚠️ Anote esta senha! Ela não será mostrada novamente.
                </p>
              </div>

              <button
                onClick={() => router.push('/login')}
                className="w-full py-4 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#4a33cc] transition-all border-b-4 border-[#3D28B8]"
              >
                Fazer Login
                <ArrowLeft size={18} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 selection:bg-[#5E41FF]/30">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-4">
          <Link href="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4">
            <ArrowLeft size={18} />
            <span className="text-xs uppercase font-bold tracking-widest">Voltar</span>
          </Link>
          
          <div className="w-24 h-24 mx-auto bg-[#121021] border border-white/5 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
            <Lock className="w-12 h-12 text-[#5E41FF]" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter italic uppercase text-white/90">Esqueci a Senha</h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-gray-500 mt-2">Recupere seu Acesso</p>
          </div>
        </div>

        <div className="bg-[#121021]/50 border border-white/5 rounded-[3rem] p-10 shadow-3xl">
          <div className="space-y-6">
            <p className="text-gray-400 text-sm text-center">
              Digite seu email e enviaremos uma nova senha temporária.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 px-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#5E41FF] transition-colors" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-2xl outline-none focus:border-[#5E41FF]/50 focus:ring-1 focus:ring-[#5E41FF]/20 transition-all text-white placeholder:text-gray-800"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || !email}
                className="w-full py-5 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-[#5E41FF]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 border-b-4 border-[#3D28B8]"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  'Gerar Nova Senha'
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-600 uppercase font-bold tracking-widest">
          Já tem conta?{' '}
          <Link href="/login" className="text-[#5E41FF] hover:underline">
            Fazer Login
          </Link>
        </p>
      </div>
    </main>
  )
}
