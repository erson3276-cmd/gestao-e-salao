import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const { salonId, name, whatsapp, serviceId, startTime, endTime } = await request.json()

    if (!salonId || !name || !whatsapp || !serviceId || !startTime || !endTime) {
      return NextResponse.json({ success: false, error: 'Dados incompletos' }, { status: 400 })
    }

    const cleanWhatsapp = whatsapp.replace(/\D/g, '')

    // Check if customer exists, create if not
    let { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('salon_id', salonId)
      .eq('whatsapp', cleanWhatsapp)
      .single()

    if (!customer) {
      const { data: newCustomer, error: createError } = await supabaseAdmin
        .from('customers')
        .insert({ name, whatsapp: cleanWhatsapp, salon_id: salonId, active: true })
        .select()
        .single()
      if (createError || !newCustomer) {
        return NextResponse.json({ success: false, error: 'Erro ao cadastrar cliente' }, { status: 500 })
      }
      customer = newCustomer
    }

    if (!customer?.id) {
      return NextResponse.json({ success: false, error: 'Cliente inválido' }, { status: 500 })
    }

    // Check conflicts
    const { data: conflicts } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('salon_id', salonId)
      .neq('status', 'cancelado')
      .lt('start_time', endTime)
      .gt('end_time', startTime)
      .limit(1)

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ success: false, error: 'Horário indisponível' }, { status: 409 })
    }

    // Create appointment
    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .insert({
        salon_id: salonId,
        customer_id: customer.id,
        service_id: serviceId,
        start_time: startTime,
        end_time: endTime,
        status: 'agendado'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: 'Erro ao criar agendamento' }, { status: 500 })
    }

    // Get service name for message
    const { data: service } = await supabaseAdmin
      .from('services')
      .select('name')
      .eq('id', serviceId)
      .single()

    const { data: salon } = await supabaseAdmin
      .from('salons')
      .select('name, whatsapp_instance_id')
      .eq('id', salonId)
      .single()

    const dateStr = new Date(startTime).toLocaleDateString('pt-BR')
    const timeStr = new Date(startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const message = `Olá *${name}*! ✨\n\nSeu agendamento de *${service?.name}* no *${salon?.name}* foi confirmado! ✅\n\n🗓️ *Data:* ${dateStr}\n🕒 *Horário:* ${timeStr}\n\nTe esperamos! 🌸`

    // Save WhatsApp message
    await supabaseAdmin
      .from('whatsapp_messages')
      .insert({ phone: cleanWhatsapp, message, status: 'pending', salon_id: salonId })

    // Try to send via WhatsApp if instance is connected
    if (salon?.whatsapp_instance_id) {
      try {
        const { baileys } = await import('@/lib/baileys')
        await baileys.sendText(salon.whatsapp_instance_id, cleanWhatsapp, message)
      } catch {
        // Message is saved, will be sent later
      }
    }

    return NextResponse.json({ success: true, appointment })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
