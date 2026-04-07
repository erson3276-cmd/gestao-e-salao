-- ================================================
-- FIX RLS - Execute this in Supabase SQL Editor
-- ================================================

-- Disable RLS on all tables
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendas DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('services', 'customers', 'appointments', 'vendas', 'profiles');

-- ================================================
-- SEED DATA - Run after disabling RLS
-- ================================================

-- Insert services
INSERT INTO services (name, price, duration_minutes, category) VALUES
  ('Corte Feminino', 80, 60, 'Cabelo'),
  ('Corte Masculino', 50, 30, 'Cabelo'),
  ('Escova', 60, 45, 'Cabelo'),
  ('Pintura Completa', 120, 120, 'Cabelo'),
  ('Hidratação', 70, 45, 'Cabelo'),
  ('Manicure', 40, 45, 'Unhas'),
  ('Pedicure', 50, 60, 'Unhas'),
  ('Sobrancelha', 30, 20, 'Estética'),
  ('Depilação', 25, 15, 'Depilação'),
  ('Maquiagem', 150, 60, 'Maquiagem');

-- Insert sample customers
INSERT INTO customers (name, whatsapp) VALUES
  ('Maria Silva', '5521999990001'),
  ('Ana Costa', '5521999990002'),
  ('Julia Santos', '5521999990003'),
  ('Carla Oliveira', '5521999990004'),
  ('Fernanda Lima', '5521999990005');

-- Update profile
UPDATE profiles SET 
  name = 'Moça Chiq',
  professional_name = 'Suanne Chagas',
  address = 'Avenida João Ribeiro 444, Pilares RJ',
  whatsapp_number = '5521984559663',
  opening_time = '09:00',
  closing_time = '18:00',
  slot_interval = 60
WHERE id = (SELECT id FROM profiles LIMIT 1);

-- Verify data
SELECT 'Services:' as table_name, COUNT(*) as count FROM services
UNION ALL
SELECT 'Customers:', COUNT(*) FROM customers
UNION ALL
SELECT 'Profiles:', COUNT(*) FROM profiles;
