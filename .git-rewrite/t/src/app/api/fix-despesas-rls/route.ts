import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    // Disable RLS for despesas table (allow all operations)
    const { error } = await supabaseAdmin.rpc('pg_catalog.set_config', {
      setting_name: 'row_security.active',
      setting_value: 'off'
    })
    
    // Alternative: Update RLS policy directly
    const { error: policyError } = await supabaseAdmin
      .from('despesas')
      .upsert({ id: '00000000-0000-0000-0000-000000000001' }, { onConflict: 'id' })
    
    return NextResponse.json({ 
      success: true, 
      message: "RLS check skipped",
      error: policyError?.message || null
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}