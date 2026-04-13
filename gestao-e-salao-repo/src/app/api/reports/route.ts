import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

function calculateSalesSummary(vendas: any[], despesas: any[], goal: any, prevVendas: any[]) {
  const grossRevenue = vendas.reduce((sum: number, v: any) => sum + (v.total_amount || v.amount || 0), 0)
  const expenses = despesas.reduce((sum: number, d: any) => sum + (d.amount || 0), 0)
  const netRevenue = grossRevenue - expenses
  const previousMonthRevenue = prevVendas.reduce((sum: number, v: any) => sum + (v.total_amount || v.amount || 0), 0)
  const momVariation = previousMonthRevenue > 0 ? ((grossRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0
  const goalProgress = goal?.target_amount && goal.target_amount > 0 ? (grossRevenue / goal.target_amount) * 100 : 0

  return {
    grossRevenue,
    expenses,
    netRevenue,
    previousMonthRevenue,
    momVariation,
    goal: goal?.target_amount || null,
    goalProgress
  }
}

function calculateChannelData(vendas: any[]) {
  const total = vendas.length || 1
  const channelMap = new Map<string, { count: number; amount: number }>()
  
  vendas.forEach((v: any) => {
    const channel = v.channel || 'manual'
    const existing = channelMap.get(channel) || { count: 0, amount: 0 }
    existing.count++
    existing.amount += v.total_amount || v.amount || 0
    channelMap.set(channel, existing)
  })

  const channelLabels: Record<string, string> = {
    manual: 'Criado manualmente',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram'
  }

  return Array.from(channelMap.entries()).map(([channel, data]) => ({
    channel,
    label: channelLabels[channel] || channel,
    count: data.count,
    amount: data.amount,
    percentage: (data.count / total) * 100
  }))
}

function calculatePaymentMethodData(vendas: any[]) {
  const total = vendas.reduce((sum: number, v: any) => sum + (v.total_amount || v.amount || 0), 0) || 1
  const methodMap = new Map<string, { count: number; amount: number }>()
  
  vendas.forEach((v: any) => {
    const method = v.payment_method || 'pix'
    const existing = methodMap.get(method) || { count: 0, amount: 0 }
    existing.count++
    existing.amount += v.total_amount || v.amount || 0
    methodMap.set(method, existing)
  })

  const methodLabels: Record<string, string> = {
    pix: 'PIX',
    cartao_credito: 'Cartão Crédito',
    cartao_debito: 'Cartão Débito',
    dinheiro: 'Dinheiro'
  }

  return Array.from(methodMap.entries()).map(([method, data]) => ({
    method,
    label: methodLabels[method] || method,
    amount: data.amount,
    count: data.count,
    percentage: (data.amount / total) * 100
  }))
}

function calculateServiceData(vendas: any[], services: any[]) {
  const total = vendas.reduce((sum: number, v: any) => sum + (v.total_amount || v.amount || 0), 0) || 1
  const serviceMap = new Map<string, { count: number; amount: number }>()
  
  vendas.forEach((v: any) => {
    if (v.service_id) {
      const existing = serviceMap.get(v.service_id) || { count: 0, amount: 0 }
      existing.count++
      existing.amount += v.total_amount || v.amount || 0
      serviceMap.set(v.service_id, existing)
    }
  })

  return Array.from(serviceMap.entries())
    .map(([serviceId, data]) => ({
      id: serviceId,
      name: services.find((s: any) => s.id === serviceId)?.name || 'Serviço',
      amount: data.amount,
      count: data.count,
      percentage: (data.amount / total) * 100
    }))
    .sort((a: any, b: any) => b.amount - a.amount)
}

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
        .select('*')
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
