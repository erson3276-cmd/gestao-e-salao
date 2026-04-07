-- =====================================================
-- TABELA DE DESPESAS - Reescrita do Zero
-- =====================================================

-- 1. Recriar tabela com nova estrutura
DROP TABLE IF EXISTS despesas CASCADE;

CREATE TABLE despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL DEFAULT 'Outros',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid BOOLEAN DEFAULT false,
  paid_date DATE,
  recurring BOOLEAN DEFAULT false,
  recurrence_type TEXT, -- 'daily', 'weekly', 'monthly', 'yearly'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices otimizados
CREATE INDEX idx_despesas_date ON despesas(date);
CREATE INDEX idx_despesas_due_date ON despesas(due_date);
CREATE INDEX idx_despesas_category ON despesas(category);
CREATE INDEX idx_despesas_paid ON despesas(paid);
CREATE INDEX idx_despesas_recurring ON despesas(recurring);

-- 3. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_despesas_updated_at
  BEFORE UPDATE ON despesas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. RLS - Permitir todas operações (backend admin)
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for despesas" ON despesas;
CREATE POLICY "Allow all for despesas" ON despesas 
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Verificar
SELECT 'Despesas table created successfully!' as result;
SELECT COUNT(*) as total_despesas FROM despesas;
