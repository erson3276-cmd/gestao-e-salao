export interface Sale {
  id: string
  amount: number
  tip_amount: number
  total_amount: number
  payment_method: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro'
  date: string
  customer_id?: string
  service_id?: string
  channel?: 'manual' | 'whatsapp' | 'instagram'
  services?: { id: string; name: string; category?: string; price: number }
  customers?: { id: string; name: string; avatar_url?: string }
  created_at: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  paid: boolean
  created_at: string
}

export interface Goal {
  id: string
  month: number
  year: number
  target_amount: number
  salon_id: string
  created_at: string
}

export interface CustomerStats {
  id: string
  name: string
  avatar_url: string | null
  total_visits: number
  total_spent: number
}

export interface ReportFilters {
  month: number
  year: number
}

export interface SalesSummary {
  grossRevenue: number
  expenses: number
  netRevenue: number
  previousMonthRevenue: number
  momVariation: number
  goal: number | null
  goalProgress: number
}

export interface WeeklyData {
  week: string
  value: number
  goal: number
}

export interface ChannelData {
  channel: string
  label: string
  count: number
  amount: number
  percentage: number
}

export interface PaymentMethodData {
  method: string
  label: string
  amount: number
  count: number
  percentage: number
}

export interface ServiceData {
  id: string
  name: string
  amount: number
  count: number
  percentage: number
}

export interface CategoryData {
  category: string
  label: string
  amount: number
  count: number
  percentage: number
}

export interface ReportData {
  salesSummary: SalesSummary
  weeklyData: WeeklyData[]
  channelData: ChannelData[]
  paymentMethodData: PaymentMethodData[]
  serviceData: ServiceData[]
  categoryData: CategoryData[]
  topCustomers: CustomerStats[]
  totalAppointments: number
}
