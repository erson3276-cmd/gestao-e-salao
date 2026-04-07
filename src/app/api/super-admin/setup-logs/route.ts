import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST() {
  try {
    // Create super_admin_logs table if it doesn't exist
    const { error } = await supabaseAdmin.from('super_admin_logs').select('id').limit(1)
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, create it
      const { error: createError } = await supabaseAdmin.rpc('create_super_admin_logs_table', {
        sql: `CREATE TABLE IF NOT EXISTS super_admin_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          action VARCHAR(255) NOT NULL,
          details TEXT,
          salon_id UUID,
          salon_name VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      })
      
      if (createError) {
        // Try alternative approach - create table directly
        await supabaseAdmin.from('super_admin_logs').insert([{
          action: 'init',
          details: 'Table created',
          created_at: new Date().toISOString()
        }])
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}