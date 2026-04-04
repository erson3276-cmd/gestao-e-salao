'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'
import { Loader2, ArrowRight } from 'lucide-react'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading')
  const [error, setError] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function handleCallback() {
      try {
        const hash = window.location.hash.substring(1)
        if (!hash) {
          setStatus('error')
          setError('Nenhum token recebido')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (!accessToken) {
          setStatus('error')
          setError('Token de acesso não encontrado')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        const { data: sessionData, error: sessionError } = await supabaseClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })

        if (sessionError || !sessionData.session) {
          setStatus('error')
          setError('Falha ao criar sessão')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        const email = sessionData.session.user.email
        const name = sessionData.session.user.user_metadata?.full_name || email.split('@')[0]

        if (!email) {
          setStatus('error')
          setError('Email não disponível')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        const res = await fetch('/api/auth/google-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name })
        })

        const result = await res.json()

        if (result.success && !result.needsRegister) {
          router.push('/admin/agenda')
          router.refresh()
        } else if (result.needsRegister) {
          setStatus('redirecting')
          const url = `/register/google-setup?email=${encodeURIComponent(email)}&name=${encodeURIComponent(result.name || name)}`
          setRedirectUrl(url)
          setTimeout(() => router.push(url), 1500)
        } else {
          setStatus('error')
          setError(result.error || 'Erro ao processar login')
          setTimeout(() => router.push('/login'), 3000)
        }
      } catch {
        setStatus('error')
        setError('Erro ao conectar ao servidor')
        setTimeout(() => router.push('/login'), 3000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto bg-[#5E41FF]/10 border border-[#5E41FF]/20 rounded-2xl flex items-center justify-center">
              <Loader2 size={32} className="text-[#5E41FF] animate-spin" />
            </div>
            <h2 className="text-xl font-black italic uppercase text-white">Conectando com Google...</h2>
            <p className="text-gray-500 text-sm">Aguarde um momento</p>
          </>
        )}

        {status === 'redirecting' && (
          <>
            <div className="w-16 h-16 mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
              <ArrowRight size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-black italic uppercase text-white">Salão não encontrado</h2>
            <p className="text-gray-400 text-sm">Redirecionando para criar seu salão...</p>
            <button onClick={() => router.push(redirectUrl)} className="px-6 py-3 bg-[#5E41FF] text-white rounded-xl text-sm font-bold">
              Ir agora
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-xl font-black italic uppercase text-white">{error}</h2>
            <p className="text-gray-500 text-sm">Redirecionando para o login...</p>
          </>
        )}
      </div>
    </main>
  )
}
