'use client'

import { useEffect, useState, useMemo } from 'react'
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, 
  CreditCard, Smartphone, Banknote, PieChart, BarChart3, Filter, Download,
  ReceiptText, ShoppingBag, Users, Edit2, Bell, ChevronDown, X,
  ChevronRight, Wallet, Package, Scissors
} from 'lucide-react'
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  parseISO, isSameMonth, subMonths, getWeek, startOfWeek, endOfWeek,
  isWithinInterval, addMonths, subMonths as subMonthsFn
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Sale {
  id: string
  amount: number
  tip_amount: number
  total_amount: number
  payment_method: string
  date: string
  customer_id?: string
  service_id?: string
  channel?: string
  services?: { id: string; name: string; category?: string; price: number }
  customers?: { id: string; name: string; avatar_url?: string }
}

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  paid: boolean
}

interface Goal {
  id: string
  month: number
  year: number
  target_amount: number
}

interface Customer {
  id: string
  name: string
  avatar_url?: string
  total_visits?: number
  total_spent?: number
}

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const formatPercent = (val: number) => 
  `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function getWeekNumber(date: Date): number {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 })
  const diffDays = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7) + 1
}

export default function RelatoriosPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [newGoal, setNewGoal] = useState('')

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  async function fetchData() {
    setLoading(true)
    try {
      const [salesRes, expensesRes, customersRes] = await Promise.all([
        fetch('/api/vendas'),
        fetch('/api/despesas'),
        fetch('/api/customers')
      ])
      
      const salesData = await salesRes.json()
      const expensesData = await expensesRes.json()
      const customersData = await customersRes.json()
      
      setSales(salesData.data || [])
      setExpenses(expensesData.data || [])
      setCustomers(customersData.data || [])
      
      const month = selectedMonth.getMonth() + 1
      const year = selectedMonth.getFullYear()
      const mockGoal: Goal = {
        id: `goal-${month}-${year}`,
        month,
        year,
        target_amount: 15000
      }
      setGoal(mockGoal)
    } catch (e) {
      console.error('Erro ao carregar dados:', e)
    } finally {
      setLoading(false)
    }
  }

  const filteredSales = useMemo(() => {
    const start = startOfMonth(selectedMonth)
    const end = endOfMonth(selectedMonth)
    return sales.filter(s => {
      const date = parseISO(s.date)
      return isWithinInterval(date, { start, end })
    })
  }, [sales, selectedMonth])

  const filteredExpenses = useMemo(() => {
    const start = startOfMonth(selectedMonth)
    const end = endOfMonth(selectedMonth)
    return expenses.filter(e => {
      const date = parseISO(e.date)
      return isWithinInterval(date, { start, end }) && e.paid
    })
  }, [expenses, selectedMonth])

  const prevMonthSales = useMemo(() => {
    const prevMonth = subMonthsFn(selectedMonth, 1)
    const start = startOfMonth(prevMonth)
    const end = endOfMonth(prevMonth)
    return sales.filter(s => {
      const date = parseISO(s.date)
      return isWithinInterval(date, { start, end })
    })
  }, [sales, selectedMonth])

  const totalRevenue = filteredSales.reduce((sum, s) => sum + (Number(s.total_amount) || Number(s.amount) || 0), 0)
  const prevRevenue = prevMonthSales.reduce((sum, s) => sum + (Number(s.total_amount) || Number(s.amount) || 0), 0)
  const revenueVariation = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const netProfit = totalRevenue - totalExpenses

  const weeklyData = useMemo(() => {
    const weeks: { week: number; total: number; goal: number }[] = []
    const start = startOfMonth(selectedMonth)
    const end = endOfMonth(selectedMonth)
    const goalAmount = goal?.target_amount || 15000
    
    for (let i = 1; i <= 5; i++) {
      weeks.push({ week: i, total: 0, goal: goalAmount / 5 })
    }
    
    filteredSales.forEach(s => {
      const date = parseISO(s.date)
      const weekNum = getWeekNumber(date)
      const weekIndex = Math.min(weekNum - 1, 4)
      if (weekIndex >= 0 && weekIndex < 5) {
        weeks[weekIndex].total += Number(s.total_amount) || Number(s.amount) || 0
      }
    })
    
    return weeks
  }, [filteredSales, goal, selectedMonth])

  const paymentBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = { PIX: 0, cartão: 0, dinheiro: 0, outro: 0 }
    filteredSales.forEach(s => {
      const method = (s.payment_method || 'outro').toLowerCase()
      if (method.includes('pix') || method.includes('transfer')) breakdown['PIX'] += Number(s.total_amount) || Number(s.amount) || 0
      else if (method.includes('dinheiro') || method.includes('cash')) breakdown['dinheiro'] += Number(s.total_amount) || Number(s.amount) || 0
      else if (method.includes('cartão') || method.includes('credit') || method.includes('debito')) breakdown['cartão'] += Number(s.total_amount) || Number(s.amount) || 0
      else breakdown['outro'] += Number(s.total_amount) || Number(s.amount) || 0
    })
    return Object.entries(breakdown).filter(([, v]) => v > 0).map(([k, v]) => ({ method: k, value: v }))
  }, [filteredSales])

  const channelBreakdown = useMemo(() => {
    const channels: Record<string, { count: number; total: number }> = {
      'Criado manualmente': { count: 0, total: 0 },
      'WhatsApp': { count: 0, total: 0 },
      'Instagram': { count: 0, total: 0 },
      'Site': { count: 0, total: 0 }
    }
    filteredSales.forEach(s => {
      const channel = s.channel || 'Criado manualmente'
      if (!channels[channel]) channels[channel] = { count: 0, total: 0 }
      channels[channel].count++
      channels[channel].total += Number(s.total_amount) || Number(s.amount) || 0
    })
    return Object.entries(channels).map(([k, v]) => ({ channel: k, ...v }))
  }, [filteredSales])

  const serviceBreakdown = useMemo(() => {
    const services: Record<string, { count: number; total: number }> = {}
    filteredSales.forEach(s => {
      const name = s.services?.name || 'Serviço'
      if (!services[name]) services[name] = { count: 0, total: 0 }
      services[name].count++
      services[name].total += Number(s.services?.price) || Number(s.total_amount) || Number(s.amount) || 0
    })
    return Object.entries(services)
      .map(([k, v]) => ({ service: k, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [filteredSales])

  const topClients = useMemo(() => {
    const clientTotals: Record<string, { visits: number; spent: number; name: string; avatar?: string }> = {}
    filteredSales.forEach(s => {
      const name = s.customers?.name || 'Cliente'
      const cid = s.customer_id || 'unknown'
      if (!clientTotals[cid]) clientTotals[cid] = { visits: 0, spent: 0, name, avatar: s.customers?.avatar_url }
      clientTotals[cid].visits++
      clientTotals[cid].spent += Number(s.total_amount) || Number(s.amount) || 0
    })
    return Object.entries(clientTotals)
      .map(([k, v]) => ({ id: k, ...v }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 10)
  }, [filteredSales])

  const maxWeeklyValue = Math.max(...weeklyData.map(w => w.total), ...weeklyData.map(w => w.goal), 1)

  const handleSaveGoal = () => {
    const amount = parseFloat(newGoal.replace(/\./g, '').replace(',', '.'))
    if (amount > 0 && goal) {
      setGoal({ ...goal, target_amount: amount })
    }
    setShowGoalModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black italic uppercase flex items-center gap-3">
            <BarChart3 className="text-[#5E41FF]" size={28} /> Relatórios
          </h1>
          <p className="text-gray-500 text-sm mt-1">Análise financeira completa do seu salão.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-xl bg-[#121021] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white">
            <Bell size={18} />
          </button>
          
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#121021] border border-white/5 rounded-xl">
              <span className="text-sm font-bold">{format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            
            <input 
              type="month"
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#5E41FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI: Faturamento & Meta */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#5E41FF]/10 flex items-center justify-center">
                    <TrendingUp size={24} className="text-[#5E41FF]" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">Faturamento Bruto</p>
                    <p className="text-3xl font-black text-white">{formatCurrency(totalRevenue)}</p>
                  </div>
                </div>
                <div className={cn(
                  'px-3 py-1 rounded-full text-sm font-bold',
                  revenueVariation >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                )}>
                  {formatPercent(revenueVariation)}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Meta do mês</span>
                  <span className="font-bold text-white">{formatCurrency(goal?.target_amount || 0)}</span>
                </div>
                
                <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#5E41FF] to-purple-400 rounded-full transition-all"
                    style={{ width: `${Math.min((totalRevenue / (goal?.target_amount || 1)) * 100, 100)}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{((totalRevenue / (goal?.target_amount || 1)) * 100).toFixed(0)}% atingido</span>
                  <button 
                    onClick={() => { setNewGoal(String(goal?.target_amount || 0)); setShowGoalModal(true) }}
                    className="text-xs text-[#5E41FF] hover:underline flex items-center gap-1"
                  >
                    <Edit2 size={12} /> Editar meta
                  </button>
                </div>
              </div>
            </div>

            {/* Gráfico Semanal */}
            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">Desempenho Semanal</h3>
              
              <div className="flex items-end justify-between h-48 gap-2">
                {weeklyData.map((week, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-[#5E41FF]/30 rounded-t-lg relative overflow-hidden"
                        style={{ height: `${(week.total / maxWeeklyValue) * 160}px` }}
                      >
                        <div 
                          className="absolute bottom-0 w-full bg-[#5E41FF] rounded-t-lg"
                          style={{ height: `${(week.total / maxWeeklyValue) * 160}px` }}
                        />
                      </div>
                      <div 
                        className="w-full h-1 bg-emerald-500/20 rounded-full"
                        style={{ marginTop: `${Math.max(160 - (week.goal / maxWeeklyValue) * 160, 0)}px` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">Sem {week.week}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#5E41FF]" />
                  <span className="text-gray-500">Faturado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-gray-500">Meta</span>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs: Receita Líquida */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-2">
                <Wallet size={20} className="text-emerald-500" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Receita Líquida</span>
              </div>
              <p className="text-3xl font-black text-white">{formatCurrency(netProfit)}</p>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <span className="text-gray-600">Mês passado:</span>
                <span className="text-gray-400">{formatCurrency(prevRevenue - totalExpenses)}</span>
              </div>
            </div>

            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={20} className="text-[#5E41FF]" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Agendamentos</span>
              </div>
              <p className="text-3xl font-black text-white">{filteredSales.length}</p>
              <p className="text-xs text-gray-600 mt-2">no período</p>
            </div>

            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl flex flex-col justify-center">
              <button className="w-full py-3 bg-[#5E41FF] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#5E41FF]/90">
                <ArrowUpRight size={18} /> + Nova Venda
              </button>
              <button className="w-full py-3 mt-2 bg-red-600/20 text-red-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600/30">
                <ArrowDownRight size={18} /> + Nova Despesa
              </button>
            </div>
          </div>

          {/* Análise por Canal & Pagamento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Canal */}
            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Smartphone size={16} /> Canal de Origem
                </h3>
                <span className="text-xs text-gray-600">{filteredSales.length} total</span>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a1a2e" strokeWidth="3" />
                    {channelBreakdown.map((c, i) => {
                      const offset = channelBreakdown.slice(0, i).reduce((a, b) => a + b.total, 0)
                      const total = channelBreakdown.reduce((a, b) => a + b.total, 0)
                      const dash = (c.total / total) * 100
                      const dashArray = dash ? `${dash} ${100 - dash}` : '0 100'
                      return (
                        <circle 
                          key={c.channel} 
                          cx="18" cy="18" r="15.9" 
                          fill="none" 
                          stroke={['#5E41FF', '#10b981', '#f59e0b', '#ef4444'][i % 4]}
                          strokeWidth="3"
                          strokeDasharray={dashArray}
                          strokeDashoffset={-offset / total * 100}
                          className="transition-all"
                        />
                      )
                    })}
                  </svg>
                </div>
                
                <div className="space-y-3 flex-1">
                  {channelBreakdown.map((c, i) => (
                    <div key={c.channel} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#5E41FF', '#10b981', '#f59e0b', '#ef4444'][i % 4] }} />
                        <span className="text-xs text-gray-400">{c.channel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{c.count}</span>
                        <div className="w-20 h-1 bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${(c.count / channelBreakdown.reduce((a, b) => a + b.count, 0)) * 100}%`,
                              backgroundColor: ['#5E41FF', '#10b981', '#f59e0b', '#ef4444'][i % 4]
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <CreditCard size={16} /> Forma de Pagamento
              </h3>
              
              <div className="space-y-4">
                {paymentBreakdown.map(p => (
                  <div key={p.method} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        {p.method === 'PIX' ? <Smartphone size={16} className="text-[#5E41FF]" /> : 
                         p.method === 'dinheiro' ? <Banknote size={16} className="text-emerald-500" /> : 
                         <CreditCard size={16} className="text-blue-500" />}
                      </div>
                      <span className="text-sm font-medium text-gray-300">{p.method}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatCurrency(p.value)}</p>
                      <p className="text-[10px] text-gray-600">
                        {((p.value / totalRevenue) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))}
                {paymentBreakdown.length === 0 && (
                  <p className="text-center text-gray-600 py-4">Nenhuma venda</p>
                )}
              </div>
            </div>
          </div>

          {/* Serviços & Clientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Serviços */}
            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <Scissors size={16} /> Serviços Mais Rentáveis
              </h3>
              
              <div className="flex items-center gap-8">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a1a2e" strokeWidth="3" />
                    {serviceBreakdown.slice(0, 4).map((s, i) => {
                      const total = serviceBreakdown.reduce((a, b) => a + b.total, 0)
                      const dash = total > 0 ? (s.total / total) * 100 : 0
                      return (
                        <circle 
                          key={s.service} 
                          cx="18" cy="18" r="15.9" 
                          fill="none" 
                          stroke={['#5E41FF', '#9333ea', '#06b6d4', '#f59e0b'][i % 4]}
                          strokeWidth="3"
                          strokeDasharray={`${dash} ${100 - dash}`}
                          strokeDashoffset={-serviceBreakdown.slice(0, i).reduce((a, b) => a + b.total, 0) / total * 100}
                        />
                      )
                    })}
                  </svg>
                </div>
                
                <div className="space-y-3 flex-1">
                  {serviceBreakdown.slice(0, 5).map((s, i) => (
                    <div key={s.service} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#5E41FF', '#9333ea', '#06b6d4', '#f59e0b'][i % 4] }} />
                        <span className="text-xs text-gray-400 truncate max-w-[120px]">{s.service}</span>
                      </div>
                      <span className="text-xs font-bold text-white">{formatCurrency(s.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Clientes Top 10 */}
            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Users size={16} /> Top Clientes
                </h3>
                <button className="text-xs text-[#5E41FF] flex items-center gap-1">
                  Lista completa <ChevronRight size={12} />
                </button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {topClients.map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-all">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                        i === 0 ? 'bg-yellow-500 text-black' : 
                        i === 1 ? 'bg-gray-400 text-black' : 
                        i === 2 ? 'bg-amber-700 text-white' : 
                        'bg-white/10 text-gray-500'
                      )}>
                        {i + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5E41FF] to-purple-500 flex items-center justify-center overflow-hidden">
                        {c.avatar ? (
                          <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-white">{c.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-300">{c.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatCurrency(c.spent)}</p>
                      <p className="text-[10px] text-gray-600">{c.visits} visitas</p>
                    </div>
                  </div>
                ))}
                {topClients.length === 0 && (
                  <p className="text-center text-gray-600 py-4">Nenhum cliente</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Editar Meta */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#121021] border border-white/10 p-6 rounded-3xl w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black">Editar Meta</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-gray-500">Meta do mês</label>
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-xl font-bold text-white outline-none focus:border-[#5E41FF]"
                  placeholder="15.000,00"
                />
              </div>
              
              <button 
                onClick={handleSaveGoal}
                className="w-full py-4 bg-[#5E41FF] text-white rounded-xl font-bold"
              >
                Salvar Meta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}