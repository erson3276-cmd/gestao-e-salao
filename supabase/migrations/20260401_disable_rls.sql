-- supabase/migrations/20260401_disable_rls.sql
-- Disable RLS and seed data

-- Disable RLS on all tables
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendas DISABLE ROW LEVEL SECURITY;

-- Insert services if empty
INSERT INTO services (name, price, duration_minutes, category) 
SELECT ('Corte Feminino', 80, 60, 'Cabelo')
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Corte Feminino');

INSERT INTO services (name, price, duration_minutes, category) 
SELECT ('Corte Masculino', 50, 30, 'Cabelo')
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Corte Masculino');

INSERT INTO services (name, price, duration_minutes, category) 
SELECT ('Escova', 60, 45, 'Cabelo')
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Escova');

INSERT INTO services (name, price, duration_minutes, category) 
SELECT ('Pintura Completa', 120, 120, 'Cabelo')
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Pintura Completa');

INSERT INTO services (name, price, duration_minutes, category) 
SELECT ('Hidratação', 70, 45, 'Cabelo')
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Hidratação');

INSERT INTO services (name, price, duration_minutes, category) 
SELECT ('Manicure', 40, 45, 'Unhas')
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Manicure');

INSERT INTO services (name, price, duration_minutes, category) 
SELECT ('Pedicure', 50, 60, 'Unhas')
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Pedicure');

INSERT INTO services (name, price, duration_minutes, category) 
SELECT ('Sobrancelha', 30, 20, 'Estética')
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Sobrancelha');

INSERT INTO services (name, price, duration_minutes, category) 
SELECT ('Depilação', 25, 15, 'Depilação')
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Depilação');

INSERT INTO services (name, price, duration_minutes, category) 
SELECT ('Maquiagem', 150, 60, 'Maquiagem')
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Maquiagem');
