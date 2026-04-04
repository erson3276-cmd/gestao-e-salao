'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  User,
  X,
  Save,
  Loader2,
  Check,
  Ban,
  Clock
} from 'lucide-react'
import { 
  format, 
  addDays, 
  startOfWeek, 
  eachDayOfInterval, 
  isToday,
  getDay,
  parseISO
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
}

interface Customer {
  id: string
  name: string
  whatsapp?: string
}

interface Appointment {
  id: string
  customer_id: string
  service_id: string
  start_time: string
  end_time: string
  status: 'agendado' | 'confirmado' | 'finalizado' | 'cancelado' | 'falta'
  customers?: Customer
  services?: Service
}

interface BlockedSlot {
  id: string
  date: string
  start_time: string
  end_time: string
}

interface WorkingHour {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

const START_HOUR = 7
const END_HOUR = 21
const HOUR_HEIGHT = 80

const getBrasiliaDateStr = (date: Date) => {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

const getBrasiliaTimeStr = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false })
}

const timeToMinutes = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([
    { id: '0', day_of_week: 0, start_time: '09:00', end_time: '12:00', is_active: false },
    { id: '1', day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true },
    { id: '2', day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true },
    { id: '3', day_of_week: 3, start_time: '09:00', end_time: '18:00', is_active: true },
    { id: '4', day_of_week: 4, start_time: '09:00', end_time: '18:00', is_active: true },
    { id: '5', day_of_week: 5, start_time: '09:00', end_time: '18:00', is_active: true },
    { id: '6', day_of_week: 6, start_time: '09:00', end_time: '14:00', is_active: true },
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'dia' | 'semana'>('semana')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)
  
  const [formData, setFormData] = useState({ customerId: '', serviceId: '', date: '', time: '' })
  const [tipAmount, setTipAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('dinheiro')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [aptRes, custRes, servRes, blockedRes, whRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/customers'),
        fetch('/api/services'),
        fetch('/api/blocked-slots'),
        fetch('/api/working-hours')
      ])

      const aptData = await aptRes.json()
      const custData = await custRes.json()
      const servData = await servRes.json()
      const blockedData = await blockedRes.json()
      const whData = await whRes.json()

      setAppointments(aptData.data || [])
      setCustomers(custData.data || [])
      setServices(servData.data || [])
      setBlockedSlots(blockedData.data || [])
      if (whData.success && whData.data?.length > 0) setWorkingHours(whData.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = getBrasiliaDateStr(date)
    return appointments
      .filter(a => {
        if (a.status === 'cancelado') return false
        const aptDateStr = getBrasiliaDateStr(parseISO(a.start_time))
        return aptDateStr === dateStr
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }

  const toggleBlockSlot = async (date: Date, time: string) => {
    const dateStr = getBrasiliaDateStr(date)
    const endMin = timeToMinutes(time) + 30
    const endTime = minutesToTime(endMin)
    
    const existing = blockedSlots.find(b => b.date === dateStr && b.start_time === time)
    
    if (existing) {
      await fetch(`/api/blocked-slots?id=${existing.id}`, { method: 'DELETE' })
      setBlockedSlots(prev => prev.filter(b => b.id !== existing.id))
    } else {
      const res = await fetch('/api/blocked-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, start_time: time, end_time: endTime })
      })
      const data = await res.json()
      if (data.success) setBlockedSlots(prev => [...prev, data.data])
    }
  }

  const handleSlotClick = (date: Date, hour: number, minute: number) => {
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    const dateStr = getBrasiliaDateStr(date)
    
    // Check if blocked
    const isBlocked = blockedSlots.some(b => 
      b.date === dateStr && b.start_time === timeStr
    )
    
    if (isBlocked) {
      toggleBlockSlot(date, timeStr)
      return
    }
    
    // Check if there's an appointment
    const apt = appointments.find(a => {
      if (a.status === 'cancelado') return false
      const aptDateStr = getBrasiliaDateStr(parseISO(a.start_time))
      if (aptDateStr !== dateStr) return false
      const aptTime = getBrasiliaTimeStr(a.start_time)
      return aptTime === timeStr
    })
    
    if (apt) {
      setSelectedApt(apt)
      setIsCheckoutOpen(true)
    } else {
      setFormData({ customerId: '', serviceId: '', date: dateStr, time: timeStr })
      setIsModalOpen(true)
    }
  }

  const handleCreate = async () => {
    if (!formData.customerId || !formData.serviceId || !formData.date || !formData.time) {
      alert('Preencha todos os campos')
      return
    }
    setSaving(true)
    try {
      const service = services.find(s => s.id === formData.serviceId)
      const [y, m, d] = formData.date.split('-').map(Number)
      const [h, min] = formData.time.split(':').map(Number)
      const brasiliaDate = new Date(y, m - 1, d, h, min)
      const utcDate = new Date(brasiliaDate.getTime() + 3 * 60 * 60 * 1000)
      const endUtc = new Date(utcDate.getTime() + (service?.duration_minutes || 60) * 60000)
      
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: formData.customerId,
          service_id: formData.serviceId,
          start_time: utcDate.toISOString(),
          end_time: endUtc.toISOString(),
          status: 'agendado'
        })
      })
      
      const data = await res.json()
      if (data.success) {
        setIsModalOpen(false)
        setFormData({ customerId: '', serviceId: '', date: '', time: '' })
        loadData()
      } else {
        alert(data.error || 'Erro ao criar')
      }
    } catch (e) { alert('Erro ao criar') }
    setSaving(false)
  }

  const handleCheckout = async () => {
    if (!selectedApt) return
    setSaving(true)
    try {
      const service = services.find(s => s.id === selectedApt.service_id)
      const tip = parseFloat(tipAmount) || 0
      
      const res = await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedApt.customer_id,
          service_id: selectedApt.service_id,
          amount: service?.price || 0,
          tip_amount: tip,
          total_amount: (service?.price || 0) + tip,
          payment_method: paymentMethod,
          date: new Date().toISOString()
        })
      })
      
      const data = await res.json()
      if (!data.success) {
        alert('Erro ao registrar venda: ' + (data.error || 'Erro desconhecido'))
        setSaving(false)
        return
      }
      
      await fetch(`/api/appointments/${selectedApt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'finalizado' })
      })
      
      setIsCheckoutOpen(false)
      setSelectedApt(null)
      setTipAmount('')
      setPaymentMethod('dinheiro')
      loadData()
    } catch (e: any) { alert('Erro ao finalizar: ' + e.message) }
    setSaving(false)
  }

  const handleCancel = async (apt: Appointment) => {
    if (!confirm(`Cancelar agendamento de ${apt.customers?.name}?`)) return
    try {
      await fetch(`/api/appointments/${apt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelado' })
      })
      loadData()
    } catch (e) { alert('Erro ao cancelar') }
  }

  const days = view === 'semana' 
    ? eachDayOfInterval({ start: startOfWeek(currentDate, { locale: ptBR }), end: addDays(startOfWeek(currentDate, { locale: ptBR }), 6) })
    : [currentDate]

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Agenda</h1>
        <div className="flex gap-2">
          <button onClick={() => setView('dia')} className={`px-3 py-1.5 rounded-lg text-sm ${view === 'dia' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400'}`}>Dia</button>
          <button onClick={() => setView('semana')} className={`px-3 py-1.5 rounded-lg text-sm ${view === 'semana' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400'}`}>Semana</button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentDate(addDays(currentDate, view === 'semana' ? -7 : -1))} className="p-2 bg-white/10 rounded-lg"><ChevronLeft size={20} /></button>
        <span className="text-white font-medium">
          {view === 'semana' ? `${format(days[0], 'dd/MM')} - ${format(days[6], 'dd/MM/yyyy')}` : format(currentDate, "dd 'de' MMMM", { locale: ptBR })}
        </span>
        <button onClick={() => setCurrentDate(addDays(currentDate, view === 'semana' ? 7 : 1))} className="p-2 bg-white/10 rounded-lg"><ChevronRight size={20} /></button>
      </div>

      {/* Table Grid */}
      <div className="bg-[#121021] rounded-2xl overflow-hidden">
        {/* Header row */}
        <div className="grid border-b border-white/10" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
          <div className="p-2 text-xs text-gray-500 text-center">Hora</div>
          {days.map((day, i) => {
            const dayOfWeek = getDay(day)
            const wh = workingHours.find(w => w.day_of_week === dayOfWeek)
            return (
              <div key={i} className={`p-2 text-center border-r border-white/5 ${isToday(day) ? 'bg-emerald-500/10' : ''}`}>
                <p className={`text-xs font-medium ${isToday(day) ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {format(day, 'EEE', { locale: ptBR })}
                </p>
                <p className={`text-lg font-bold ${isToday(day) ? 'text-emerald-400' : 'text-white'}`}>
                  {format(day, 'dd')}
                </p>
                {wh && <p className="text-[10px] text-gray-500">{wh.is_active ? `${wh.start_time}-${wh.end_time}` : 'Fechado'}</p>}
              </div>
            )
          })}
        </div>

        {/* Grid body */}
        <div className="relative overflow-y-auto" style={{ maxHeight: '70vh' }}>
          <div className="grid" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
            {/* Hour labels */}
            <div>
              {hours.map(h => (
                <div key={h} className="text-[10px] text-gray-500 text-right pr-2 border-t border-white/5" style={{ height: HOUR_HEIGHT, lineHeight: `${HOUR_HEIGHT}px` }}>
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day, dayIndex) => {
              const dateStr = getBrasiliaDateStr(day)
              const dayApts = getAppointmentsForDate(day)
              const dayOfWeek = getDay(day)
              const wh = workingHours.find(w => w.day_of_week === dayOfWeek)
              
              return (
                <div key={dayIndex} className="relative border-r border-white/5" style={{ height: (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT }}>
                  {/* Hour lines */}
                  {hours.map(h => (
                    <div key={h} className="absolute w-full border-t border-white/5" style={{ top: (h - START_HOUR) * HOUR_HEIGHT }} />
                  ))}

                  {/* Half-hour clickable slots */}
                  {wh?.is_active && hours.map(h => [0, 30].map(min => {
                    const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
                    const isBlocked = blockedSlots.some(b => b.date === dateStr && b.start_time === timeStr)
                    const apt = dayApts.find(a => getBrasiliaTimeStr(a.start_time) === timeStr)
                    
                    return (
                      <div
                        key={`${h}:${min}`}
                        className={`absolute inset-x-0 cursor-pointer transition-colors ${
                          isBlocked ? 'bg-red-500/10 hover:bg-red-500/20' :
                          apt ? '' : 'hover:bg-emerald-500/10'
                        }`}
                        style={{
                          top: ((h - START_HOUR) * 60 + min) / 60 * HOUR_HEIGHT,
                          height: HOUR_HEIGHT / 2
                        }}
                        onClick={() => handleSlotClick(day, h, min)}
                      />
                    )
                  }))}

                  {/* Blocked slots overlay */}
                  {blockedSlots.filter(b => b.date === dateStr).map(b => {
                    const startMin = timeToMinutes(b.start_time)
                    const endMin = timeToMinutes(b.end_time)
                    const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT
                    const height = ((endMin - startMin) / 60) * HOUR_HEIGHT
                    return (
                      <div
                        key={b.id}
                        className="absolute inset-x-1 bg-red-500/20 border border-red-500/30 rounded flex items-center justify-center z-10"
                        style={{ top, height }}
                        onClick={() => toggleBlockSlot(day, b.start_time)}
                      >
                        <Ban size={14} className="text-red-400" />
                      </div>
                    )
                  })}

                  {/* Appointments */}
                  {dayApts.map(apt => {
                    const startTime = getBrasiliaTimeStr(apt.start_time)
                    const endTime = getBrasiliaTimeStr(apt.end_time)
                    const startMin = timeToMinutes(startTime)
                    const endMin = timeToMinutes(endTime)
                    const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT
                    const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 28)
                    
                    return (
                      <div
                        key={apt.id}
                        className={`absolute inset-x-1 rounded-lg p-1.5 cursor-pointer overflow-hidden text-xs z-20 ${
                          apt.status === 'finalizado' ? 'bg-gray-500/30 border border-gray-500/30' :
                          apt.status === 'agendado' ? 'bg-emerald-500/20 border border-emerald-500/30' :
                          'bg-yellow-500/20 border border-yellow-500/30'
                        }`}
                        style={{ top, height }}
                        onClick={() => { setSelectedApt(apt); setIsCheckoutOpen(true) }}
                      >
                        <p className="font-medium text-white truncate">{apt.customers?.name}</p>
                        <p className="text-[10px] text-gray-300 truncate">{apt.services?.name}</p>
                        <p className="text-[10px] text-gray-400">{startTime}-{endTime}</p>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121021] rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Novo Agendamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Cliente</label>
                <select value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500">
                  <option value="">Selecione...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Serviço</label>
                <select value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500">
                  <option value="">Selecione...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Data</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Hora</label>
                  <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500" />
                </div>
              </div>
            </div>
            <button onClick={handleCreate} disabled={saving} className="w-full mt-4 p-4 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} Agendar
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && selectedApt && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-[#121021] rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Agendamento</h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center"><User size={16} className="text-emerald-400" /></div>
                <div>
                  <p className="text-sm font-medium text-white">{selectedApt.customers?.name}</p>
                  <p className="text-xs text-gray-400">{selectedApt.services?.name} • {getBrasiliaTimeStr(selectedApt.start_time)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { handleCancel(selectedApt); setIsCheckoutOpen(false) }} className="flex-1 p-3 bg-red-500/20 text-red-400 rounded-xl font-medium text-sm flex items-center justify-center gap-2"><X size={16} /> Cancelar</button>
              </div>
              {selectedApt.status === 'agendado' && (
                <>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Finalizar atendimento</p>
                    <p className="text-emerald-400 font-bold text-lg">R$ {selectedApt.services?.price.toFixed(2).replace('.', ',')}</p>
                    <div className="mt-3">
                      <label className="text-xs text-gray-400 mb-1 block">Gorjeta (opcional)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                        <input type="number" value={tipAmount} onChange={e => setTipAmount(e.target.value)} placeholder="0,00" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-emerald-500" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-xs text-gray-400 mb-1 block">Pagamento</label>
                      <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500">
                        <option value="dinheiro">Dinheiro</option>
                        <option value="pix">PIX</option>
                        <option value="cartao">Cartão</option>
                      </select>
                    </div>
                    <div className="pt-3 mt-3 border-t border-white/10 flex justify-between items-center">
                      <span className="text-gray-400">Total</span>
                      <span className="text-emerald-400 font-bold text-xl">R$ {((selectedApt.services?.price || 0) + (parseFloat(tipAmount) || 0)).toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                  <button onClick={handleCheckout} disabled={saving} className="w-full p-4 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />} Finalizar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => { setFormData({ customerId: '', serviceId: '', date: getBrasiliaDateStr(new Date()), time: '' }); setIsModalOpen(true) }} className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg hover:brightness-110 transition-all">
        <Plus size={24} className="text-white" />
      </button>

      {loading && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><Loader2 size={32} className="animate-spin text-emerald-400" /></div>}
    </div>
  )
}
