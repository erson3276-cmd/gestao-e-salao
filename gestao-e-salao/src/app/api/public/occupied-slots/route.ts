import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const date = searchParams.get('date')

    if (!slug || !date) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Get salon by slug
    const { data: salon } = await supabaseAdmin
      .from('salons')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!salon) {
      return NextResponse.json({ occupiedSlots: [] })
    }

    // Get appointments for the date (in Brasilia timezone)
    const startOfDay = new Date(`${date}T00:00:00-03:00`)
    const endOfDay = new Date(`${date}T23:59:59-03:00`)

    const { data: appointments } = await supabaseAdmin
      .from('appointments')
      .select('start_time, end_time')
      .eq('salon_id', salon.id)
      .neq('status', 'cancelado')
      .gte('start_time', startOfDay.toISOString())
      .lt('start_time', endOfDay.toISOString())

    // Generate occupied time slots
    const occupiedSlots: string[] = []
    
    for (const apt of appointments || []) {
      const startTime = new Date(apt.start_time)
      const endTime = new Date(apt.end_time)
      
      // Generate all 30-minute slots that this appointment occupies
      let current = new Date(startTime)
      
      while (current < endTime) {
        const timeStr = current.toLocaleTimeString('pt-BR', { 
          timeZone: 'America/Sao_Paulo', 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
        occupiedSlots.push(timeStr)
        current = new Date(current.getTime() + 30 * 60000) // 30 min increments
      }
    }

    return NextResponse.json({ occupiedSlots })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}