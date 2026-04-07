import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('whatsapp_status')
      .select('*')
      .eq('id', 1)
      .single()
    
    if (error) {
      return NextResponse.json({ connected: false, state: 'error', message: 'Status table not found' })
    }
    
    return NextResponse.json({
      connected: data.connected || false,
      state: data.state || 'disconnected',
      hasSession: data.has_session || false,
      updated_at: data.updated_at
    })
  } catch (error: any) {
    return NextResponse.json({ connected: false, state: 'error', message: error.message })
  }
}
