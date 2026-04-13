import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { calculateSalesSummary, calculateChannelData, calculatePaymentMethodData, calculateServiceData } from '../../../lib/report-services'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    const salonId = request.headers.get('x-salon-id')

    const currentStart = startOfMonth(new Date(year, month - 1))
    const currentEnd = endOfMonth(new Date(year, month - 1))
    const prevMonthDate = subMonths(new Date(year, month - 1), 1)
    const prevStart = startOfMonth(prevMonthDate)
    const prevEnd = endOfMonth(prevMonthDate)

    const [vendasResult, despesasResult, prevVendasResult, goalResult, servicesResult] = await Promise.all([
      supabaseAdmin
        .from('vendas')
        .select('*, services(name)')
        .eq('salon_id', salonId || '')
        .gte('created_at', currentStart.toISOString())
        .lte('created_at', currentEnd.toISOString()),
      
      supabaseAdmin
        .from('despesas')
        .select('*')
        .eq('salon_id', salonId || '')
        .gte('date', format(currentStart, 'yyyy-MM-dd'))
        .lte('date', format(currentEnd, 'yyyy-MM-dd')),
      
      supabaseAdmin
        .from('vendas')
        .select('*')
        .eq('salon_id', salonId || '')
        .gte('created_at', prevStart.toISOString())
        .lte('created_at', prevEnd.toISOString()),
      
      supabaseAdmin
        .from('goals')
        .select('*')
        .eq('salon_id', salonId || '')
        .eq('month', month)
        .eq('year', year)
        .single(),
      
      supabaseAdmin
        .from('services')
        .select('id, name')
        .eq('salon_id', salonId || '')
    ])

    if (vendasResult.error) throw new Error('Erro ao buscar vendas')
    if (despesasResult.error) throw new Error('Erro ao buscar despesas')

    const vendas = vendasResult.data || []
    const despesas = despesasResult.data || []
    const prevVendas = prevVendasResult.data || []
    const goal = goalResult.data
    const services = servicesResult.data || []

    const salesSummary = calculateSalesSummary(vendas, despesas, goal, prevVendas)
    const channelData = calculateChannelData(vendas)
    const paymentMethodData = calculatePaymentMethodData(vendas)
    const serviceData = calculateServiceData(vendas, services)

    return NextResponse.json({
      salesSummary,
      channelData,
      paymentMethodData,
      serviceData,
      totalAppointments: vendas.length,
      filters: { month, year }
    })
  } catch (error: any) {
    console.error('Erro ao buscar relatório:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
