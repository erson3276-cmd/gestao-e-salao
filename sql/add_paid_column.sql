-- Adicionar coluna 'paid' se não existir
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT false;