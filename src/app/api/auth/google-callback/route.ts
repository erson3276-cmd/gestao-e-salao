import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email não disponível' }, { status: 400 })
    }

    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select('id')
      .eq('owner_email', email)
      .single()

    if (salonError || !salon) {
      return NextResponse.json({ 
        success: false, 
        needsRegister: true,
        email,
        name 
      })
    }

    return NextResponse.json({ success: true, needsRegister: false })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao conectar ao servidor' }, { status: 500 })
  }
}
