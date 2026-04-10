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
  try {
    await runSql(`
      ALTER TABLE salons 
      ADD COLUMN IF NOT EXISTS only_registered_clients BOOLEAN DEFAULT FALSE;
    `)
    
    return NextResponse.json({ success: true, message: 'Coluna adicionada com sucesso!' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
