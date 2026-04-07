import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { getSalonId } from '@/lib/session'

export async function GET() {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ data: [], success: true })

  try {
    let query = supabase.from('customers').select('*').order('name', { ascending: true })
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
    const { name, whatsapp, phone, email, notes } = body
    if (!name || name.trim() === '') return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    
    const { data, error } = await supabase.from('customers').insert([{ 
      name: name.trim(), whatsapp: whatsapp || null, phone: phone || null,
      email: email || null, notes: notes || null, active: true,
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
    const { id, name, whatsapp, phone, email, notes, active } = body
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    
    const updateData: any = {}
    if (name !== undefined) {
      if (!name || name.trim() === '') return NextResponse.json({ error: 'Nome não pode ser vazio' }, { status: 400 })
      updateData.name = name.trim()
    }
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp || null
    if (phone !== undefined) updateData.phone = phone || null
    if (email !== undefined) updateData.email = email || null
    if (notes !== undefined) updateData.notes = notes || null
    if (active !== undefined) updateData.active = active
    updateData.updated_at = new Date().toISOString()
    
    let query = supabase.from('customers').update(updateData).eq('id', id)
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
    
    let query = supabase.from('customers').delete().eq('id', id)
    if (salonId !== 'admin') query = query.eq('salon_id', salonId)
    
    const { error } = await query
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
