import { Pool } from 'pg'

const pool = new Pool({
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.ssdqkvsbhebrqihoekzz',
  password: process.env.SUPABASE_DB_PASSWORD || '',
  ssl: { rejectUnauthorized: false },
})

async function main() {
  const client = await pool.connect()
  try {
    console.log('Connected to Supabase PostgreSQL')

    // 1. Criar tabela de Salões
    await client.query(`
      CREATE TABLE IF NOT EXISTS salons (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        owner_email TEXT UNIQUE NOT NULL,
        owner_password TEXT NOT NULL,
        owner_phone TEXT,
        whatsapp_number TEXT,
        address TEXT,
        image_url TEXT,
        plan TEXT DEFAULT 'profissional',
        status TEXT DEFAULT 'active',
        subscription_ends_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    console.log('✓ Table salons created')

    // 2. Adicionar salon_id em todas as tabelas existentes
    const tables = ['appointments', 'customers', 'services', 'vendas', 'despesas', 'comissao', 'whatsapp_messages', 'whatsapp_status', 'blocked_slots', 'working_hours', 'professionals', 'notes']
    for (const table of tables) {
      try {
        await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id)`)
        console.log(`✓ Added salon_id to ${table}`)
      } catch (e: any) {
        console.log(`⚠ Could not add salon_id to ${table}: ${e.message}`)
      }
    }

    // 3. Criar índices
    for (const table of tables) {
      try {
        await client.query(`CREATE INDEX IF NOT EXISTS idx_${table}_salon ON ${table}(salon_id)`)
        console.log(`✓ Index created on ${table}`)
      } catch (e: any) {
        console.log(`⚠ Could not create index on ${table}: ${e.message}`)
      }
    }

    // 4. Criar salão admin (Eric)
    const { rows } = await client.query(`SELECT id FROM salons WHERE owner_email = $1`, ['admin@gestaoesalao.com'])
    if (rows.length === 0) {
      await client.query(`
        INSERT INTO salons (name, owner_name, owner_email, owner_password, plan, status)
        VALUES ('Gestão E Salão - Admin', 'Eric', 'admin@gestaoesalao.com', '$2b$10$admin2024hashplaceholder', 'premium', 'active')
      `)
      console.log('✓ Admin salon created')
    }

    // 5. Criar bucket de storage
    await client.query(`
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('salon-photos', 'salon-photos', true)
      ON CONFLICT (id) DO NOTHING
    `)
    console.log('✓ Storage bucket created')

    console.log('\n✅ Multi-tenant setup complete!')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

main()
