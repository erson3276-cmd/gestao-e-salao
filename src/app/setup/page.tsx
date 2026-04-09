'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, Database } from 'lucide-react'

export default function SetupPage() {
  const [copied, setCopied] = useState(false)

  const sql = `-- GESTAO E SALAO - UPDATE TRIAL COLUMNS
-- Execute no: https://supabase.com/dashboard/project/ssdqkvsbhebrqihoekzz/sql

-- 1. Adicionar colunas de trial na tabela salons (se não existirem)
ALTER TABLE salons ADD COLUMN IF NOT EXISTS trial_start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE salons ADD COLUMN IF NOT EXISTS trial_end_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS onboarding_sent JSONB DEFAULT '{}';

-- 2. Atualizar status de 'active' para 'trial' em salões que ainda não expiraram
-- Execute apenas se quiser converter assinaturas ativas em trial
-- UPDATE salons SET status = 'trial', trial_start_at = NOW(), trial_end_at = NOW() + INTERVAL '14 days' WHERE status = 'active' AND subscription_ends_at > NOW();

-- 3. Criar índice para trial (opcional)
CREATE INDEX IF NOT EXISTS idx_salons_trial_end ON salons(trial_end_at) WHERE status = 'trial';`

  function copySql() {
    navigator.clipboard.writeText(sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-[#121021] border border-white/5 rounded-[2rem] flex items-center justify-center">
            <Database className="w-10 h-10 text-[#5E41FF]" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter italic uppercase text-white/90">Gestão<span className="text-[#5E41FF]">E</span>Salão</h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-gray-500 mt-2">Update Trial Columns</p>
          </div>
        </div>

        <div className="bg-[#121021]/50 border border-white/5 rounded-[2rem] p-8 space-y-6">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white mb-2">Passo 1: Acesse o SQL Editor</h2>
            <a
              href="https://supabase.com/dashboard/project/ssdqkvsbhebrqihoekzz/sql"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-3 bg-[#5E41FF]/10 border border-[#5E41FF]/20 rounded-xl text-[#5E41FF] text-sm font-bold hover:bg-[#5E41FF]/20 transition-all"
            >
              Abrir SQL Editor do Supabase <ExternalLink size={14} />
            </a>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white mb-2">Passo 2: Copie e cole o SQL</h2>
            <button
              onClick={copySql}
              className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/10 transition-all"
            >
              {copied ? <><Check size={14} className="text-emerald-500" /> Copiado!</> : <><Copy size={14} /> Copiar SQL</>}
            </button>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white mb-2">Passo 3: Clique em Run</h2>
            <p className="text-gray-500 text-xs">Após colar o SQL, clique no botão "Run" no canto inferior direito.</p>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-emerald-400 text-xs font-bold">
              As colunas de trial serão adicionadas automaticamente.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
