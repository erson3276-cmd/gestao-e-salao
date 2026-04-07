-- Corrigir RLS para tabela despesas
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for despesas" ON despesas;
CREATE POLICY "Allow all for despesas" ON despesas FOR ALL USING (true) WITH CHECK (true);