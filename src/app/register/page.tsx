'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, ArrowRight, Mail, User, Phone, Building2, Eye, EyeOff, Lock, Loader2, CreditCard } from 'lucide-react'

export default function RegisterPage() {
  const [salonName, setSalonName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [ownerCpf, setOwnerCpf] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (ownerPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    if (!ownerCpf || ownerCpf.length < 11) {
      setError('CPF e obrigatorio para pagamento')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonName, ownerName, ownerEmail, ownerPassword, ownerPhone, ownerCpf })
      })
      const data = await res.json()
      
      if (data.success) {
        router.push(data.redirect || '/admin/gestao')
        router.refresh()
      } else {
        setError(data.error || 'Erro ao criar conta')
      }
    } catch {
      setError('Erro ao conectar ao servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 selection:bg-[#5E41FF]/30">
      <div className="max-w-lg w-full space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-[#121021] border border-white/5 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative group">
             <div className="absolute inset-0 bg-[#5E41FF] rounded-[2.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
             <ShieldCheck className="w-12 h-12 text-[#5E41FF] relative z-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter italic uppercase text-white/90">Gestão<span className="text-[#5E41FF]">E</span>Salão</h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-gray-500 mt-2">Cadastre seu Salão Grátis</p>
          </div>
        </div>

        <div className="bg-[#121021]/50 border border-white/5 rounded-[3rem] p-10 shadow-3xl backdrop-blur-xl relative overflow-hidden">
           <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#5E41FF]/10 blur-[80px]" />
           
           <form onSubmit={handleSubmit} className="space-y-5 relative z-10" autoComplete="off">
              <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 px-1">Nome do Salão</label>
                 <div className="relative group">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#5E41FF] transition-colors" size={20} />
                    <input type="text" value={salonName} onChange={(e) => setSalonName(e.target.value)} placeholder="Ex: Studio Beleza" required className="w-full pl-14 pr-6 py-4 bg-black/40 border border-white/5 rounded-2xl outline-none focus:border-[#5E41FF]/50 focus:ring-1 focus:ring-[#5E41FF]/20 transition-all text-white placeholder:text-gray-800" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 px-1">Seu Nome</label>
                 <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#5E41FF] transition-colors" size={20} />
                    <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Seu nome completo" required className="w-full pl-14 pr-6 py-4 bg-black/40 border border-white/5 rounded-2xl outline-none focus:border-[#5E41FF]/50 focus:ring-1 focus:ring-[#5E41FF]/20 transition-all text-white placeholder:text-gray-800" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 px-1">Email</label>
                 <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#5E41FF] transition-colors" size={20} />
                    <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="seu@email.com" required className="w-full pl-14 pr-6 py-4 bg-black/40 border border-white/5 rounded-2xl outline-none focus:border-[#5E41FF]/50 focus:ring-1 focus:ring-[#5E41FF]/20 transition-all text-white placeholder:text-gray-800" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 px-1">CPF (obrigatorio para pagamento)</label>
                 <div className="relative group">
                    <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#5E41FF] transition-colors" size={20} />
                    <input type="text" value={ownerCpf} onChange={(e) => setOwnerCpf(e.target.value.replace(/\D/g, ''))} placeholder="000.000.000-00" required maxLength={11} className="w-full pl-14 pr-6 py-4 bg-black/40 border border-white/5 rounded-2xl outline-none focus:border-[#5E41FF]/50 focus:ring-1 focus:ring-[#5E41FF]/20 transition-all text-white placeholder:text-gray-800" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 px-1">WhatsApp (opcional)</label>
                 <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#5E41FF] transition-colors" size={20} />
                    <input type="tel" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="(11) 99999-9999" className="w-full pl-14 pr-6 py-4 bg-black/40 border border-white/5 rounded-2xl outline-none focus:border-[#5E41FF]/50 focus:ring-1 focus:ring-[#5E41FF]/20 transition-all text-white placeholder:text-gray-800" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 px-1">Senha</label>
                 <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#5E41FF] transition-colors" size={20} />
                    <input type={showPassword ? 'text' : 'password'} value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required autoComplete="new-password" name="new-salon-password" id="new-salon-password" className="w-full pl-14 pr-14 py-4 bg-black/40 border border-white/5 rounded-2xl outline-none focus:border-[#5E41FF]/50 focus:ring-1 focus:ring-[#5E41FF]/20 transition-all text-white placeholder:text-gray-800" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                 </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center animate-shake">
                   {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || !salonName || !ownerName || !ownerEmail || !ownerPassword}
                className="w-full py-5 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-[#5E41FF]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 group border-b-4 border-[#3D28B8]"
              >
                 {loading ? <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" /> : (
                   <>
                      Criar Conta Grátis
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                   </>
                 )}
              </button>
           </form>
        </div>

        <p className="text-center text-[10px] text-gray-600 uppercase font-bold tracking-widest">
           Já tem conta?{' '}
           <Link href="/login" className="text-[#5E41FF] hover:underline">
             Fazer login
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
