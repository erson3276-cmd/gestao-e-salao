'use client'

import { useState } from 'react'

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])

  async function runSetup() {
    setLoading(true)
    setResults([])
    setErrors([])

    try {
      const res = await fetch('/api/setup-db', { method: 'POST' })
      const data = await res.json()
      if (data.results) setResults(data.results)
      if (data.errors) setErrors(data.errors)
    } catch (e: any) {
      setErrors([e.message])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black italic uppercase text-white">Gestão<span className="text-[#5E41FF]">E</span>Salão</h1>
          <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-gray-500 mt-2">Setup do Banco de Dados</p>
        </div>

        <div className="bg-[#121021]/50 border border-white/5 rounded-[3rem] p-10">
          <p className="text-gray-400 text-sm mb-6 text-center">
            Este processo cria as tabelas necessárias para o modo multi-tenant.
          </p>

          <button
            onClick={runSetup}
            disabled={loading}
            className="w-full py-5 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 border-b-4 border-[#3D28B8]"
          >
            {loading ? 'Executando...' : 'Rodar Setup do Banco'}
          </button>

          {(results.length > 0 || errors.length > 0) && (
            <div className="mt-8 space-y-2">
              {results.map((r, i) => (
                <div key={i} className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-mono">
                  {r}
                </div>
              ))}
              {errors.map((e, i) => (
                <div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono">
                  {e}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
