'use client'

import { useState, useEffect, useRef } from 'react'
import { Save, Loader2, Wifi, RefreshCw, Copy, Check, LogOut, Clock, Plus, Trash2, Upload, Users, X } from 'lucide-react'

const headers = {
  'Content-Type': 'application/json'
}

const serviceHeaders = {
  'Content-Type': 'application/json'
}

const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

interface WorkingHour {
  id?: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

interface Professional {
  id?: string
  name: string
  commission_percent: number
  whatsapp?: string
}

export default function GestaoPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [salonId, setSalonId] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>({
    name: '',
    professional_name: '',
    whatsapp_number: '',
    address: '',
    opening_time: '09:00',
    closing_time: '18:00',
    slot_interval: 30,
    image_url: ''
  })

  const [waConnected, setWaConnected] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [copied, setCopied] = useState(false)

  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([
    { day_of_week: 0, start_time: '09:00', end_time: '12:00', is_active: false },
    { day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true },
    { day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true },
    { day_of_week: 3, start_time: '09:00', end_time: '18:00', is_active: true },
    { day_of_week: 4, start_time: '09:00', end_time: '18:00', is_active: true },
    { day_of_week: 5, start_time: '09:00', end_time: '18:00', is_active: true },
    { day_of_week: 6, start_time: '09:00', end_time: '14:00', is_active: true },
  ])

  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isProfModalOpen, setIsProfModalOpen] = useState(false)
  const [profForm, setProfForm] = useState<Professional>({ name: '', commission_percent: 50, whatsapp: '' })
  const [editingProfId, setEditingProfId] = useState<string | null>(null)

  useEffect(() => {
    loadSession()
    loadProfile()
    loadWorkingHours()
    loadProfessionals()
    checkWA()
    const interval = setInterval(checkWA, 10000)
    return () => clearInterval(interval)
  }, [])

  async function loadSession() {
    try {
      const res = await fetch('/api/session')
      if (res.ok) {
        const data = await res.json()
        if (data.salonId) setSalonId(data.salonId)
      }
    } catch (e) {
      console.error('Error loading session:', e)
    }
  }

  async function loadProfile() {
    try {
      const res = await fetch('/api/gestao/profile')
      const data = await res.json()
      if (data && data.profile) {
        setProfile(data.profile)
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function loadWorkingHours() {
    try {
      const res = await fetch('/api/working-hours')
      const data = await res.json()
      if (data.success && data.data?.length > 0) {
        const existing = data.data
        const allDays: WorkingHour[] = []
        for (let i = 0; i < 7; i++) {
          const found = existing.find((w: WorkingHour) => w.day_of_week === i)
          allDays.push(found || { day_of_week: i, start_time: '09:00', end_time: '18:00', is_active: i !== 0 })
        }
        setWorkingHours(allDays)
      }
    } catch (e) { console.error(e) }
  }

  async function loadProfessionals() {
    try {
      const res = await fetch('/api/professionals')
      const data = await res.json()
      if (data.professionals) setProfessionals(data.professionals)
    } catch (e) { console.error(e) }
  }

  async function checkWA() {
    try {
      const res = await fetch('/api/wa-status')
      const data = await res.json()
      setWaConnected(data.connected === true)
      setWaConnected(true)
    } catch (e) { setWaConnected(false) }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/gestao/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      for (const wh of workingHours) {
        await fetch('/api/working-hours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wh)
        })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) { alert('Erro ao salvar') }
    setSaving(false)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      
      if (data.success && data.url) {
        setProfile({ ...profile, image_url: data.url })
      } else {
        alert('Erro ao fazer upload: ' + (data.error || 'Erro desconhecido'))
      }
    } catch (err: any) {
      alert('Erro ao fazer upload: ' + err.message)
    }
  }

  async function saveProfessional() {
    if (!profForm.name) return alert('Nome é obrigatório')
    
    try {
      const method = editingProfId ? 'PATCH' : 'POST'
      await fetch('/api/professionals', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProfId ? { ...profForm, id: editingProfId } : profForm)
      })
      setIsProfModalOpen(false)
      setProfForm({ name: '', commission_percent: 50, whatsapp: '' })
      setEditingProfId(null)
      loadProfessionals()
    } catch (e) { alert('Erro ao salvar profissional') }
  }

  async function deleteProfessional(id: string) {
    if (!confirm('Excluir este profissional?')) return
    try {
      await fetch(`/api/professionals?id=${id}`, {
        method: 'DELETE'
      })
      loadProfessionals()
    } catch (e) { alert('Erro ao excluir') }
  }

  function editProfessional(prof: Professional) {
    setProfForm(prof)
    setEditingProfId(prof.id || null)
    setIsProfModalOpen(true)
  }

  async function connectWA() {
    setConnecting(true)
    setQrCode('')
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' })
      })
      const data = await res.json()
      if (data.base64) setQrCode(data.base64)
      if (data.pairingCode) alert('Código: ' + data.pairingCode)
      if (data.error) alert('Erro: ' + data.error)
    } catch (e) { alert('Erro ao conectar') }
    setConnecting(false)
  }

  async function disconnectWA() {
    if (!confirm('Desconectar WhatsApp?')) return
    try {
      await fetch('/api/wa-disconnect', { method: 'POST' })
      setWaConnected(false)
      setQrCode('')
      alert('Desconectado!')
    } catch (e) { alert('Erro') }
  }

  function copyLink() {
    const bookingUrl = `${window.location.origin}/book/${salonId || ''}`
    navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function updateWorkingHours(dayOfWeek: number, field: keyof WorkingHour, value: string | boolean) {
    setWorkingHours(prev => prev.map(wh => 
      wh.day_of_week === dayOfWeek ? { ...wh, [field]: value } : wh
    ))
  }

  if (loading) return <div className="p-10 text-center text-white">Carregando...</div>

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6">Gestão do Salão</h1>

      {/* Dados do Salão */}
      <div className="bg-gray-900 rounded-2xl p-5 mb-5">
        <h2 className="font-bold mb-4">Dados do Salão</h2>
        
        {/* Foto do Salão */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-xl bg-gray-800 border border-white/10 overflow-hidden flex items-center justify-center">
            {profile.image_url ? (
              <img src={profile.image_url} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <Users size={24} className="text-gray-600" />
            )}
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Foto do Salão (aparece no link de agendamento)</p>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-all">
              <Upload size={16} /> {profile.image_url ? 'Trocar Foto' : 'Enviar Foto'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400">Nome do Salão</label>
            <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl mt-1" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Profissional</label>
            <input value={profile.professional_name} onChange={e => setProfile({...profile, professional_name: e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl mt-1" />
          </div>
          <div>
            <label className="text-xs text-gray-400">WhatsApp</label>
            <input value={profile.whatsapp_number} onChange={e => setProfile({...profile, whatsapp_number: e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl mt-1" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Endereço</label>
            <input value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl mt-1" />
          </div>
        </div>
      </div>

      {/* Profissionais */}
      <div className="bg-gray-900 rounded-2xl p-5 mb-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold flex items-center gap-2"><Users size={18} /> Profissionais</h2>
          <button onClick={() => { setProfForm({ name: '', commission_percent: 50, whatsapp: '' }); setEditingProfId(null); setIsProfModalOpen(true) }} className="flex items-center gap-1 px-3 py-1.5 bg-[#5E41FF] rounded-lg text-xs font-medium">
            <Plus size={14} /> Adicionar
          </button>
        </div>
        
        {professionals.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Nenhum profissional cadastrado</p>
        ) : (
          <div className="space-y-2">
            {professionals.map(prof => (
              <div key={prof.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-white">{prof.name}</p>
                  <p className="text-xs text-gray-400">Comissão: {prof.commission_percent}% {prof.whatsapp && `• ${prof.whatsapp}`}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => editProfessional(prof)} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all"><Users size={14} /></button>
                  <button onClick={() => deleteProfessional(prof.id!)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Horários por dia da semana */}
      <div className="bg-gray-900 rounded-2xl p-5 mb-5">
        <h2 className="font-bold mb-4 flex items-center gap-2"><Clock size={18} /> Horários por Dia</h2>
        <div className="space-y-3">
          {workingHours.map(wh => (
            <div key={wh.day_of_week} className={`p-3 rounded-xl ${wh.is_active ? 'bg-gray-800' : 'bg-gray-800/50 opacity-60'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={wh.is_active} onChange={e => updateWorkingHours(wh.day_of_week, 'is_active', e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm font-medium text-white">{dayNames[wh.day_of_week]}</span>
                </div>
                {wh.is_active && <span className="text-xs text-emerald-400">{wh.start_time} - {wh.end_time}</span>}
              </div>
              {wh.is_active && (
                <div className="grid grid-cols-2 gap-2 ml-6">
                  <div>
                    <label className="text-[10px] text-gray-500">Abertura</label>
                    <input type="time" value={wh.start_time} onChange={e => updateWorkingHours(wh.day_of_week, 'start_time', e.target.value)} className="w-full p-2 bg-gray-700 rounded-lg text-sm mt-0.5" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Fechamento</label>
                    <input type="time" value={wh.end_time} onChange={e => updateWorkingHours(wh.day_of_week, 'end_time', e.target.value)} className="w-full p-2 bg-gray-700 rounded-lg text-sm mt-0.5" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Link */}
      <div className="bg-gray-900 rounded-2xl p-5 mb-5">
        <h2 className="font-bold mb-4">Link de Agendamento</h2>
        <div className="flex items-center gap-2">
          <input readOnly value={salonId ? `${window.location.origin}/book/${salonId}` : 'Carregando...'} className="flex-1 p-3 bg-gray-800 rounded-xl text-sm" />
          <button onClick={copyLink} disabled={!salonId} className="p-3 bg-yellow-500 rounded-xl disabled:opacity-50">
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="bg-gray-900 rounded-2xl p-5 mb-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">WhatsApp</h2>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${waConnected ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
            <Wifi size={12} />
            {waConnected ? 'Conectado' : 'Desconectado'}
          </div>
        </div>
        <div className="flex gap-2">
          {waConnected && (
            <button onClick={disconnectWA} className="p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500/30 transition-all" title="Desconectar">
              <LogOut size={20} />
            </button>
          )}
          <button onClick={connectWA} disabled={connecting} className="flex-1 p-3 bg-yellow-500 text-black font-bold rounded-xl flex items-center justify-center gap-2">
            {connecting ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
            {waConnected ? 'Reconectar' : 'Conectar'}
          </button>
        </div>
        {qrCode && (
          <div className="mt-4 flex flex-col items-center">
            <img src={qrCode} alt="QR" className="w-48 h-48" />
            <p className="text-xs text-gray-400 mt-2">Escaneie com WhatsApp</p>
          </div>
        )}
      </div>

      {/* Salvar */}
      <div className="fixed bottom-4 left-4 right-4">
        <button onClick={handleSave} disabled={saving} className="w-full p-4 bg-yellow-500 text-black font-bold rounded-xl flex items-center justify-center gap-2">
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} SALVAR
        </button>
        {saved && (
          <div className="absolute -top-10 left-0 right-0 text-center">
            <span className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm">Salvo!</span>
          </div>
        )}
      </div>

      {/* Modal Profissional */}
      {isProfModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setIsProfModalOpen(false)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{editingProfId ? 'Editar' : 'Novo'} Profissional</h3>
              <button onClick={() => setIsProfModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Nome</label>
                <input value={profForm.name} onChange={e => setProfForm({...profForm, name: e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl mt-1" placeholder="Nome do profissional" />
              </div>
              <div>
                <label className="text-xs text-gray-400">WhatsApp</label>
                <input value={profForm.whatsapp} onChange={e => setProfForm({...profForm, whatsapp: e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl mt-1" placeholder="11999999999" />
              </div>
              <div>
                <label className="text-xs text-gray-400">Comissão (%)</label>
                <input type="number" value={profForm.commission_percent} onChange={e => setProfForm({...profForm, commission_percent: parseInt(e.target.value) || 0})} className="w-full p-3 bg-gray-800 rounded-xl mt-1" />
              </div>
              <button onClick={saveProfessional} className="w-full p-3 bg-[#5E41FF] rounded-xl font-bold mt-2">
                {editingProfId ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
