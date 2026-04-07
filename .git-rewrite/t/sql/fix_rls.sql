-- Fix RLS policies to allow all operations
-- Run in Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable all for service role" ON services;
DROP POLICY IF EXISTS "Enable all for authenticated" ON services;
DROP POLICY IF EXISTS "Enable read access for anon" ON services;

-- Create permissive policies for all
CREATE POLICY "allow_all_services" ON services FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Also fix for customers
DROP POLICY IF EXISTS "Enable all for service role" ON customers;
DROP POLICY IF EXISTS "Enable all for authenticated" ON customers;
CREATE POLICY "allow_all_customers" ON customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Also fix for appointments
DROP POLICY IF EXISTS "Enable all for service role" ON appointments;
DROP POLICY IF EXISTS "Enable all for authenticated" ON appointments;
CREATE POLICY "allow_all_appointments" ON appointments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Also fix for vendas
DROP POLICY IF EXISTS "Enable all for service role" ON vendas;
DROP POLICY IF EXISTS "Enable all for authenticated" ON vendas;
CREATE POLICY "allow_all_vendas" ON vendas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Check result
SELECT 'Policies fixed' as result;
