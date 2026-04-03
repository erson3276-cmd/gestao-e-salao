-- Migracao para a nova estrutura de despesas
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar novas colunas
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS paid_date DATE;
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Adicionar indices
CREATE INDEX IF NOT EXISTS idx_despesas_due_date ON despesas(due_date);

-- 3. Recriar trigger para updated_at (se necessario)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_despesas_updated_at ON despesas;
CREATE TRIGGER update_despesas_updated_at
  BEFORE UPDATE ON despesas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Verificar resultado
SELECT 'Migration completed. Colunas: ' || 
  COALESCE(array_to_string(ARRAY(
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'despesas' 
    ORDER BY column_name
  ), ', '), 'N/A') as result;
