import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Call Baileys logout endpoint via server
    const baileysUrl = process.env.BAILEYS_API_URL || 'http://167.234.248.199:8082'
    const baileysKey = process.env.BAILEYS_API_KEY || ''
    
    await fetch(`${baileysUrl}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': baileysKey
      }
    })
    
    // Update status in Supabase
    const { supabaseAdmin: supabase } = await import('@/lib/supabaseAdmin')
    await supabase
      .from('whatsapp_status')
      .upsert({
        id: 1,
        connected: false,
        state: 'disconnected',
        has_session: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
