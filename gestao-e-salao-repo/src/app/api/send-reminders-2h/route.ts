import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '../../../lib/supabaseAdmin'
import { whatsappManager } from '../../../lib/whatsapp-manager'

export async function GET() {
  try {
    const now = new Date()
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    
    const in2HoursStart = new Date(in2Hours)
    in2HoursStart.setMinutes(0, 0, 0)
    
    const in2HoursEnd = new Date(in2Hours)
    in2HoursEnd.setMinutes(59, 59, 999)
    
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
      .gte('start_time', in2HoursStart.toISOString())
      .lte('start_time', in2HoursEnd.toISOString())
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
        
        const apptTime = new Date(appt.start_time)
        const timeStr = apptTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        const serviceName = service?.name || 'Serviço'
        
        const message = `Olá, *${customer.name}*!\n\nLembrete: Você tem *${serviceName}* em *2 horas* (às ${timeStr}).\n\nAguardo você!`
        
        if (appt.salon_id) {
          try {
            const phoneClean = customer.whatsapp.replace(/\D/g, '')
            await whatsappManager.sendText(appt.salon_id, phoneClean, message)
            results.push({ appointmentId: appt.id, phone: customer.whatsapp, status: 'sent' })
          } catch (sendError: any) {
            results.push({ appointmentId: appt.id, phone: customer.whatsapp, status: 'error', error: sendError.message })
          }
        } else {
          results.push({ appointmentId: appt.id, phone: customer.whatsapp, status: 'queued' })
        }
          
      } catch (err: any) {
        results.push({ appointmentId: appt.id, status: 'error', error: err.message })
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      sent: results.filter(r => r.status === 'sent').length,
      total: results.length,
      results 
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
