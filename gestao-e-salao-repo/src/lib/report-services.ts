import { 
  ReportFilters, 
  Sale,
  Expense,
  Goal
} from '../types/report'
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths,
  format
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function getDateRange(filters: ReportFilters) {
  const date = new Date(filters.year, filters.month - 1)
  return {
    start: startOfMonth(date),
    end: endOfMonth(date)
  }
}

export function getPreviousMonthRange(filters: ReportFilters) {
  const prevMonth = subMonths(new Date(filters.year, filters.month - 1), 1)
  return {
    start: startOfMonth(prevMonth),
    end: endOfMonth(prevMonth)
  }
}

export function calculateSalesSummary(
  vendas: Sale[],
  despesas: Expense[],
  goal: Goal | null,
  previousMonthVendas: Sale[]
) {
  const grossRevenue = vendas.reduce((sum, v) => sum + (v.total_amount || v.amount), 0)
  const expenses = despesas.reduce((sum, d) => sum + d.amount, 0)
  const netRevenue = grossRevenue - expenses
  
  const previousMonthRevenue = previousMonthVendas.reduce((sum, v) => sum + (v.total_amount || v.amount), 0)
  
  const momVariation = previousMonthRevenue > 0 
    ? ((grossRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : 0

  const goalProgress = goal && goal.target_amount > 0 
    ? (grossRevenue / goal.target_amount) * 100 
    : 0

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

export function calculateChannelData(vendas: Sale[]) {
  const total = vendas.length || 1
  
  const channelMap = new Map<string, { count: number; amount: number }>()
  
  vendas.forEach(v => {
    const channel = v.channel || 'manual'
    const existing = channelMap.get(channel) || { count: 0, amount: 0 }
    existing.count++
    existing.amount += v.total_amount || v.amount
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

export function calculatePaymentMethodData(vendas: Sale[]) {
  const total = vendas.reduce((sum, v) => sum + (v.total_amount || v.amount), 0) || 1
  
  const methodMap = new Map<string, { count: number; amount: number }>()
  
  vendas.forEach(v => {
    const method = v.payment_method || 'pix'
    const existing = methodMap.get(method) || { count: 0, amount: 0 }
    existing.count++
    existing.amount += v.total_amount || v.amount
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

export function calculateServiceData(
  vendas: Sale[],
  services: { id: string; name: string }[]
) {
  const total = vendas.reduce((sum, v) => sum + (v.total_amount || v.amount), 0) || 1
  
  const serviceMap = new Map<string, { count: number; amount: number }>()
  
  vendas.forEach(v => {
    if (v.service_id) {
      const existing = serviceMap.get(v.service_id) || { count: 0, amount: 0 }
      existing.count++
      existing.amount += v.total_amount || v.amount
      serviceMap.set(v.service_id, existing)
    }
  })

  return Array.from(serviceMap.entries())
    .map(([serviceId, data]) => ({
      id: serviceId,
      name: services.find(s => s.id === serviceId)?.name || 'Serviço',
      amount: data.amount,
      count: data.count,
      percentage: (data.amount / total) * 100
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function getMonthName(month: number, year: number): string {
  const date = new Date(year, month - 1)
  return format(date, 'MMMM yyyy', { locale: ptBR })
}
