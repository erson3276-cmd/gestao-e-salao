import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { salonName, ownerName, ownerEmail, ownerPassword, ownerPhone, ownerCpf } = body

    // Test Supabase connection
    const { data: test, error: testError } = await supabaseAdmin
      .from('salons')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('Supabase test error:', testError)
      return NextResponse.json({ 
        success: false, 
        error: 'Erro de conexão: ' + testError.message 
      }, { status: 500 })
    }

    // Check if email exists
    const { data: existing } = await supabaseAdmin
      .from('salons')
      .select('id')
      .eq('owner_email', ownerEmail)
      .single()

    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: 'Este email já está cadastrado' 
      }, { status: 409 })
    }

    // Create salon
    const { data: salon, error: insertError } = await supabaseAdmin
      .from('salons')
      .insert([{
        name: salonName,
        owner_name: ownerName,
        owner_email: ownerEmail,
        owner_password: ownerPassword,
        owner_phone: ownerPhone || null,
        owner_cpf: ownerCpf || null,
        plan: 'pending',
        status: 'pending',
        subscription_ends_at: null
      }])
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao criar: ' + insertError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Conta criada!',
      salonId: salon?.id 
    })
  } catch (e: any) {
    console.error('Catch error:', e)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro: ' + e.message 
    }, { status: 500 })
  }
}
