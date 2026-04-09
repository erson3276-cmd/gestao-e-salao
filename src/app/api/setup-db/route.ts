import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''
const PROJECT_REF = 'ssdqkvsbhebrqihoekzz'

async function runSql(query: string) {
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/sql`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY
    },
    body: JSON.stringify({ query })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  return res.json()
}

export async function POST() {
  const results: string[] = []
  const errors: string[] = []

  async function exec(label: string, sql: string) {
    try {
      await runSql(sql)
      results.push(`OK: ${label}`)
    } catch (e: any) {
      if (e.message.includes('already exists') || e.message.includes('already have')) {
        results.push(`EXISTS: ${label}`)
      } else {
        errors.push(`FAIL: ${label} - ${e.message}`)
      }
    }
  }

  await exec('Create salons table', `
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
      payment_id TEXT,
      payment_date TIMESTAMP WITH TIME ZONE,
      cancellation_reason TEXT,
      cancelled_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `)

  const tables = ['appointments', 'customers', 'services', 'vendas', 'despesas', 'comissao', 'whatsapp_messages', 'whatsapp_status', 'blocked_slots', 'working_hours', 'professionals', 'notes']
  
  for (const table of tables) {
    await exec(`Add salon_id to ${table}`, `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id)`)
  }

  for (const table of tables) {
    await exec(`Index ${table}`, `CREATE INDEX IF NOT EXISTS idx_${table}_salon ON ${table}(salon_id)`)
  }

  await exec('Create storage bucket', `
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('salon-photos', 'salon-photos', true)
    ON CONFLICT (id) DO NOTHING
  `)

  if (errors.length > 0) {
    return NextResponse.json({ success: 'partial', results, errors }, { status: 200 })
  }

  return NextResponse.json({ success: true, results, errors })
}

export async function GET() {
  return NextResponse.json({ message: 'POST to run multi-tenant database setup' })
}
