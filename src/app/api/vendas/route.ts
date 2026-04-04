import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { getSalonId } from '@/lib/session'

export async function GET() {
  const salonId = await getSalonId()
  if (!salonId) return NextResponse.json({ data: [], success: true })

  try {
    let query = supabase.from('vendas').select('*, customers:customer_id(id, name), services:service_id(id, name, price)').order('date', { ascending: false })
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
    const { customer_id, service_id, appointment_id, amount, payment_method, date } = body
    
    let targetSalonId = salonId === 'admin' ? null : salonId
    
    if (!targetSalonId) {
       const { data: salons } = await supabase.from('salons').select('id').eq('status', 'active').limit(1)
       if (salons && salons.length > 0) targetSalonId = salons[0].id
    }
    if (body.salon_id) targetSalonId = body.salon_id

    const { data, error } = await supabase.from('vendas').insert([{ 
      customer_id, service_id, appointment_id, 
      amount: Number(amount) || 0,
      payment_method,
      date: date || new Date().toISOString(),
      salon_id: targetSalonId
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
    const { id, customer_id, service_id, appointment_id, amount, payment_method, date } = body
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    
    const updateData: any = {}
    if (customer_id !== undefined) updateData.customer_id = customer_id
    if (service_id !== undefined) updateData.service_id = service_id
    if (appointment_id !== undefined) updateData.appointment_id = appointment_id
    if (amount !== undefined) updateData.amount = Number(amount)
    if (payment_method !== undefined) updateData.payment_method = payment_method
    if (date !== undefined) updateData.date = date
    
    let query = supabase.from('vendas').update(updateData).eq('id', id)
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
    
    let query = supabase.from('vendas').delete().eq('id', id)
    if (salonId !== 'admin') query = query.eq('salon_id', salonId)
    
    const { error } = await query
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
