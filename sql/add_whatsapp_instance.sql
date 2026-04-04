-- Adicionar campo de instância WhatsApp por salão
ALTER TABLE salons ADD COLUMN IF NOT EXISTS whatsapp_instance_id TEXT;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_salons_whatsapp_instance ON salons(whatsapp_instance_id);
