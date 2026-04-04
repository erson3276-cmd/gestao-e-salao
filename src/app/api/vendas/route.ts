import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { getSalonSession } from '@/app/actions/salon-auth'

export async function GET() {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ data: [], success: true })

  try {
    const { data, error } = await supabase
      .from('vendas')
      .select(`
        *,
        customers:customer_id(id, name),
        services:service_id(id, name, price)
      `)
      .eq('salon_id', session.salonId)
      .order('date', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ data: data || [], success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { customer_id, service_id, appointment_id, amount, tip_amount, total_amount, payment_method, date } = body
    
    const { data, error } = await supabase
      .from('vendas')
      .insert([{ 
        customer_id, 
        service_id, 
        appointment_id, 
        amount: Number(amount) || 0,
        tip_amount: Number(tip_amount) || 0,
        total_amount: Number(total_amount) || Number(amount) || 0, 
        payment_method,
        date: date || new Date().toISOString(),
        salon_id: session.salonId
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, customer_id, service_id, appointment_id, amount, tip_amount, total_amount, payment_method, date } = body
    
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    
    const updateData: any = {}
    if (customer_id !== undefined) updateData.customer_id = customer_id
    if (service_id !== undefined) updateData.service_id = service_id
    if (appointment_id !== undefined) updateData.appointment_id = appointment_id
    if (amount !== undefined) updateData.amount = Number(amount)
    if (tip_amount !== undefined) updateData.tip_amount = Number(tip_amount)
    if (total_amount !== undefined) updateData.total_amount = Number(total_amount)
    if (payment_method !== undefined) updateData.payment_method = payment_method
    if (date !== undefined) updateData.date = date
    
    const { data, error } = await supabase
      .from('vendas')
      .update(updateData)
      .eq('id', id)
      .eq('salon_id', session.salonId)
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getSalonSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    
    const { error } = await supabase
      .from('vendas')
      .delete()
      .eq('id', id)
      .eq('salon_id', session.salonId)
    
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
