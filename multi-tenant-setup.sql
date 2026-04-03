-- ==========================================
-- GESTÃO E SALÃO - MULTI-TENANT SETUP
-- Execute este SQL no Supabase SQL Editor
-- ==========================================

-- 1. Criar tabela de Salões (Clientes do SaaS)
CREATE TABLE IF NOT EXISTS salons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_email TEXT UNIQUE NOT NULL,
  owner_password TEXT NOT NULL, -- Senha hash (bcrypt)
  owner_phone TEXT,
  whatsapp_number TEXT,
  address TEXT,
  image_url TEXT,
  plan TEXT DEFAULT 'profissional', -- basico, profissional, premium
  status TEXT DEFAULT 'active', -- active, inactive, blocked
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar salon_id em TODAS as tabelas existentes
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

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_appointments_salon ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_customers_salon ON customers(salon_id);
CREATE INDEX IF NOT EXISTS idx_services_salon ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_vendas_salon ON vendas(salon_id);
CREATE INDEX IF NOT EXISTS idx_despesas_salon ON despesas(salon_id);
CREATE INDEX IF NOT EXISTS idx_comissao_salon ON comissao(salon_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_salon ON whatsapp_messages(salon_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_status_salon ON whatsapp_status(salon_id);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_salon ON blocked_slots(salon_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_salon ON working_hours(salon_id);
CREATE INDEX IF NOT EXISTS idx_professionals_salon ON professionals(salon_id);
CREATE INDEX IF NOT EXISTS idx_notes_salon ON notes(salon_id);

-- 4. Configurar RLS (Row Level Security) em TODAS as tabelas
-- Isso garante que cada salão SÓ VEJA seus próprios dados

-- Appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Salons can only see own appointments" ON appointments;
CREATE POLICY "Salons can only see own appointments" ON appointments
  FOR ALL USING (salon_id = auth.uid() OR salon_id IN (SELECT id FROM salons WHERE owner_email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Salons can only see own customers" ON customers;
CREATE POLICY "Salons can only see own customers" ON customers
  FOR ALL USING (salon_id = auth.uid() OR salon_id IN (SELECT id FROM salons WHERE owner_email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Salons can only see own services" ON services;
CREATE POLICY "Salons can only see own services" ON services
  FOR ALL USING (salon_id = auth.uid() OR salon_id IN (SELECT id FROM salons WHERE owner_email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Vendas
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Salons can only see own vendas" ON vendas;
CREATE POLICY "Salons can only see own vendas" ON vendas
  FOR ALL USING (salon_id = auth.uid() OR salon_id IN (SELECT id FROM salons WHERE owner_email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Despesas
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Salons can only see own despesas" ON despesas;
CREATE POLICY "Salons can only see own despesas" ON despesas
  FOR ALL USING (salon_id = auth.uid() OR salon_id IN (SELECT id FROM salons WHERE owner_email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Comissão
ALTER TABLE comissao ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Salons can only see own comissao" ON comissao;
CREATE POLICY "Salons can only see own comissao" ON comissao
  FOR ALL USING (salon_id = auth.uid() OR salon_id IN (SELECT id FROM salons WHERE owner_email = current_setting('request.jwt.claims', true)::json->>'email'));

-- WhatsApp Messages
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Salons can only see own whatsapp_messages" ON whatsapp_messages;
CREATE POLICY "Salons can only see own whatsapp_messages" ON whatsapp_messages
  FOR ALL USING (salon_id = auth.uid() OR salon_id IN (SELECT id FROM salons WHERE owner_email = current_setting('request.jwt.claims', true)::json->>'email'));

-- WhatsApp Status
ALTER TABLE whatsapp_status ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Salons can only see own whatsapp_status" ON whatsapp_status;
CREATE POLICY "Salons can only see own whatsapp_status" ON whatsapp_status
  FOR ALL USING (salon_id = auth.uid() OR salon_id IN (SELECT id FROM salons WHERE owner_email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Blocked Slots
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Salons can only see own blocked_slots" ON blocked_slots;
CREATE POLICY "Salons can only see own blocked_slots" ON blocked_slots
  FOR ALL USING (salon_id = auth.uid() OR salon_id IN (SELECT id FROM salons WHERE owner_email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Working Hours
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Salons can only see own working_hours" ON working_hours;
CREATE POLICY "Salons can only see own working_hours" ON working_hours
  FOR ALL USING (salon_id = auth.uid() OR salon_id IN (SELECT id FROM salons WHERE owner_email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Professionals
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Salons can only see own professionals" ON professionals;
CREATE POLICY "Salons can only see own professionals" ON professionals
  FOR ALL USING (salon_id = auth.uid() OR salon_id IN (SELECT id FROM salons WHERE owner_email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Salons can only see own notes" ON notes;
CREATE POLICY "Salons can only see own notes" ON notes
  FOR ALL USING (salon_id = auth.uid() OR salon_id IN (SELECT id FROM salons WHERE owner_email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Salons RLS
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see own salon" ON salons;
CREATE POLICY "Users can only see own salon" ON salons
  FOR SELECT USING (owner_email = current_setting('request.jwt.claims', true)::json->>'email');

-- 5. Criar função para migrar dados existentes para o primeiro salão
-- (Isso move os dados atuais para o salão "demo")
DO $$
DECLARE
  demo_salon_id UUID;
BEGIN
  -- Criar salão demo se não existir
  IF NOT EXISTS (SELECT 1 FROM salons WHERE owner_email = 'demo@gestaoesalao.com') THEN
    INSERT INTO salons (name, owner_name, owner_email, owner_password, plan, status)
    VALUES ('Salão Demo', 'Admin', 'demo@gestaoesalao.com', 'demo123', 'profissional', 'active')
    RETURNING id INTO demo_salon_id;
    
    -- Atualizar todos os registros existentes com o salon_id do demo
    UPDATE appointments SET salon_id = demo_salon_id WHERE salon_id IS NULL;
    UPDATE customers SET salon_id = demo_salon_id WHERE salon_id IS NULL;
    UPDATE services SET salon_id = demo_salon_id WHERE salon_id IS NULL;
    UPDATE vendas SET salon_id = demo_salon_id WHERE salon_id IS NULL;
    UPDATE despesas SET salon_id = demo_salon_id WHERE salon_id IS NULL;
    UPDATE comissao SET salon_id = demo_salon_id WHERE salon_id IS NULL;
    UPDATE whatsapp_messages SET salon_id = demo_salon_id WHERE salon_id IS NULL;
    UPDATE whatsapp_status SET salon_id = demo_salon_id WHERE salon_id IS NULL;
    UPDATE blocked_slots SET salon_id = demo_salon_id WHERE salon_id IS NULL;
    UPDATE working_hours SET salon_id = demo_salon_id WHERE salon_id IS NULL;
    UPDATE professionals SET salon_id = demo_salon_id WHERE salon_id IS NULL;
    UPDATE notes SET salon_id = demo_salon_id WHERE salon_id IS NULL;
  END IF;
END $$;

-- 6. Criar bucket de storage para fotos dos salões
INSERT INTO storage.buckets (id, name, public)
VALUES ('salon-photos', 'salon-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Política de storage para fotos
DROP POLICY IF EXISTS "Anyone can view salon photos" ON storage.objects;
CREATE POLICY "Anyone can view salon photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'salon-photos');

DROP POLICY IF EXISTS "Authenticated users can upload salon photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload salon photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'salon-photos');
