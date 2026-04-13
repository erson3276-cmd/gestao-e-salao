'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, LogOut, Building2, CheckCircle, Clock, XCircle, Shield, 
  Download, Trash2, Calendar, BarChart3, Activity, Users, AlertTriangle, History
} from 'lucide-react'
import { salonLogout } from '@/app/actions/salon-auth'

interface Salon {
  id: string
  name: string
  owner_name: string
  owner_email: string
  owner_phone: string | null
  whatsapp_number: string | null
  plan: string
  status: string
  subscription_ends_at: string | null
  created_at: string
}

interface Log {
  id: string
  action: string
  details: string
  salon_name: string
  created_at: string
}

type Tab = 'dashboard' | 'salons' | 'logs'

export default function SuperAdminPage() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [newSalonsThisMonth, setNewSalonsThisMonth] = useState(0)
  const [churnRate, setChurnRate] = useState(0)
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/session')
      const data = await res.json()
      if (data.role !== 'super-admin') { router.push('/login'); return }
      setIsAuthenticated(true)
      loadData()
    } catch { router.push('/login') }
  }

  async function loadData() {
    try {
      const salonsRes = await fetch('/api/super-admin/salons')
      const salonsData = await salonsRes.json()
      
      if (salonsData.salons) {
        setSalons(salonsData.salons)
        
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const newThisMonth = salonsData.salons.filter((s: Salon) => new Date(s.created_at) >= startOfMonth).length
        setNewSalonsThisMonth(newThisMonth)
        
        const total = salonsData.salons.length
        const active = salonsData.salons.filter((s: Salon) => s.status === 'active').length
        const inactive = salonsData.salons.filter((s: Salon) => s.status === 'inactive').length
        const blocked = salonsData.salons.filter((s: Salon) => s.status === 'blocked').length
        const churn = total > 0 ? Math.round((blocked / total) * 100) : 0
        setChurnRate(churn)
        
        setStats({ total, active, inactive, blocked, revenue: active * 49.90 })
      }

      try {
        const logsRes = await fetch('/api/super-admin/logs')
        const logsData = await logsRes.json()
        if (logsData.logs) setLogs(logsData.logs)
      } catch {}
    } catch (e) { console.error('Error:', e) }
    finally { setLoading(false) }
  }

  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, blocked: 0, revenue: 0 })

  async function updateSalonStatus(id: string, status: string) {
    setActionLoading(true)
    try {
      await fetch('/api/super-admin/salons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      loadData()
      setShowModal(false)
      setSelectedSalon(null)
    } catch (e) { console.error(e) }
    finally { setActionLoading(false) }
  }

  async function deleteSalon(id: string) {
    if (!confirm('Excluir permanentemente?')) return
    setDeleteLoading(id)
    try {
      await fetch(`/api/super-admin/salons?id=${id}`, { method: 'DELETE' })
      loadData()
      setShowModal(false)
      setSelectedSalon(null)
    } catch (e) { console.error(e) }
    finally { setDeleteLoading(null) }
  }

  async function handleLogout() {
    await salonLogout()
    router.push('/login')
  }

  function exportToCSV() {
    const headers = ['Nome', 'Proprietário', 'Email', 'Telefone', 'Plano', 'Status', 'Vencimento', 'Cadastro']
    const rows = filtered.map(s => [s.name, s.owner_name, s.owner_email, s.owner_phone || '', planLabel(s.plan), s.status, formatDate(s.subscription_ends_at), formatDate(s.created_at)])
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `saloes_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const filtered = salons.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.owner_email.toLowerCase().includes(search.toLowerCase()) || s.owner_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    return matchSearch && matchStatus
  })

  const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR') : 'N/A'
  const planLabel = (p: string) => ({ basico: 'Básico', profissional: 'Profissional', premium: 'Premium' }[p] || p)

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = { active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', inactive: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', blocked: 'bg-red-500/10 text-red-500 border-red-500/20' }
    const labels: Record<string, string> = { active: 'Ativo', inactive: 'Inativo', blocked: 'Bloqueado' }
    return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status] || ''}`}>{labels[status] || status}</span>
  }

  if (!isAuthenticated || loading) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#5E41FF]/30 border-t-[#5E41FF] rounded-full animate-spin" /></div>
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="h-16 flex items-center justify-between px-8 bg-[#121021] border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#5E41FF] to-[#3a28a3] flex items-center justify-center font-black italic text-white shadow-lg shadow-[#5E41FF]/20">
            <Shield size={18} />
          </div>
          <div>
            <span className="text-sm font-black tracking-tight uppercase italic">Gestão<span className="text-[#5E41FF]">E</span>Salão</span>
            <span className="text-[9px] text-[#5E41FF] uppercase font-black tracking-[0.2em] ml-2">Super Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-gray-500">{stats.total} salões cadastrados</span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-red-400 hover:text-red-500"><LogOut size={14} /> Sair</button>
        </div>
      </header>

      <div className="flex gap-8 px-8 pt-6 border-b border-white/5 bg-[#0A0A0A]">
        <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 pb-3 px-1 text-[11px] font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-[#5E41FF] text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}><BarChart3 size={16} /> Dashboard</button>
        <button onClick={() => setActiveTab('salons')} className={`flex items-center gap-2 pb-3 px-1 text-[11px] font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'salons' ? 'border-[#5E41FF] text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}><Building2 size={16} /> Salões</button>
        <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-2 pb-3 px-1 text-[11px] font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'logs' ? 'border-[#5E41FF] text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}><History size={16} /> Logs</button>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="bg-[#121021] border border-white/5 p-5 rounded-3xl">
                <div className="flex items-center gap-2 mb-2"><Building2 size={16} className="text-[#5E41FF]" /><span className="text-[9px] font-black uppercase text-gray-500">Total</span></div>
                <p className="text-3xl font-black">{stats.total}</p>
              </div>
              <div className="bg-[#121021] border border-emerald-500/10 p-5 rounded-3xl">
                <div className="flex items-center gap-2 mb-2"><CheckCircle size={16} className="text-emerald-500" /><span className="text-[9px] font-black uppercase text-gray-500">Ativos</span></div>
                <p className="text-3xl font-black text-emerald-500">{stats.active}</p>
              </div>
              <div className="bg-[#121021] border border-yellow-500/10 p-5 rounded-3xl">
                <div className="flex items-center gap-2 mb-2"><Clock size={16} className="text-yellow-500" /><span className="text-[9px] font-black uppercase text-gray-500">Inativos</span></div>
                <p className="text-3xl font-black text-yellow-500">{stats.inactive}</p>
              </div>
              <div className="bg-[#121021] border border-red-500/10 p-5 rounded-3xl">
                <div className="flex items-center gap-2 mb-2"><XCircle size={16} className="text-red-500" /><span className="text-[9px] font-black uppercase text-gray-500">Bloqueados</span></div>
                <p className="text-3xl font-black text-red-500">{stats.blocked}</p>
              </div>
              <div className="bg-[#121021] border border-[#5E41FF]/20 p-5 rounded-3xl">
                <div className="flex items-center gap-2 mb-2"><Users size={16} className="text-[#5E41FF]" /><span className="text-[9px] font-black uppercase text-gray-500">Novos (Mês)</span></div>
                <p className="text-3xl font-black text-white">+{newSalonsThisMonth}</p>
              </div>
              <div className="bg-[#121021] border border-emerald-500/10 p-5 rounded-3xl">
                <div className="flex items-center gap-2 mb-2"><Activity size={16} className="text-emerald-500" /><span className="text-[9px] font-black uppercase text-gray-500">MRR</span></div>
                <p className="text-2xl font-black text-emerald-500">{formatCurrency(stats.revenue)}</p>
              </div>
              <div className="bg-[#121021] border border-orange-500/10 p-5 rounded-3xl">
                <div className="flex items-center gap-2 mb-2"><XCircle size={16} className="text-orange-500" /><span className="text-[9px] font-black uppercase text-gray-500">Churn</span></div>
                <p className="text-3xl font-black text-orange-500">{churnRate}%</p>
              </div>
            </div>

            {stats.inactive > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl flex items-center gap-3">
                <AlertTriangle size={20} className="text-yellow-500" />
                <div>
                  <p className="text-sm font-bold text-yellow-500">{stats.inactive} salões inativos</p>
                  <p className="text-[10px] text-gray-500">Precisam de atenção</p>
                </div>
              </div>
            )}

            {stats.blocked > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-500" />
                <div>
                  <p className="text-sm font-bold text-red-500">{stats.blocked} salões bloqueados</p>
                  <p className="text-[10px] text-gray-500">Assinatura expirada</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
                <h3 className="text-xs font-black uppercase text-gray-500 mb-4">Status dos Salões</h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center mb-2">
                      <span className="text-2xl font-black">{stats.active}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">Ativos</span>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full border-4 border-yellow-500 flex items-center justify-center mb-2">
                      <span className="text-2xl font-black">{stats.inactive}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">Inativos</span>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full border-4 border-red-500 flex items-center justify-center mb-2">
                      <span className="text-2xl font-black">{stats.blocked}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">Bloqueados</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
                <h3 className="text-xs font-black uppercase text-gray-500 mb-4">Crescimento Mensal</h3>
                <div className="space-y-3">
                  {(() => {
                    const months = []
                    const now = new Date()
                    for (let i = 5; i >= 0; i--) {
                      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
                      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
                      const count = salons.filter(s => {
                        const created = new Date(s.created_at)
                        return created >= monthStart && created <= monthEnd
                      }).length
                      months.push({ name: monthStart.toLocaleDateString('pt-BR', { month: 'short' }), count })
                    }
                    const maxCount = Math.max(...months.map(m => m.count), 1)
                    return months.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-500 w-8 uppercase">{m.name}</span>
                        <div className="flex-1 h-6 bg-[#1a1a2e] rounded overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#5E41FF] to-[#8B5CF6] rounded transition-all" style={{ width: `${(m.count / maxCount) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400 w-8 text-right">{m.count}</span>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </div>

            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
              <h3 className="text-xs font-black uppercase text-gray-500 mb-4">Recém Cadastrados</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...salons].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5).map(salon => (
                  <div key={salon.id} className="p-4 bg-black/20 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5E41FF]/30 flex items-center justify-center text-[#5E41FF] font-black mb-2">{salon.name.charAt(0).toUpperCase()}</div>
                    <p className="text-sm font-bold truncate">{salon.name}</p>
                    <p className="text-[10px] text-gray-500">{salon.owner_name}</p>
                    <p className="text-[10px] text-gray-600 mt-1">{formatDate(salon.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'salons' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input type="text" placeholder="Buscar salão..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-[#121021] border border-white/5 rounded-2xl outline-none focus:border-[#5E41FF]/50 text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={exportToCSV} className="px-4 py-3 bg-[#121021] border border-white/5 text-gray-400 hover:text-white rounded-2xl text-[10px] font-black uppercase flex items-center gap-2"><Download size={14} /> Exportar</button>
                {['all', 'active', 'inactive', 'blocked'].map(status => (
                  <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase ${filterStatus === status ? 'bg-[#5E41FF] text-white' : 'bg-[#121021] border border-white/5 text-gray-500'}`}>{status === 'all' ? 'Todos' : status === 'active' ? 'Ativos' : status === 'inactive' ? 'Inativos' : 'Bloqueados'}</button>
                ))}
              </div>
            </div>

            <div className="bg-[#121021] border border-white/5 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-white/5">
                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-gray-500">Salão</th>
                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-gray-500">Proprietário</th>
                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-gray-500">Plano</th>
                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-gray-500">Status</th>
                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-gray-500">Vencimento</th>
                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-gray-500">Ações</th>
                  </tr></thead>
                  <tbody>
                    {filtered.length > 0 ? filtered.map(salon => (
                      <tr key={salon.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5E41FF]/20 flex items-center justify-center text-[#5E41FF] font-black text-sm">{salon.name.charAt(0).toUpperCase()}</div>
                            <div><p className="text-sm font-bold">{salon.name}</p><p className="text-[10px] text-gray-600">{salon.owner_email}</p></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{salon.owner_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{planLabel(salon.plan)}</td>
                        <td className="px-6 py-4">{statusBadge(salon.status)}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{formatDate(salon.subscription_ends_at)}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => { setSelectedSalon(salon); setShowModal(true) }} className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white"><Search size={16} /></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-600 text-xs font-bold uppercase">Nenhum salão encontrado</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
              <h3 className="text-xs font-black uppercase text-gray-500 mb-4">Histórico de Atividades</h3>
              {logs.length > 0 ? (
                <div className="space-y-3">
                  {logs.map(log => (
                    <div key={log.id} className="flex items-start gap-4 p-3 bg-black/20 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-[#5E41FF]/20 flex items-center justify-center text-[#5E41FF]"><Activity size={14} /></div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{log.action}</p>
                        <p className="text-[10px] text-gray-500">{log.details}</p>
                        {log.salon_name && <p className="text-[10px] text-gray-600 mt-1">Salão: {log.salon_name}</p>}
                      </div>
                      <span className="text-[10px] text-gray-600">{formatDate(log.created_at)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8 text-sm">Nenhum log encontrado</p>
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && selectedSalon && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={() => setShowModal(false)}>
          <div className="bg-[#121021] border border-white/10 rounded-3xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black uppercase text-white">Detalhes do Salão</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl"><XCircle size={20} className="text-gray-500" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-black/30 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5E41FF]/30 flex items-center justify-center text-[#5E41FF] font-black text-xl">{selectedSalon.name.charAt(0).toUpperCase()}</div>
                <div><p className="font-black text-white">{selectedSalon.name}</p>{statusBadge(selectedSalon.status)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-black/30 rounded-xl"><p className="text-[9px] text-gray-600 uppercase font-black">Email</p><p className="text-sm text-white">{selectedSalon.owner_email}</p></div>
                <div className="p-3 bg-black/30 rounded-xl"><p className="text-[9px] text-gray-600 uppercase font-black">Telefone</p><p className="text-sm text-white">{selectedSalon.owner_phone || 'N/A'}</p></div>
                <div className="p-3 bg-black/30 rounded-xl"><p className="text-[9px] text-gray-600 uppercase font-black">Vencimento</p><p className="text-sm text-white">{formatDate(selectedSalon.subscription_ends_at)}</p></div>
                <div className="p-3 bg-black/30 rounded-xl"><p className="text-[9px] text-gray-600 uppercase font-black">Plano</p><p className="text-sm text-white">{planLabel(selectedSalon.plan)}</p></div>
              </div>
              <div className="flex gap-3 pt-4">
                {selectedSalon.status === 'active' ? (
                  <button onClick={() => updateSalonStatus(selectedSalon.id, 'blocked')} disabled={actionLoading} className="flex-1 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black uppercase text-xs disabled:opacity-50">Bloquear</button>
                ) : (
                  <button onClick={() => updateSalonStatus(selectedSalon.id, 'active')} disabled={actionLoading} className="flex-1 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl font-black uppercase text-xs disabled:opacity-50">Desbloquear</button>
                )}
                <button onClick={() => { const days = prompt('Dias a adicionar?', '30'); if (days) fetch('/api/super-admin/salons', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedSalon.id, extendDays: Number(days) }) }) }} className="py-3 px-4 bg-[#5E41FF]/10 border border-[#5E41FF]/20 text-[#5E41FF] rounded-2xl font-black uppercase text-xs flex items-center gap-2"><Calendar size={14} /> +Dias</button>
                <button onClick={() => deleteSalon(selectedSalon.id)} disabled={deleteLoading === selectedSalon.id} className="py-3 px-4 bg-red-500/20 border border-red-500/30 text-red-500 rounded-2xl font-black uppercase text-xs disabled:opacity-50">{deleteLoading === selectedSalon.id ? '...' : <Trash2 size={14} />}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}