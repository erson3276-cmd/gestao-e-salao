-- Add missing columns to salons table
ALTER TABLE salons ADD COLUMN IF NOT EXISTS owner_cpf TEXT;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS owner_phone TEXT;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS owner_password TEXT;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'pending';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'salons'
ORDER BY ordinal_position;
