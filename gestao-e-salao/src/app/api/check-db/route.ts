import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const checks: Record<string, boolean> = {}
  
  const tables = ['salons', 'appointments', 'customers', 'services', 'vendas', 'despesas', 'comissao', 'whatsapp_messages', 'whatsapp_status', 'blocked_slots', 'working_hours', 'professionals', 'notes']
  
  for (const table of tables) {
    try {
      const { error } = await supabaseAdmin.from(table).select('id', { count: 'exact', head: true })
      checks[table] = !error
    } catch {
      checks[table] = false
    }
  }
  
  const allOk = Object.values(checks).every(v => v)
  
  return NextResponse.json({
    success: allOk,
    tables: checks,
    message: allOk ? 'All tables exist! Multi-tenant is ready.' : 'Some tables are missing.'
  })
}
