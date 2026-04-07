'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  DollarSign,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  TrendingDown,
  CheckCircle,
  Clock,
  Receipt,
  Repeat,
  FileText,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { format, subMonths, addMonths, parseISO, isAfter, isBefore, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Despesa {
  id: string
  description: string
  amount: number
  category: string
  date: string
  due_date?: string | null
  paid: boolean
  paid_date?: string | null
  recurring?: boolean
  recurrence_type?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

interface FormData {
  description: string
  amount: string
  category: string
  date: string
  due_date: string
  paid: boolean
  recurring: boolean
  recurrence_type: string
  notes: string
}

const CATEGORIES = ['Fixo', 'Utilidades', 'Insumos', 'Marketing', 'Outros']
const RECURRENCE_TYPES = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' }
]

const CATEGORY_ICONS: Record<string, string> = {
  'Fixo': '🏠',
  'Utilidades': '💡',
  'Insumos': '🧴',
  'Marketing': '📢',
  'Outros': '📦'
}

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPaid, setFilterPaid] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    description: '',
    amount: '',
    category: 'Outros',
    date: format(new Date(), 'yyyy-MM-dd'),
    due_date: '',
    paid: false,
    recurring: false,
    recurrence_type: 'monthly',
    notes: ''
  })
  
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const fetchDespesas = useCallback(async () => {
    setLoading(true)
    try {
      const month = format(currentMonth, 'M')
      const year = format(currentMonth, 'yyyy')
      const params = new URLSearchParams({ month, year })
      
      if (filterCategory !== 'all') params.append('category', filterCategory)
      if (filterPaid !== 'all') params.append('paid', filterPaid)
      
      const res = await fetch(`/api/despesas?${params}`)
      const data = await res.json()
      
      if (data.success) {
        setDespesas(data.data)
      } else {
        showMessage('error', data.error || 'Erro ao carregar despesas')
      }
    } catch (e) {
      console.error(e)
      showMessage('error', 'Erro de conexão')
    }
    setLoading(false)
  }, [currentMonth, filterCategory, filterPaid])

  useEffect(() => {
    fetchDespesas()
  }, [fetchDespesas])

  const filteredDespesas = despesas.filter(d => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return d.description.toLowerCase().includes(searchLower) ||
           d.category.toLowerCase().includes(searchLower) ||
           (d.notes && d.notes.toLowerCase().includes(searchLower))
  })

  const totalDespesas = filteredDespesas.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
  const totalPagas = filteredDespesas.filter(d => d.paid).reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
  const totalPendentes = filteredDespesas.filter(d => !d.paid).reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
  const countDespesas = filteredDespesas.length
  
  const despesasVencidas = filteredDespesas.filter(d => 
    !d.paid && d.due_date && isBefore(parseISO(d.due_date), startOfDay(new Date()))
  ).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingDespesa) {
        const res = await fetch('/api/despesas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingDespesa.id,
            ...formData
          })
        })
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao atualizar')
        showMessage('success', 'Despesa atualizada com sucesso!')
      } else {
        const res = await fetch('/api/despesas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao salvar')
        showMessage('success', 'Despesa cadastrada com sucesso!')
      }
      
      setIsModalOpen(false)
      setEditingDespesa(null)
      resetForm()
      fetchDespesas()
    } catch (e: any) {
      showMessage('error', e.message || 'Erro ao salvar')
    }

    setSaving(false)
  }

  const handleEdit = (despesa: Despesa) => {
    setEditingDespesa(despesa)
    setFormData({
      description: despesa.description,
      amount: String(despesa.amount),
      category: despesa.category,
      date: despesa.date,
      due_date: despesa.due_date || '',
      paid: despesa.paid,
      recurring: despesa.recurring || false,
      recurrence_type: despesa.recurrence_type || 'monthly',
      notes: despesa.notes || ''
    })
    setIsModalOpen(true)
  }

  const handleTogglePaid = async (despesa: Despesa) => {
    try {
      const res = await fetch('/api/despesas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: despesa.id,
          paid: !despesa.paid
        })
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      showMessage('success', despesa.paid ? 'Marcada como pendente' : 'Marcada como paga!')
      fetchDespesas()
    } catch (e: any) {
      showMessage('error', e.message || 'Erro ao atualizar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta despesa?')) return
    try {
      const res = await fetch(`/api/despesas?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      showMessage('success', 'Despesa excluída!')
      fetchDespesas()
    } catch (e: any) {
      showMessage('error', e.message || 'Erro ao excluir')
    }
  }

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: 'Outros',
      date: format(new Date(), 'yyyy-MM-dd'),
      due_date: '',
      paid: false,
      recurring: false,
      recurrence_type: 'monthly',
      notes: ''
    })
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingDespesa(null)
    resetForm()
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-6">
      
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-red-500/20 flex items-center justify-center">
              <TrendingDown size={24} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Despesas</h1>
              <p className="text-gray-500 text-sm capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 md:p-3 bg-[#1a1a2e] rounded-xl hover:bg-[#2a2a4e] transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-3 md:px-4 py-2 bg-[#1a1a2e] rounded-xl text-sm hover:bg-[#2a2a4e] transition-all">
              Hoje
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 md:p-3 bg-[#1a1a2e] rounded-xl hover:bg-[#2a2a4e] transition-all">
              <ChevronRight size={20} />
            </button>
            
            <button
              onClick={() => { setEditingDespesa(null); resetForm(); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-red-500 rounded-xl font-medium hover:brightness-110 transition-all ml-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nova Despesa</span>
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`max-w-7xl mx-auto mb-4 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 'bg-red-600/20 text-red-400 border border-red-600/30'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-[#121021] rounded-2xl p-4 md:p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={16} className="text-red-400" />
            <span className="text-gray-400 text-xs md:text-sm">Total</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-red-400">
            R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-gray-500 text-xs mt-1">{countDespesas} despesas</p>
        </div>
        
        <div className="bg-[#121021] rounded-2xl p-4 md:p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span className="text-gray-400 text-xs md:text-sm">Pagas</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-emerald-400">
            R$ {totalPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="bg-[#121021] rounded-2xl p-4 md:p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-yellow-400" />
            <span className="text-gray-400 text-xs md:text-sm">Pendentes</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-yellow-400">
            R$ {totalPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="bg-[#121021] rounded-2xl p-4 md:p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-orange-400" />
            <span className="text-gray-400 text-xs md:text-sm">Vencidas</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-orange-400">
            {despesasVencidas}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-[#121021] rounded-2xl p-3 md:p-4 border border-white/10">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar despesa..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-red-500 transition-all text-sm"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-all text-sm min-w-[140px]"
            >
              <option value="all">Todas Categorias</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <select
              value={filterPaid}
              onChange={e => setFilterPaid(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-all text-sm min-w-[140px]"
            >
              <option value="all">Todos Status</option>
              <option value="true">Pagas</option>
              <option value="false">Pendentes</option>
            </select>
            
            <button
              onClick={fetchDespesas}
              className="p-3 bg-[#1a1a2e] rounded-xl hover:bg-[#2a2a4e] transition-all"
              title="Atualizar"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-[#121021] rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <Loader2 size={24} className="animate-spin mx-auto mb-2" />
            Carregando...
          </div>
        ) : filteredDespesas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <DollarSign size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">Nenhuma despesa encontrada</p>
            <p className="text-sm opacity-60">Clique em Nova Despesa para começar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 hidden md:table-row">
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Descrição</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Categoria</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Vencimento</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">Valor</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredDespesas.map((d, index) => {
                  const isVencida = !d.paid && d.due_date && isBefore(parseISO(d.due_date), startOfDay(new Date()))
                  return (
                    <tr key={d.id} className={`border-b border-white/5 ${index % 2 === 0 ? '' : 'bg-white/[0.02]'} ${d.paid ? 'opacity-60' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${d.paid ? 'bg-emerald-500/20' : isVencida ? 'bg-orange-500/20' : 'bg-red-500/20'}`}>
                            {d.recurring ? (
                              <Repeat size={18} className={d.paid ? 'text-emerald-400' : 'text-red-400'} />
                            ) : d.paid ? (
                              <CheckCircle size={18} className="text-emerald-400" />
                            ) : isVencida ? (
                              <Clock size={18} className="text-orange-400" />
                            ) : (
                              <Clock size={18} className="text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{d.description}</p>
                            {d.notes && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{d.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10">
                          <span>{CATEGORY_ICONS[d.category]}</span>
                          {d.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={14} className="text-gray-500" />
                          <span className={d.paid ? 'text-emerald-400' : isVencida ? 'text-orange-400' : 'text-gray-400'}>
                            {d.due_date ? format(parseISO(d.due_date), 'dd/MM/yyyy') : format(parseISO(d.date), 'dd/MM/yyyy')}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleTogglePaid(d)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            d.paid 
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                              : isVencida
                              ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          }`}
                        >
                          {d.paid ? (
                            <><CheckCircle size={14} /> Paga</>
                          ) : isVencida ? (
                            <><Clock size={14} /> Vencida</>
                          ) : (
                            <><Clock size={14} /> Pendente</>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-lg font-bold text-red-400">
                          R$ {Number(d.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(d)}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={closeModal}>
          <div className="bg-[#121021] rounded-3xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold">
                {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-lg">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Descrição *</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Aluguel, Luz, Internet..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 outline-none focus:border-red-500 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Valor (R$) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0,00"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 outline-none focus:border-red-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-red-500 transition-all"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paid: !formData.paid })}
                    className={`w-full py-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      formData.paid 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                        : 'border-white/10 text-gray-500 hover:border-white/30'
                    }`}
                  >
                    {formData.paid ? <CheckCircle size={18} /> : <Clock size={18} />}
                    {formData.paid ? 'Paga' : 'Pendente'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Data</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-red-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Vencimento</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-red-500 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Repeat size={14} className="inline mr-1" />
                  Despesa Recorrente?
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, recurring: !formData.recurring })}
                    className={`flex-1 py-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      formData.recurring 
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400' 
                        : 'border-white/10 text-gray-500 hover:border-white/30'
                    }`}
                  >
                    <Repeat size={16} />
                    {formData.recurring ? 'Sim' : 'Não'}
                  </button>
                  
                  {formData.recurring && (
                    <select
                      value={formData.recurrence_type}
                      onChange={e => setFormData({ ...formData, recurrence_type: e.target.value })}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-all"
                    >
                      {RECURRENCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-red-500 transition-all resize-none"
                />
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-red-500 text-black font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                {saving ? 'Salvando...' : editingDespesa ? 'Atualizar Despesa' : 'Cadastrar Despesa'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
