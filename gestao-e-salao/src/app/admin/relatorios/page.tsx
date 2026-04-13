'use client'

import { useEffect, useState } from 'react'
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, 
  CreditCard, Smartphone, Banknote, PieChart, BarChart3, Filter, Download,
  ReceiptText, ShoppingBag
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, parseISO, isSameDay, isThisMonth, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Sale {
  id: string
  amount: number
  tip_amount: number
  total_amount: number
  payment_method: string
  date: string
  services?: { name: string }
  customers?: { name: string }
}

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  paid: boolean
}

export default function RelatoriosPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'day' | 'month'>('day')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [salesRes, expensesRes] = await Promise.all([
        fetch('/api/vendas'),
        fetch('/api/despesas')
      ])
      
      const salesData = await salesRes.json()
      const expensesData = await expensesRes.json()
      
      setSales(salesData.data || [])
      setExpenses(expensesData.data || [])
    } catch (e) {
      console.error('Erro ao carregar dados:', e)
    } finally {
      setLoading(false)
    }
  }

  const now = new Date()
  
  const filteredSales = sales.filter(s => {
    const sDate = parseISO(s.date)
    if (view === 'day') return isSameDay(sDate, now)
    return isThisMonth(sDate)
  })

  const filteredExpenses = expenses.filter(e => {
    const eDate = parseISO(e.date)
    if (view === 'day') return isSameDay(eDate, now)
    return isThisMonth(eDate)
  })

  const totalRevenue = filteredSales.reduce((sum, s) => sum + (Number(s.total_amount) || Number(s.amount) || 0), 0)
  const totalTips = filteredSales.reduce((sum, s) => sum + (Number(s.tip_amount) || 0), 0)
  const totalExpenses = filteredExpenses.filter(e => e.paid).reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const netProfit = totalRevenue - totalExpenses

  const paymentMethods = filteredSales.reduce((acc, s) => {
    const method = s.payment_method || 'Outro'
    acc[method] = (acc[method] || 0) + (Number(s.total_amount) || Number(s.amount) || 0)
    return acc
  }, {} as Record<string, number>)

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black italic uppercase flex items-center gap-3">
            <BarChart3 className="text-[#5E41FF]" size={28} /> Relatórios Financeiros
          </h1>
          <p className="text-gray-500 text-sm mt-1">Visão geral do desempenho do seu salão.</p>
        </div>
        <div className="flex bg-[#121021] rounded-xl p-1 border border-white/5">
          <button onClick={() => setView('day')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${view === 'day' ? 'bg-[#5E41FF] text-white' : 'text-gray-500 hover:text-white'}`}>
            Hoje
          </button>
          <button onClick={() => setView('month')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${view === 'month' ? 'bg-[#5E41FF] text-white' : 'text-gray-500 hover:text-white'}`}>
            Mês
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#5E41FF] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><TrendingUp size={20} className="text-emerald-500" /></div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Receita Bruta</span>
              </div>
              <p className="text-3xl font-black text-emerald-500">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-600 mt-2">{filteredSales.length} vendas no período</p>
            </div>

            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-2xl rounded-full" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><TrendingDown size={20} className="text-red-500" /></div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Despesas Pagas</span>
              </div>
              <p className="text-3xl font-black text-red-500">{formatCurrency(totalExpenses)}</p>
              <p className="text-xs text-gray-600 mt-2">{filteredExpenses.length} registros</p>
            </div>

            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#5E41FF]/10 blur-2xl rounded-full" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#5E41FF]/10 flex items-center justify-center"><DollarSign size={20} className="text-[#5E41FF]" /></div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Lucro Líquido</span>
              </div>
              <p className={`text-3xl font-black ${netProfit >= 0 ? 'text-white' : 'text-red-500'}`}>{formatCurrency(netProfit)}</p>
              <p className="text-xs text-gray-600 mt-2">Receita - Despesas</p>
            </div>

            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 blur-2xl rounded-full" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center"><ArrowUpRight size={20} className="text-yellow-500" /></div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Gorjetas</span>
              </div>
              <p className="text-3xl font-black text-yellow-500">{formatCurrency(totalTips)}</p>
              <p className="text-xs text-gray-600 mt-2">Extras dos clientes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Methods Breakdown */}
            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <PieChart size={16} /> Formas de Pagamento
              </h3>
              <div className="space-y-4">
                {Object.entries(paymentMethods).map(([method, amount]) => (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        {method === 'Pix' ? <Smartphone size={14} className="text-[#5E41FF]" /> : 
                         method === 'Dinheiro' ? <Banknote size={14} className="text-emerald-500" /> : 
                         <CreditCard size={14} className="text-blue-500" />}
                      </div>
                      <span className="text-sm text-gray-300">{method}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatCurrency(amount as number)}</p>
                      <p className="text-[10px] text-gray-600">{((amount as number) / (totalRevenue || 1) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
                {Object.keys(paymentMethods).length === 0 && (
                  <p className="text-center text-gray-600 text-sm py-4">Nenhuma venda registrada</p>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="lg:col-span-2 bg-[#121021] border border-white/5 p-6 rounded-3xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <Calendar size={16} /> Transações Recentes
              </h3>
              <div className="space-y-3">
                {[
                  ...filteredSales.map(s => ({ ...s, type: 'sale' as const })),
                  ...filteredExpenses.map(e => ({ ...e, type: 'expense' as const }))
                ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-xl hover:bg-black/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'sale' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        {t.type === 'sale' ? <ArrowUpRight size={18} className="text-emerald-500" /> : <ArrowDownRight size={18} className="text-red-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {t.type === 'sale' ? (t.services?.name || 'Venda') : t.description}
                        </p>
                        <p className="text-[10px] text-gray-600">
                          {format(parseISO(t.date), 'dd/MM/yyyy HH:mm')} • {t.type === 'sale' ? t.payment_method : t.category}
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm font-black ${t.type === 'sale' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {t.type === 'sale' ? '+' : '-'} {formatCurrency(t.type === 'sale' ? (Number(t.total_amount) || Number(t.amount)) : Number(t.amount))}
                    </p>
                  </div>
                ))}
                {filteredSales.length === 0 && filteredExpenses.length === 0 && (
                  <p className="text-center text-gray-600 text-sm py-8">Nenhuma transação encontrada</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
