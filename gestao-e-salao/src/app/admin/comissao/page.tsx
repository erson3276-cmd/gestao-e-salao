'use client'

import { useEffect, useState } from 'react'
import { Plus, DollarSign, Check, X, Loader2, Trash2 } from 'lucide-react'

interface Comissao {
  id: string
  vendor_name: string
  sale_amount: number
  percentage: number
  comission_amount: number
  date: string
  paid: boolean
}

export default function ComissaoPage() {
  const [comissoes, setComissoes] = useState<Comissao[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ vendor_name: '', sale_amount: '', percentage: '10', date: new Date().toISOString().split('T')[0] })

  useEffect(() => {
    fetchComissoes()
  }, [])

  async function fetchComissoes() {
    setLoading(true)
    try {
      const res = await fetch('/api/comissao')
      const data = await res.json()
      if (data.success) setComissoes(data.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/comissao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      setIsModalOpen(false)
      setFormData({ vendor_name: '', sale_amount: '', percentage: '10', date: new Date().toISOString().split('T')[0] })
      fetchComissoes()
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  async function togglePaid(id: string, paid: boolean) {
    await fetch('/api/comissao', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, paid: !paid })
    })
    fetchComissoes()
  }

  async function deleteComissao(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta comissão?')) return
    try {
      await fetch('/api/comissao', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      fetchComissoes()
    } catch (e) {
      console.error(e)
    }
  }

  const totalComissao = comissoes.reduce((sum, c) => sum + c.comission_amount, 0)
  const paidComissao = comissoes.filter(c => c.paid).reduce((sum, c) => sum + c.comission_amount, 0)
  const pendingComissao = totalComissao - paidComissao

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Comissão</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#5E41FF] rounded-lg text-sm font-medium">
          <Plus size={16} /> Nova Comissão
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#121021] rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Total</p>
          <p className="text-xl font-bold text-[#5E41FF]">R$ {totalComissao.toFixed(2)}</p>
        </div>
        <div className="bg-[#121021] rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Pago</p>
          <p className="text-xl font-bold text-emerald-400">R$ {paidComissao.toFixed(2)}</p>
        </div>
        <div className="bg-[#121021] rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Pendente</p>
          <p className="text-xl font-bold text-orange-400">R$ {pendingComissao.toFixed(2)}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#5E41FF]" size={24} />
        </div>
      ) : comissoes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <DollarSign size={48} className="mx-auto mb-4 opacity-30" />
          <p>Nenhuma comissão</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comissoes.map((c) => (
            <div key={c.id} className="bg-[#121021] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold">{c.vendor_name}</p>
                <p className="text-xs text-gray-400">Venda: R$ {c.sale_amount.toFixed(2)} • {c.percentage}%</p>
                <p className="text-[10px] text-gray-500">{c.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#CBA64B]">R$ {c.comission_amount.toFixed(2)}</p>
                <div className="flex gap-1 mt-1 justify-end">
                  <button
                    onClick={() => togglePaid(c.id, c.paid)}
                    className={`text-xs px-2 py-1 rounded ${c.paid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}
                  >
                    {c.paid ? 'Pago' : 'Pendente'}
                  </button>
                  <button
                    onClick={() => deleteComissao(c.id)}
                    className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                    title="Excluir comissão"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#121021] rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Nova Comissão</h2>
            <input
              type="text"
              value={formData.vendor_name}
              onChange={e => setFormData({ ...formData, vendor_name: e.target.value })}
              placeholder="Nome do profissional"
              className="w-full p-3 bg-black/40 border border-white/10 rounded-lg mb-3 text-sm"
            />
            <input
              type="number"
              value={formData.sale_amount}
              onChange={e => setFormData({ ...formData, sale_amount: e.target.value })}
              placeholder="Valor da venda"
              className="w-full p-3 bg-black/40 border border-white/10 rounded-lg mb-3 text-sm"
            />
            <input
              type="number"
              value={formData.percentage}
              onChange={e => setFormData({ ...formData, percentage: e.target.value })}
              placeholder="Porcentagem"
              className="w-full p-3 bg-black/40 border border-white/10 rounded-lg mb-3 text-sm"
            />
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-3 bg-black/40 border border-white/10 rounded-lg mb-4 text-sm"
            />
            <button onClick={handleSave} disabled={saving || !formData.vendor_name || !formData.sale_amount} className="w-full py-3 bg-[#5E41FF] rounded-lg font-bold disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
