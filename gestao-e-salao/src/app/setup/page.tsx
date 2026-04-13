'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, Database } from 'lucide-react'

export default function SetupPage() {
  const [copied, setCopied] = useState(false)

  const sql = `-- GESTAO E SALAO - MULTI-TENANT SETUP
-- Execute no: https://supabase.com/dashboard/project/ssdqkvsbhebrqihoekzz/sql

-- 1. Criar tabela de Saloes
CREATE TABLE IF NOT EXISTS salons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_email TEXT UNIQUE NOT NULL,
  owner_password TEXT NOT NULL,
  owner_phone TEXT,
  whatsapp_number TEXT,
  address TEXT,
  image_url TEXT,
  plan TEXT DEFAULT 'profissional',
  status TEXT DEFAULT 'active',
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar salon_id em todas as tabelas
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE services ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE comissao ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE whatsapp_status ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE blocked_slots ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE working_hours ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE notes ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);

-- 3. Criar indices
CREATE INDEX IF NOT EXISTS idx_appointments_salon ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_customers_salon ON customers(salon_id);
CREATE INDEX IF NOT EXISTS idx_services_salon ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_vendas_salon ON vendas(salon_id);
CREATE INDEX IF NOT EXISTS idx_despesas_salon ON despesas(salon_id);
CREATE INDEX IF NOT EXISTS idx_comissao_salon ON comissao(salon_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_salon ON whatsapp_messages(salon_id);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_salon ON blocked_slots(salon_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_salon ON working_hours(salon_id);
CREATE INDEX IF NOT EXISTS idx_professionals_salon ON professionals(salon_id);
CREATE INDEX IF NOT EXISTS idx_notes_salon ON notes(salon_id);

-- 4. Criar bucket de storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('salon-photos', 'salon-photos', true)
ON CONFLICT (id) DO NOTHING;`

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
            <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-gray-500 mt-2">Setup do Banco de Dados</p>
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
              Depois de rodar o SQL, o sistema multi-tenant estará ativado. Você já pode fechar esta página.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
