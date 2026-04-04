import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { getSalonId } from '@/lib/session'

export async function GET() {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ data: [], success: true })

  try {
    let query = supabase.from('services').select('*').order('name', { ascending: true })
    if (salonId !== 'admin') query = query.eq('salon_id', salonId)
    
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data: data || [], success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const { name, price, duration_minutes, description, category } = body
    if (!name || name.trim() === '') return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    if (price === undefined || price === null || Number(price) < 0) return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })
    
    const { data, error } = await supabase.from('services').insert([{ 
      name: name.trim(), price: Number(price), duration_minutes: duration_minutes || 60,
      description: description || null, category: category || null, active: true,
      salon_id: salonId === 'admin' ? null : salonId
    }]).select().single()
    
    if (error) throw error
    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, name, price, duration_minutes, description, category, active } = body
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    
    const updateData: any = {}
    if (name !== undefined) {
      if (!name || name.trim() === '') return NextResponse.json({ error: 'Nome não pode ser vazio' }, { status: 400 })
      updateData.name = name.trim()
    }
    if (price !== undefined) updateData.price = Number(price)
    if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes
    if (description !== undefined) updateData.description = description || null
    if (category !== undefined) updateData.category = category || null
    if (active !== undefined) updateData.active = active
    updateData.updated_at = new Date().toISOString()
    
    let query = supabase.from('services').update(updateData).eq('id', id)
    if (salonId !== 'admin') query = query.eq('salon_id', salonId)
    
    const { data, error } = await query.select().single()
    if (error) throw error
    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    
    let query = supabase.from('services').delete().eq('id', id)
    if (salonId !== 'admin') query = query.eq('salon_id', salonId)
    
    const { error } = await query
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
