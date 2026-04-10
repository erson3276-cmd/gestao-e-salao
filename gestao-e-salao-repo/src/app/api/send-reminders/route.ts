import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { whatsappManager } from '@/lib/whatsapp-manager'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const todayStr = today.toISOString()
    const tomorrowStr = tomorrow.toISOString()
    
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        salon_id,
        start_time,
        status,
        customers!appointments_customer_id_fkey (id, name, whatsapp),
        services!appointments_service_id_fkey (name)
      `)
      .gte('start_time', todayStr)
      .lt('start_time', tomorrowStr)
      .eq('status', 'agendado')
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    const results = []
    
    for (const appt of appointments || []) {
      try {
        const customer = Array.isArray(appt.customers) ? appt.customers[0] : appt.customers
        const service = Array.isArray(appt.services) ? appt.services[0] : appt.services
        
        if (!customer?.whatsapp) {
          results.push({ appointmentId: appt.id, status: 'skipped', reason: 'No phone' })
          continue
        }
        
        const timeStr = new Date(appt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        const serviceName = service?.name || 'Serviço'
        const salonName = 'Gestão E Salão'
        
        const message = `Olá, *${customer.name}*!\n\nLembrete: Você tem *${serviceName}* hoje às *${timeStr}*.\n\nAguardo você!`
        
        await supabase
          .from('whatsapp_messages')
          .insert({
            phone: customer.whatsapp,
            message: message,
            status: 'pending',
            salon_id: appt.salon_id
          })
        
        if (appt.salon_id) {
          try {
            const phoneClean = customer.whatsapp.replace(/\D/g, '')
            await whatsappManager.sendText(appt.salon_id, phoneClean, message)
            results.push({ appointmentId: appt.id, phone: customer.whatsapp, status: 'sent' })
          } catch (sendError: any) {
            results.push({ appointmentId: appt.id, phone: customer.whatsapp, status: 'queued', error: sendError.message })
          }
        } else {
          results.push({ appointmentId: appt.id, phone: customer.whatsapp, status: 'queued' })
        }
      } catch (err: any) {
        results.push({ appointmentId: appt.id, status: 'error', error: err.message })
      }
    }
    
    return NextResponse.json({ success: true, sent: results.length, results })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
