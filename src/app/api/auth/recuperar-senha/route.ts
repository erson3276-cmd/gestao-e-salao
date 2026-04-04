import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { hashPassword } from '@/lib/auth'
import crypto from 'crypto'

// API route for password recovery
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const { data: salon, error } = await supabaseAdmin
      .from('salons')
      .select('id, owner_email, name')
      .eq('owner_email', email)
      .single()

    if (error || !salon) {
      return NextResponse.json({ success: true, message: 'Se o email existir, uma nova senha será enviada.' })
    }

    const newPassword = crypto.randomBytes(8).toString('hex')
    const hashedPassword = hashPassword(newPassword)

    await supabaseAdmin
      .from('salons')
      .update({ 
        owner_password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', salon.id)

    return NextResponse.json({ 
      success: true, 
      newPassword,
      salonName: salon.name
    })
  } catch (e: any) {
    console.error('Forgot password error:', e)
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 })
  }
}
