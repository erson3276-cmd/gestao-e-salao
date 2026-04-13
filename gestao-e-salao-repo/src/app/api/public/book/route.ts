import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const { salonId, name, whatsapp, serviceId, startTime, endTime } = await request.json()

    console.log('Received booking:', { startTime, endTime })

    if (!salonId || !name || !whatsapp || !serviceId || !startTime || !endTime) {
      return NextResponse.json({ success: false, error: 'Dados incompletos' }, { status: 400 })
    }

    const cleanWhatsapp = whatsapp.replace(/\D/g, '')

    // Check if salon only allows registered clients
    const { data: salonSettings } = await supabaseAdmin
      .from('salons')
      .select('only_registered_clients')
      .eq('id', salonId)
      .single()

    // Check if customer exists
    let { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id, active')
      .eq('salon_id', salonId)
      .eq('whatsapp', cleanWhatsapp)
      .single()

    if (salonSettings?.only_registered_clients) {
      if (!customer) {
        return NextResponse.json({ 
          success: false, 
          error: 'Este salão só aceita agendamentos de clientes cadastrados. Por favor, entre em contato com o salão.' 
        }, { status: 403 })
      }
      if (!customer.active) {
        return NextResponse.json({ 
          success: false, 
          error: 'Seu cadastro está inativo. Por favor, entre em contato com o salão.' 
        }, { status: 403 })
      }
    }

    // Parse the incoming date and convert to UTC for storage
    const startDate = new Date(startTime)
    const endDate = new Date(endTime)
    
    console.log('Parsed dates:', { startDate: startDate.toISOString(), endDate: endDate.toISOString() })
    
    // Store as UTC in database
    const startTimeUTC = startDate.toISOString()
    const endTimeUTC = endDate.toISOString()

    // Create customer if not exists (when not restricted)
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

    // Check conflicts using UTC times
    const { data: conflicts } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('salon_id', salonId)
      .neq('status', 'cancelado')
      .lt('start_time', endTimeUTC)
      .gt('end_time', startTimeUTC)
      .limit(1)

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ success: false, error: 'Horário indisponível' }, { status: 409 })
    }

    // Create appointment - store in UTC
    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .insert({
        salon_id: salonId,
        customer_id: customer.id,
        service_id: serviceId,
        start_time: startTimeUTC,
        end_time: endTimeUTC,
        status: 'agendado'
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ success: false, error: 'Erro ao criar agendamento' }, { status: 500 })
    }

    console.log('Appointment created:', appointment)

    // Get service name for message - show in Brasilia timezone
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

    // Format date in Brasilia timezone for the message
    const dateStr = new Date(startTimeUTC).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    const timeStr = new Date(startTimeUTC).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
    const message = `Olá *${name}*!\n\nSeu agendamento de *${service?.name}* no *${salon?.name}* foi confirmado! ✅\n\n📅 *Data:* ${dateStr}\n🕒 *Horário:* ${timeStr}\n\nAguardo você!`

    // Save WhatsApp message
    await supabaseAdmin
      .from('whatsapp_messages')
      .insert({ phone: cleanWhatsapp, message, status: 'pending', salon_id: salonId })

    // Try to send via WhatsApp if instance is connected
    if (salonId) {
      try {
        const { whatsappManager } = await import('../../../../lib/whatsapp-manager')
        await whatsappManager.sendText(salonId, cleanWhatsapp, message)
      } catch {
        // Message is saved, will be sent later
      }
    }

    return NextResponse.json({ success: true, appointment })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
