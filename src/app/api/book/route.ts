import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

function formatBrasiliaTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

function formatBrasiliaDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

function formatBrasiliaTimeOnly(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export async function POST(request: Request) {
  try {
    const { name, whatsapp, serviceId, startTime, endTime } = await request.json()

    // 1. Buscar cliente pelo WhatsApp
    const cleanWhatsapp = whatsapp.replace(/\D/g, '')
    console.log('Buscando cliente com WhatsApp:', cleanWhatsapp)
    
    const { data: allCustomers } = await supabase
      .from('customers')
      .select('id, name, whatsapp, active')
    
    let customer = null
    if (allCustomers) {
      customer = allCustomers.find(c => {
        const cPhone = String(c.whatsapp || '').replace(/\D/g, '')
        return cPhone === cleanWhatsapp || cPhone === cleanWhatsapp.slice(-9) || cPhone.endsWith(cleanWhatsapp.slice(-8))
      })
    }

    console.log('Cliente encontrado:', customer)

    // 2. Se cliente não encontrado -> criar automaticamente
    if (!customer) {
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          name: name,
          whatsapp: cleanWhatsapp,
          active: true
        })
        .select()
        .single()

      if (createError || !newCustomer) {
        return NextResponse.json({ 
          success: false, 
          error: 'Erro ao cadastrar. Tente novamente.',
          code: 'CREATE_ERROR'
        }, { status: 500 })
      }

      customer = newCustomer
    }

    // 3. Se cliente explicitamente inativo/bloqueado -> erro
    if (customer.active === false || customer.active === 'false' || customer.active === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Agendamento indisponível para este número. Entre em contato com o salão.',
        code: 'BLOCKED'
      }, { status: 403 })
    }

    // 4. Verificar se está dentro do horário de funcionamento
    const startDateTime = new Date(startTime)
    const dayOfWeek = startDateTime.getDay()
    const timeStr = startDateTime.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
    const dateStr = startDateTime.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }).split('/').reverse().join('-')
    
    const { data: workingHours } = await supabase
      .from('working_hours')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .single()
    
    if (!workingHours || !workingHours.is_active) {
      return NextResponse.json({ 
        success: false, 
        error: 'Salão fechado neste dia. Escolha outro dia.',
        code: 'CLOSED'
      }, { status: 403 })
    }
    
    const startMin = parseInt(workingHours.start_time.split(':')[0]) * 60 + parseInt(workingHours.start_time.split(':')[1])
    const endMin = parseInt(workingHours.end_time.split(':')[0]) * 60 + parseInt(workingHours.end_time.split(':')[1])
    const reqMin = parseInt(timeStr.split(':')[0]) * 60 + parseInt(timeStr.split(':')[1])
    
    if (reqMin < startMin || reqMin >= endMin) {
      return NextResponse.json({ 
        success: false, 
        error: `Horário fora do expediente. Funcionamento: ${workingHours.start_time} - ${workingHours.end_time}`,
        code: 'OUT_OF_HOURS'
      }, { status: 403 })
    }

    // 5. Verificar se o horário não está bloqueado
    const endDateTime = new Date(endTime)
    const endTimeStr = endDateTime.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
    
    const { data: blockedSlots } = await supabase
      .from('blocked_slots')
      .select('*')
      .eq('date', dateStr)
    
    const isBlocked = blockedSlots?.some(b => {
      const blockStart = parseInt(b.start_time.split(':')[0]) * 60 + parseInt(b.start_time.split(':')[1])
      const blockEnd = parseInt(b.end_time.split(':')[0]) * 60 + parseInt(b.end_time.split(':')[1])
      return reqMin >= blockStart && reqMin < blockEnd
    })
    
    if (isBlocked) {
      return NextResponse.json({ 
        success: false, 
        error: 'Este horário está bloqueado. Escolha outro horário.',
        code: 'BLOCKED_SLOT'
      }, { status: 403 })
    }

    // 6. Verificar se horário está livre (sem agendamento)
    const { data: overlaps } = await supabase
      .from('appointments')
      .select('id')
      .neq('status', 'cancelado')
      .lt('start_time', endTime)
      .gt('end_time', startTime)
      .limit(1)

    if (overlaps && overlaps.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Horário não disponível. Escolha outro horário.',
        code: 'CONFLICT'
      }, { status: 409 })
    }

    // 7. Criar agendamento
    console.log('Criando agendamento para cliente:', customer.id, customer.name, 'com serviço:', serviceId)
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        customer_id: customer.id,
        service_id: serviceId,
        start_time: startTime,
        end_time: endTime,
        status: 'agendado'
      })
      .select()
      .single()

    console.log('Agendamento criado:', appointment, appointmentError)

    if (appointmentError) {
      console.error('Erro ao criar agendamento:', appointmentError)
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao criar agendamento.',
        code: 'INSERT_ERROR'
      }, { status: 500 })
    }

    // 8. Buscar dados do serviço para mensagem
    const { data: service } = await supabase
      .from('services')
      .select('name')
      .eq('id', serviceId)
      .maybeSingle()

    const serviceName = service?.name || 'Serviço'
    
    // Usar horário de Brasília
    const dateFormatted = formatBrasiliaDate(startTime)
    const timeFormatted = formatBrasiliaTimeOnly(startTime)

    // 9. Salvar mensagem de confirmação no Supabase para o poller enviar
    const message = `Olá *${customer.name}*! ✨\n\nSeu agendamento de *${serviceName}* no *Gestão E Salão* foi confirmado! ✅\n\n🗓️ *Data:* ${dateFormatted}\n🕒 *Horário:* ${timeFormatted}\n\nTe esperamos para te deixar ainda mais linda! 🌸`

    console.log('Mensagem de confirmação:', message)

    try {
      const { error: msgError } = await supabase
        .from('whatsapp_messages')
        .insert({
          phone: cleanWhatsapp,
          message: message,
          status: 'pending'
        })
      
      if (msgError) {
        console.error('Erro ao salvar mensagem:', msgError)
      } else {
        console.log('Mensagem WhatsApp salva para envio:', cleanWhatsapp)
      }
    } catch (waError) {
      console.error('Erro ao salvar mensagem WhatsApp:', waError)
    }

    return NextResponse.json({ success: true, appointment })
  } catch (error: any) {
    console.error('Booking Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
