'use client'

import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Loader2, ChevronLeft, ChevronRight, Gift } from 'lucide-react'
import { format, subMonths, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Venda {
  amount: number
  tip_amount?: number
}

interface Despesa {
  amount: number
}

interface Comissao {
  comission_amount: number
}

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true)
  const [vendas, setVendas] = useState<Venda[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [comissoes, setComissoes] = useState<Comissao[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetchData()
  }, [currentMonth])

  async function fetchData() {
    setLoading(true)
    try {
      const month = format(currentMonth, 'M')
      const year = format(currentMonth, 'yyyy')
      
      const [vendasRes, despesasRes, comissaoRes] = await Promise.all([
        fetch('/api/vendas'),
        fetch(`/api/despesas?month=${month}&year=${year}`),
        fetch('/api/comissao')
      ])
      const vendasData = await vendasRes.json()
      const despesasData = await despesasRes.json()
      const comissaoData = await comissaoRes.json()
      
      if (vendasData.success) setVendas(vendasData.data)
      if (despesasData.success) setDespesas(despesasData.data)
      if (comissaoData.success) setComissoes(comissaoData.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const totalVendas = vendas.reduce((sum, v) => sum + (v.amount || 0), 0)
  const totalGorjetas = vendas.reduce((sum, v) => sum + (v.tip_amount || 0), 0)
  const totalDespesas = despesas.reduce((sum, d) => sum + (d.amount || 0), 0)
  const totalComissao = comissoes.reduce((sum, c) => sum + (c.comission_amount || 0), 0)
  const lucro = totalVendas + totalGorjetas - totalDespesas - totalComissao

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-[#5E41FF]" size={24} />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 bg-[#121021] rounded-lg hover:bg-[#1a1a2e] transition-all">
            <ChevronLeft size={18} />
          </button>
          <span className="px-4 py-2 bg-[#121021] rounded-lg text-sm min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 bg-[#121021] rounded-lg hover:bg-[#1a1a2e] transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#121021] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-emerald-400" />
            <p className="text-xs text-gray-400">Serviços</p>
          </div>
          <p className="text-xl font-bold text-emerald-400">R$ {totalVendas.toFixed(2)}</p>
        </div>
        <div className="bg-[#121021] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift size={18} className="text-yellow-400" />
            <p className="text-xs text-gray-400">Gorjetas</p>
          </div>
          <p className="text-xl font-bold text-yellow-400">R$ {totalGorjetas.toFixed(2)}</p>
        </div>
      </div>

      {/* Lucro */}
      <div className={`rounded-xl p-6 mb-6 ${lucro >= 0 ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Lucro Líquido</p>
            <p className={`text-3xl font-bold ${lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {lucro.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Serviços + Gorjetas - Despesas - Comissões</p>
          </div>
          <DollarSign size={40} className={lucro >= 0 ? 'text-emerald-400' : 'text-red-400'} />
        </div>
      </div>

      {/* Detalhamento */}
      <div className="space-y-4">
        <div className="bg-[#121021] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">Total Serviços</p>
            <p className="text-xs text-gray-400">{vendas.length} transações</p>
          </div>
          <p className="font-bold text-emerald-400">R$ {totalVendas.toFixed(2)}</p>
        </div>
        
        <div className="bg-[#121021] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">Total Gorjetas</p>
            <p className="text-xs text-gray-400">{vendas.filter(v => (v.tip_amount || 0) > 0).length} gorjetas</p>
          </div>
          <p className="font-bold text-yellow-400">R$ {totalGorjetas.toFixed(2)}</p>
        </div>
        
        <div className="bg-[#121021] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">Total Despesas</p>
            <p className="text-xs text-gray-400">{despesas.length} transações</p>
          </div>
          <p className="font-bold text-red-400">R$ {totalDespesas.toFixed(2)}</p>
        </div>
        
        <div className="bg-[#121021] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">Total Comissões</p>
            <p className="text-xs text-gray-400">{comissoes.length} transações</p>
          </div>
          <p className="font-bold text-orange-400">R$ {totalComissao.toFixed(2)}</p>
        </div>
      </div>

      {/* Fórmula */}
      <div className="mt-6 p-4 bg-[#121021] rounded-xl border border-white/10">
        <p className="text-xs text-gray-400 mb-2">Cálculo do Lucro</p>
        <p className="text-sm">
          R$ {totalVendas.toFixed(2)} (vendas) - R$ {totalDespesas.toFixed(2)} (despesas) - R$ {totalComissao.toFixed(2)} (comissoes) = 
          <span className={`font-bold ml-2 ${lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            R$ {lucro.toFixed(2)}
          </span>
        </p>
      </div>
    </div>
  )
}
