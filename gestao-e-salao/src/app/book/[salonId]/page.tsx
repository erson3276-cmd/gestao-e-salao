'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, addDays, startOfToday, isSameDay, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronRight, ChevronLeft, CheckCircle2, User, MapPin, Clock, MessageCircle, ArrowLeft } from 'lucide-react'

interface Salon {
  id: string
  name: string
  image_url: string | null
  address: string | null
  whatsapp_number: string | null
}

interface Service {
  id: string
  name: string
  category: string
  price: number
  duration_minutes: number
}

interface WorkingHour {
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const salonId = params.salonId as string

  const [salon, setSalon] = useState<Salon | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([])
  const [loading, setLoading] = useState(true)

  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState(addDays(startOfToday(), 1))
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  const dateList = eachDayOfInterval({
    start: startOfToday(),
    end: addDays(startOfToday(), 14)
  })

  const categories = ['Todos', ...Array.from(new Set(services.map(s => s.category)))]
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  useEffect(() => {
    if (!salonId) return
    loadData()
  }, [salonId])

  async function loadData() {
    try {
      const [salonRes, servicesRes, whRes] = await Promise.all([
        fetch(`/api/public/salon/${salonId}`),
        fetch(`/api/public/services/${salonId}`),
        fetch(`/api/public/working-hours/${salonId}`)
      ])

      const salonData = await salonRes.json()
      const servicesData = await servicesRes.json()
      const whData = await whRes.json()

      if (salonData.salon) setSalon(salonData.salon)
      if (servicesData.services) setServices(servicesData.services)
      if (whData.workingHours) setWorkingHours(whData.workingHours)
    } catch (e) {
      console.error('Error loading data:', e)
    } finally {
      setLoading(false)
    }
  }

  function getDayWorkingHours(dayOfWeek: number) {
    return workingHours.find(wh => wh.day_of_week === dayOfWeek)
  }

  function generateTimeSlots(dayOfWeek: number) {
    const wh = getDayWorkingHours(dayOfWeek)
    if (!wh || !wh.is_active) return []

    const [startH, startM] = wh.start_time.split(':').map(Number)
    const [endH, endM] = wh.end_time.split(':').map(Number)
    const slots: string[] = []

    let current = startH * 60 + startM
    const end = endH * 60 + endM

    while (current < end) {
      const h = Math.floor(current / 60)
      const m = current % 60
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      current += 30
    }

    return slots
  }

  async function handleBooking() {
    if (!name || !whatsapp || !selectedService || !selectedTime || !salon) {
      alert('Preencha todos os campos')
      return
    }

    setBookingLoading(true)

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const [timeH, timeM] = selectedTime.split(':').map(Number)
      
      // Create date in Brasilia timezone
      const startDateTime = new Date(`${dateStr}T${String(timeH).padStart(2, '0')}:${String(timeM).padStart(2, '0')}:00-03:00`)
      const endDateTime = new Date(startDateTime.getTime() + selectedService.duration_minutes * 60000)

      const res = await fetch('/api/public/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId: salon.id,
          name,
          whatsapp,
          serviceId: selectedService.id,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString()
        })
      })

      const data = await res.json()

      if (data.success) {
        setStep(5)
      } else {
        alert(data.error || 'Erro ao agendar')
      }
    } catch {
      alert('Erro de conexão')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-[#5E41FF]/30 border-t-[#5E41FF] rounded-full animate-spin" />
      </main>
    )
  }

  if (!salon) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-black text-white mb-4">Salão não encontrado</h1>
          <button onClick={() => router.push('/')} className="px-6 py-3 bg-[#5E41FF] text-white rounded-xl text-sm font-bold">
            Voltar ao início
          </button>
        </div>
      </main>
    )
  }

  if (step === 5) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
        <h2 className="text-xl font-black italic uppercase mb-3">Agendamento Confirmado!</h2>
        <p className="text-gray-400 text-sm mb-2">Você receberá uma confirmação no WhatsApp.</p>
        <p className="text-gray-500 text-xs mb-6">
          {selectedService?.name} • {format(selectedDate, 'dd/MM/yyyy')} às {selectedTime}
        </p>
        <button
          onClick={() => { setStep(1); setName(''); setWhatsapp(''); setSelectedService(null); setSelectedTime(null); }}
          className="px-6 py-3 bg-[#121021] border border-white/10 rounded-xl text-[#5E41FF] font-bold text-sm"
        >
          Novo agendamento
        </button>
      </main>
    )
  }

  const dayWh = getDayWorkingHours(selectedDate.getDay())
  const isDayClosed = !dayWh || !dayWh.is_active
  const timeSlots = isDayClosed ? [] : generateTimeSlots(selectedDate.getDay())

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] font-sans pb-8">
      {/* Header */}
      <header className="relative w-full px-4 pt-6 pb-8 text-center bg-gradient-to-b from-[#121021] to-[#0A0A0A] border-b border-white/5">
        <div className="w-16 h-16 mx-auto bg-[#121021] border border-[#5E41FF]/30 rounded-2xl flex items-center justify-center mb-3 overflow-hidden shadow-xl shadow-[#5E41FF]/10">
          {salon.image_url ? (
            <img src={salon.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-[#5E41FF]" />
          )}
        </div>
        <h1 className="text-xl font-black italic uppercase">{salon.name}</h1>
        <p className="text-[#5E41FF] text-[10px] font-bold uppercase tracking-wider mt-1">Agendamento Online</p>
        {salon.address && (
          <div className="flex items-center justify-center gap-1 mt-2 text-gray-500 text-xs">
            <MapPin size={12} /> {salon.address}
          </div>
        )}
      </header>

      <div className="px-4 mt-6 max-w-lg mx-auto">
        {/* Step 1: Services */}
        {step === 1 && (
          <div>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5E41FF] text-white flex items-center justify-center text-xs font-black">1</span>
              Escolha o Serviço
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-4">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-xs whitespace-nowrap font-bold transition-all ${selectedCategory === cat ? 'bg-[#5E41FF] text-white' : 'bg-[#121021] text-gray-500 border border-white/5'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {services.filter(s => selectedCategory === 'Todos' || s.category === selectedCategory).map((service) => (
                <div key={service.id} onClick={() => { setSelectedService(service); setStep(2); }} className="p-4 bg-[#121021] border border-white/5 rounded-2xl flex justify-between items-center cursor-pointer hover:border-[#5E41FF]/30 transition-all">
                  <div>
                    <h3 className="text-sm font-bold">{service.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1"><Clock size={10} /> {service.duration_minutes} min</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#5E41FF]">R$ {service.price}</p>
                    <ChevronRight className="text-gray-600 w-4 h-4 ml-auto mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-500 mb-4 text-sm hover:text-white transition-colors">
              <ArrowLeft size={16} /> Voltar
            </button>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5E41FF] text-white flex items-center justify-center text-xs font-black">2</span>
              Escolha a Data
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {dateList.map(date => {
                const wh = getDayWorkingHours(date.getDay())
                const isClosed = !wh || !wh.is_active
                return (
                  <button
                    key={date.toString()}
                    onClick={() => { if (!isClosed) { setSelectedDate(date); setStep(3); } }}
                    disabled={isClosed}
                    className={`p-3 rounded-xl text-center transition-all ${
                      isSameDay(date, selectedDate) ? 'bg-[#5E41FF] text-white' :
                      isClosed ? 'bg-[#121021]/30 text-gray-700 cursor-not-allowed' :
                      'bg-[#121021] text-gray-400 hover:bg-[#121021]/80'
                    }`}
                  >
                    <p className="text-[9px] uppercase font-bold">{format(date, 'EEE', { locale: ptBR })}</p>
                    <p className="text-lg font-black">{format(date, 'dd')}</p>
                    {isClosed && <p className="text-[8px] text-red-500">Fechado</p>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 3: Time */}
        {step === 3 && (
          <div>
            <button onClick={() => setStep(2)} className="flex items-center gap-2 text-gray-500 mb-4 text-sm hover:text-white transition-colors">
              <ArrowLeft size={16} /> Voltar
            </button>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5E41FF] text-white flex items-center justify-center text-xs font-black">3</span>
              Escolha o Horário
            </h2>
            <p className="text-xs text-gray-500 mb-4">{format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
            {timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(time => (
                  <button key={time} onClick={() => { setSelectedTime(time); setStep(4); }} className={`p-3 rounded-xl text-sm font-bold transition-all ${selectedTime === time ? 'bg-[#5E41FF] text-white' : 'bg-[#121021] text-gray-400 hover:bg-[#121021]/80'}`}>
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <Clock size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm font-bold">Nenhum horário disponível</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Info */}
        {step === 4 && (
          <div>
            <button onClick={() => setStep(3)} className="flex items-center gap-2 text-gray-500 mb-4 text-sm hover:text-white transition-colors">
              <ArrowLeft size={16} /> Voltar
            </button>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5E41FF] text-white flex items-center justify-center text-xs font-black">4</span>
              Seus Dados
            </h2>

            <div className="space-y-3 mb-6">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" className="w-full p-4 bg-[#121021] border border-white/5 rounded-xl text-sm outline-none focus:border-[#5E41FF]/50" />
              <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp (com DDD)" className="w-full p-4 bg-[#121021] border border-white/5 rounded-xl text-sm outline-none focus:border-[#5E41FF]/50" />
            </div>

            <div className="p-4 bg-[#121021] border border-white/5 rounded-xl mb-6">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Resumo</p>
              <p className="text-sm font-bold">{selectedService?.name}</p>
              <p className="text-xs text-gray-500 mt-1">{format(selectedDate, 'dd/MM/yyyy')} às {selectedTime} • R$ {selectedService?.price}</p>
            </div>

            <button onClick={handleBooking} disabled={bookingLoading || !name || !whatsapp} className="w-full py-4 bg-[#5E41FF] text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 border-b-4 border-[#3D28B8]">
              {bookingLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                <>
                  Confirmar Agendamento
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  )
}
