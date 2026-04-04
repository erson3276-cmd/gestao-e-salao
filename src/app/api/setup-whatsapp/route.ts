import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST() {
  try {
    await supabaseAdmin.rpc('add_whatsapp_column')
  } catch {
    // RPC may not exist, try raw approach
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('salons')
      .select('id, whatsapp_instance_id')
      .limit(1)
    
    if (error && error.message.includes('whatsapp_instance_id')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Column does not exist. Please run this SQL in Supabase SQL Editor:',
        sql: "ALTER TABLE salons ADD COLUMN IF NOT EXISTS whatsapp_instance_id TEXT;"
      })
    }

    return NextResponse.json({ success: true, hasColumn: !error })
  } catch (e: any) {
    return NextResponse.json({ 
      success: false, 
      error: e.message,
      sql: "ALTER TABLE salons ADD COLUMN IF NOT EXISTS whatsapp_instance_id TEXT;"
    })
  }
}
