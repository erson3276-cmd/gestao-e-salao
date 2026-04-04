'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, ShieldCheck, ArrowRight, Mail, Loader2 } from 'lucide-react'
import { supabaseClient } from '@/lib/supabaseClient'

const errorMessages: Record<string, string> = {
  missing_code: 'Erro na autenticação. Tente novamente.',
  auth_failed: 'Falha na autenticação Google. Tente novamente.',
  no_email: 'Não foi possível obter seu email do Google.',
  blocked: 'Sua conta está bloqueada. Entre em contato com o suporte.',
  server_error: 'Erro no servidor. Tente novamente.',
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const err = searchParams.get('error')
    if (err && errorMessages[err]) {
      setError(errorMessages[err])
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
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
        router.push(data.redirect || '/admin/agenda')
        router.refresh()
      } else {
        setError(data.error || 'Email ou senha incorretos')
      }
    } catch {
      setError('Erro ao conectar ao servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) {
        setError(error.message || 'Erro ao iniciar login com Google')
        setGoogleLoading(false)
      }
    } catch {
      setError('Erro ao conectar com Google')
      setGoogleLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 selection:bg-[#5E41FF]/30">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-[#121021] border border-white/5 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative group">
             <div className="absolute inset-0 bg-[#5E41FF] rounded-[2.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
             <ShieldCheck className="w-12 h-12 text-[#5E41FF] relative z-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter italic uppercase text-white/90">Gestão<span className="text-[#5E41FF]">E</span>Salão</h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-gray-500 mt-2">Acesse seu Painel</p>
          </div>
        </div>

        <div className="bg-[#121021]/50 border border-white/5 rounded-[3rem] p-10 shadow-3xl backdrop-blur-xl relative overflow-hidden">
           <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#5E41FF]/10 blur-[80px]" />
           
           <div className="space-y-6 relative z-10">
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-gray-100 transition-all disabled:opacity-50 border-b-4 border-gray-300"
              >
                {googleLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
                    </svg>
                    Entrar com Google
                  </>
                )}
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-600">ou</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 px-1">Email</label>
                    <div className="relative group">
                       <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#5E41FF] transition-colors" size={20} />
                       <input 
                         type="email" 
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         placeholder="seu@email.com"
                         autoFocus
                         required
                         className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-2xl outline-none focus:border-[#5E41FF]/50 focus:ring-1 focus:ring-[#5E41FF]/20 transition-all text-white placeholder:text-gray-800"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 px-1">Senha</label>
                    <div className="relative group">
                       <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#5E41FF] transition-colors" size={20} />
                       <input 
                         type="password" 
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         placeholder="••••••••"
                         required
                         className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-2xl outline-none focus:border-[#5E41FF]/50 focus:ring-1 focus:ring-[#5E41FF]/20 transition-all font-mono text-xl tracking-widest text-white placeholder:text-gray-800"
                       />
                    </div>
                 </div>

                 {error && (
                   <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center animate-shake">
                      {error}
                   </div>
                 )}

                  <button 
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full py-5 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-[#5E41FF]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 group border-b-4 border-[#3D28B8]"
                  >
                     {loading ? <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" /> : (
                       <>
                          Entrar
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                       </>
                     )}
                  </button>
                  
                  <div className="text-center">
                    <Link href="/recuperar-senha" className="text-[10px] text-gray-500 hover:text-[#5E41FF] transition-colors uppercase font-bold tracking-widest">
                      Esqueci minha senha
                    </Link>
                  </div>
               </form>
           </div>
        </div>

        <p className="text-center text-[10px] text-gray-600 uppercase font-bold tracking-widest">
           Não tem conta?{' '}
           <Link href="/register" className="text-[#5E41FF] hover:underline">
             Cadastre seu salão grátis
           </Link>
        </p>

        <style jsx global>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
          }
          .animate-shake { animation: shake 0.2s ease-in-out; }
        `}</style>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#5E41FF]/30 border-t-[#5E41FF] rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
