'use client'

import { useEffect, useState } from 'react'
import { Users, Calendar, Scissors, ShoppingBag, TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react'

interface Stats {
  totalClients: number
  todayAppointments: number
  monthlyRevenue: number
  servicesCount: number
}

export default function GestaoPage() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    servicesCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    try {
      const [clientsRes, apptsRes, salesRes, servicesRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/appointments'),
        fetch('/api/vendas'),
        fetch('/api/services')
      ])

      const clients = await clientsRes.json()
      const appointments = await apptsRes.json()
      const sales = await salesRes.json()
      const services = await servicesRes.json()

      const today = new Date().toISOString().split('T')[0]
      const todayAppts = (appointments.data || []).filter((a: any) => 
        a.start_time?.startsWith(today) && a.status !== 'cancelado'
      )

      const monthStart = new Date()
      monthStart.setDate(1)
      const monthlySales = (sales.data || []).filter((s: any) => {
        const saleDate = new Date(s.created_at || s.date)
        return saleDate >= monthStart
      })
      const monthlyRevenue = monthlySales.reduce((sum: number, s: any) => sum + (Number(s.total_amount) || Number(s.amount) || 0), 0)

      setStats({
        totalClients: (clients.data || []).length,
        todayAppointments: todayAppts.length,
        monthlyRevenue,
        servicesCount: (services.data || []).length
      })
    } catch (e) {
      console.error('Erro ao carregar dados:', e)
    }
    setLoading(false)
  }

  const cards = [
    {
      title: 'Total de Clientes',
      value: stats.totalClients,
      icon: Users,
      color: '#5E41FF',
      bg: 'bg-[#5E41FF]/10'
    },
    {
      title: 'Agendamentos Hoje',
      value: stats.todayAppointments,
      icon: Calendar,
      color: '#10b981',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Faturamento Mensal',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthlyRevenue),
      icon: TrendingUp,
      color: '#f59e0b',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'Serviços Cadastrados',
      value: stats.servicesCount,
      icon: Scissors,
      color: '#ec4899',
      bg: 'bg-pink-500/10'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black italic text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do seu salão</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#5E41FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, i) => (
              <div key={i} className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center`}>
                    <card.icon size={24} style={{ color: card.color }} />
                  </div>
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">{card.title}</p>
                <p className="text-3xl font-black text-white mt-2">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-[#121021] border border-white/5 p-8 rounded-3xl">
            <h2 className="text-lg font-black text-white mb-6">Ações Rápidas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/admin/agenda" className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                <Calendar size={32} className="text-[#5E41FF]" />
                <span className="text-sm font-medium text-gray-300">Novo Agendamento</span>
              </a>
              <a href="/admin/clientes" className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                <Users size={32} className="text-emerald-500" />
                <span className="text-sm font-medium text-gray-300">Cadastrar Cliente</span>
              </a>
              <a href="/admin/vendas" className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                <ShoppingBag size={32} className="text-amber-500" />
                <span className="text-sm font-medium text-gray-300">Registrar Venda</span>
              </a>
              <a href="/admin/despesas" className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                <DollarSign size={32} className="text-red-500" />
                <span className="text-sm font-medium text-gray-300">Nova Despesa</span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
