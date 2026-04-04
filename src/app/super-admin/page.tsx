'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, TrendingUp, DollarSign, Activity, Search,
  CheckCircle, XCircle, Clock, Eye, LogOut, Building2,
  Calendar, ArrowUpRight, ArrowDownRight, Shield, CreditCard, Link as LinkIcon
} from 'lucide-react'
import { salonLogout } from '@/app/actions/salon-auth'

interface Salon {
  id: string
  name: string
  owner_name: string
  owner_email: string
  owner_phone: string | null
  whatsapp_number: string | null
  address: string | null
  plan: string
  status: string
  subscription_ends_at: string | null
  created_at: string
}

export default function SuperAdminPage() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, blocked: 0, revenue: 0 })
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadSalons()
  }, [])

  async function loadSalons() {
    try {
      const res = await fetch('/api/super-admin/salons')
      const data = await res.json()
      if (data.salons) {
        setSalons(data.salons)
        setStats({
          total: data.salons.length,
          active: data.salons.filter((s: Salon) => s.status === 'active').length,
          inactive: data.salons.filter((s: Salon) => s.status === 'inactive').length,
          blocked: data.salons.filter((s: Salon) => s.status === 'blocked').length,
          revenue: data.salons.filter((s: Salon) => s.status === 'active').length * 49.90
        })
      }
    } catch (e) {
      console.error('Error loading salons:', e)
    } finally {
      setLoading(false)
    }
  }

  async function updateSalonStatus(id: string, status: string) {
    setActionLoading(true)
    try {
      await fetch('/api/super-admin/salons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      await loadSalons()
      setShowModal(false)
      setSelectedSalon(null)
    } catch (e) {
      console.error('Error updating salon:', e)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleLogout() {
    await salonLogout()
    router.push('/login')
  }

  const filtered = salons.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.owner_email.toLowerCase().includes(search.toLowerCase()) ||
      s.owner_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    return matchSearch && matchStatus
  })

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('pt-BR') : 'N/A'

  const planLabel = (p: string) => {
    const labels: Record<string, string> = { basico: 'Básico', profissional: 'Profissional', premium: 'Premium' }
    return labels[p] || p
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      inactive: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      blocked: 'bg-red-500/10 text-red-500 border-red-500/20'
    }
    const labels: Record<string, string> = { active: 'Ativo', inactive: 'Inativo', blocked: 'Bloqueado' }
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5E41FF]/30 border-t-[#5E41FF] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
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
        <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-red-400 hover:text-red-500 transition-colors">
          <LogOut size={14} /> Sair
        </button>
      </header>

      <div className="p-8 max-w-[1400px] mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-3">
              <Building2 size={20} className="text-[#5E41FF]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Salões</span>
            </div>
            <p className="text-2xl font-black">{stats.total}</p>
          </div>
          <div className="bg-[#121021] border border-emerald-500/10 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle size={20} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Ativos</span>
            </div>
            <p className="text-2xl font-black text-emerald-500">{stats.active}</p>
          </div>
          <div className="bg-[#121021] border border-yellow-500/10 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-3">
              <Clock size={20} className="text-yellow-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Inativos</span>
            </div>
            <p className="text-2xl font-black text-yellow-500">{stats.inactive}</p>
          </div>
          <div className="bg-[#121021] border border-red-500/10 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-3">
              <XCircle size={20} className="text-red-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Bloqueados</span>
            </div>
            <p className="text-2xl font-black text-red-500">{stats.blocked}</p>
          </div>
          <div className="bg-[#121021] border border-white/5 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp size={20} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Receita Mensal</span>
            </div>
            <p className="text-2xl font-black text-emerald-500">{formatCurrency(stats.revenue)}</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-gray-500">
              <ArrowUpRight size={12} /> Estimado (R$ 49,90/salão)
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
            <input
              type="text"
              placeholder="Buscar salão, email ou nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#121021] border border-white/5 rounded-2xl outline-none focus:border-[#5E41FF]/50 text-sm text-white placeholder:text-gray-700"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'inactive', 'blocked'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterStatus === status
                    ? 'bg-[#5E41FF] text-white'
                    : 'bg-[#121021] border border-white/5 text-gray-500 hover:text-white'
                }`}
              >
                {status === 'all' ? 'Todos' : status === 'active' ? 'Ativos' : status === 'inactive' ? 'Inativos' : 'Bloqueados'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#121021] border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Salão</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Proprietário</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Plano</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Vencimento</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Cadastro</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map(salon => (
                  <tr key={salon.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5E41FF]/20 to-transparent flex items-center justify-center text-[#5E41FF] font-black text-sm">
                          {salon.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{salon.name}</p>
                          <p className="text-[10px] text-gray-600">{salon.owner_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-300">{salon.owner_name}</p>
                      {salon.owner_phone && <p className="text-[10px] text-gray-600">{salon.owner_phone}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#5E41FF]/10 text-[#5E41FF]">
                        {planLabel(salon.plan)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{statusBadge(salon.status)}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-300">{formatDate(salon.subscription_ends_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-300">{formatDate(salon.created_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedSalon(salon); setShowModal(true) }}
                          className="p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-[#5E41FF]/10 hover:border-[#5E41FF]/30 transition-all"
                          title="Detalhes"
                        >
                          <Eye size={14} className="text-gray-400 hover:text-[#5E41FF]" />
                        </button>
                        {salon.status === 'active' && (
                          <a
                            href={`https://wa.me/5521984559663?text=${encodeURIComponent(`Olá ${salon.owner_name}! Sua assinatura do Gestão E Salão vence em ${formatDate(salon.subscription_ends_at)}. Valor: R$ 49,90. Link de pagamento: `)}`}
                            target="_blank"
                            className="p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
                            title="Enviar cobrança"
                          >
                            <CreditCard size={14} className="text-gray-400 hover:text-emerald-500" />
                          </a>
                        )}
                        {salon.status === 'active' && (
                          <button
                            onClick={() => updateSalonStatus(salon.id, 'blocked')}
                            className="p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                            title="Bloquear"
                          >
                            <XCircle size={14} className="text-gray-400 hover:text-red-500" />
                          </button>
                        )}
                        {salon.status === 'blocked' && (
                          <button
                            onClick={() => updateSalonStatus(salon.id, 'active')}
                            className="p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
                            title="Desbloquear"
                          >
                            <CheckCircle size={14} className="text-gray-400 hover:text-emerald-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">
                      Nenhum salão encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedSalon && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={() => setShowModal(false)}>
          <div className="bg-[#121021] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black uppercase italic text-white">Detalhes do Salão</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <XCircle size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-black/30 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5E41FF]/30 to-transparent flex items-center justify-center text-[#5E41FF] font-black text-xl">
                  {selectedSalon.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-white">{selectedSalon.name}</p>
                  {statusBadge(selectedSalon.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-black/30 rounded-xl">
                  <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Proprietário</p>
                  <p className="text-sm text-white font-bold">{selectedSalon.owner_name}</p>
                </div>
                <div className="p-3 bg-black/30 rounded-xl">
                  <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Email</p>
                  <p className="text-sm text-white font-bold">{selectedSalon.owner_email}</p>
                </div>
                <div className="p-3 bg-black/30 rounded-xl">
                  <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Plano</p>
                  <p className="text-sm text-[#5E41FF] font-bold">{planLabel(selectedSalon.plan)}</p>
                </div>
                <div className="p-3 bg-black/30 rounded-xl">
                  <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Vencimento</p>
                  <p className="text-sm text-white font-bold">{formatDate(selectedSalon.subscription_ends_at)}</p>
                </div>
                {selectedSalon.whatsapp_number && (
                  <div className="p-3 bg-black/30 rounded-xl">
                    <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">WhatsApp</p>
                    <p className="text-sm text-white font-bold">{selectedSalon.whatsapp_number}</p>
                  </div>
                )}
                {selectedSalon.address && (
                  <div className="p-3 bg-black/30 rounded-xl">
                    <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Endereço</p>
                    <p className="text-sm text-white font-bold">{selectedSalon.address}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                {selectedSalon.status === 'active' ? (
                  <>
                    <a
                      href={`https://wa.me/5521984559663?text=${encodeURIComponent(`Olá ${selectedSalon.owner_name}! Sua assinatura do Gestão E Salão vence em ${formatDate(selectedSalon.subscription_ends_at)}. Para renovar: R$ 49,90/mês. Me chama aqui!`)}`}
                      target="_blank"
                      className="flex-1 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <LinkIcon size={14} /> Cobrar
                    </a>
                    <button
                      onClick={() => updateSalonStatus(selectedSalon.id, 'blocked')}
                      disabled={actionLoading}
                      className="flex-1 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      Bloquear
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => updateSalonStatus(selectedSalon.id, 'active')}
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    Desbloquear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
