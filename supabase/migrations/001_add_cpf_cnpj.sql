-- Migration: Add cpf_cnpj column to salons
ALTER TABLE salons ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;
