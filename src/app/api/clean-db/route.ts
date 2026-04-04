import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (secret !== 'clean-db-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results: Record<string, string> = {}

    // Delete all data from tables (keep structure)
    const tables = [
      'whatsapp_messages', 'whatsapp_status', 'blocked_slots',
      'working_hours', 'professionals', 'notes', 'comissao',
      'vendas', 'despesas', 'appointments', 'customers', 'services',
      'profiles', 'salons'
    ]

    for (const table of tables) {
      try {
        const { error } = await supabaseAdmin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
        if (error) {
          results[table] = `Error: ${error.message}`
        } else {
          results[table] = 'Cleaned'
        }
      } catch (e: any) {
        results[table] = `Skipped: ${e.message}`
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
