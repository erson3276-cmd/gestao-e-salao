import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('whatsapp_qr')
      .select('*')
      .eq('id', 1)
      .single()
    
    if (error) {
      return NextResponse.json({ qr: null, state: 'error', message: 'QR not available yet' })
    }
    
    return NextResponse.json({
      qr: data.qr_code || null,
      state: data.state || 'disconnected',
      updated_at: data.updated_at
    })
  } catch (error) {
    return NextResponse.json({ qr: null, state: 'error', message: 'Failed to fetch QR' })
  }
}
