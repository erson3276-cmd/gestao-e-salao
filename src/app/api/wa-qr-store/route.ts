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
      return NextResponse.json({ qr: null, state: 'disconnected', updated_at: '' })
    }
    
    return NextResponse.json({
      qr: data?.qr || null,
      state: data?.state || 'disconnected',
      updated_at: data?.updated_at || ''
    })
  } catch {
    return NextResponse.json({ qr: null, state: 'disconnected', updated_at: '' })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { qr, state } = body
    
    const { error } = await supabaseAdmin
      .from('whatsapp_qr')
      .upsert({
        id: 1,
        qr: qr || null,
        state: state || 'disconnected',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
}
