import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const salonId = request.headers.get('x-salon-id')

    let query = supabaseAdmin.from('goals').select('*').eq('salon_id', salonId || '')

    if (month) query = query.eq('month', parseInt(month))
    if (year) query = query.eq('year', parseInt(year))

    const { data, error } = await query

    if (error) throw new Error('Erro ao buscar metas')

    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { month, year, target_amount } = body
    const salonId = request.headers.get('x-salon-id')

    const { data: existing } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('salon_id', salonId || '')
      .eq('month', month)
      .eq('year', year)
      .single()

    let result
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('goals')
        .update({ target_amount })
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw error
      result = data
    } else {
      const { data, error } = await supabaseAdmin
        .from('goals')
        .insert({ 
          month, 
          year, 
          target_amount, 
          salon_id: salonId 
        })
        .select()
        .single()
      
      if (error) throw error
      result = data
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('Erro ao salvar meta:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
