'use client'

import { useEffect, useState } from 'react'
import { Calendar as CalendarIcon, Clock, ChevronRight, Sparkles, CheckCircle2, ChevronLeft, User, MapPin, Star, ShieldAlert, MessageCircle } from 'lucide-react'
import { format, addDays, startOfToday, isSameDay, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function BookingPage() {
  const [services, setServices] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(addDays(startOfToday(), 1))
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const dateList = eachDayOfInterval({
    start: startOfToday(),
    end: addDays(startOfToday(), 14)
  })

  const categories = ['Todos', ...Array.from(new Set(services.map((s: any) => s.category)))]

  const hours = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00']

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [p, s] = await Promise.all([
        fetch('/api/services').then(r => r.json()),
        fetch('/api/services?public=true').then(r => r.json())
      ])
      if (s && s.length > 0) setServices(s)
      if (p && p.profile) setProfile(p.profile)
    } catch (err) {
      console.error(err)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!name || !whatsapp || !selectedService || !selectedTime) {
      alert('Preencha todos os campos')
      return
    }
    setLoading(true)

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          whatsapp,
          service_id: selectedService.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime
        })
      })

      if (res.ok) {
        setStep(5)
      } else {
        const err = await res.json()
        alert(err.error || 'Erro ao agendar')
      }
    } catch (err) {
      alert('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleContact = () => {
    window.open('https://wa.me/5521984559663?text=Olá!', '_blank')
  }

  if (initialLoading) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white text-sm">Carregando...</div>
  }

  if (step === 5) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 text-center">
        <CheckCircle2 className="w-16 h-16 text-[#CBA64B] mb-4" />
        <h2 className="text-xl font-black italic uppercase mb-3">Pedido Enviado!</h2>
        <p className="text-gray-400 text-sm mb-6">Verifique seu WhatsApp para confirmação.</p>
        <button onClick={() => { setStep(1); setName(''); setWhatsapp(''); setSelectedService(null); setSelectedTime(null); }} className="px-6 py-2 bg-[#141414] border border-white/10 rounded-lg text-[#CBA64B] font-bold text-sm">Novo agendamento</button>
      </main>
    )
  }

  if (step === 6) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 text-center">
        <MessageCircle className="w-16 h-16 text-[#CBA64B] mb-4" />
        <h2 className="text-lg font-black uppercase mb-2">Agendamento Restrito</h2>
        <p className="text-gray-400 text-sm mb-6">Seu número não está cadastrado. Entre em contato.</p>
        <button onClick={handleContact} className="w-full max-w-[250px] py-3 bg-[#CBA64B] text-black font-bold rounded-lg text-sm mb-3">Falar com Suanne</button>
        <button onClick={() => setStep(1)} className="text-gray-500 text-xs">Tentar outro número</button>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] font-sans pb-8">
      <header className="relative w-full px-3 pt-6 text-center bg-gradient-to-b from-[#111] to-[#0A0A0A]">
        <div className="w-12 h-12 mx-auto bg-[#18181a] border border-[#CBA64B]/30 rounded-full flex items-center justify-center mb-2 overflow-hidden">
          {profile?.image_url ? (
            <img src={profile.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-[#CBA64B]" />
          )}
        </div>
        <h1 className="text-base font-semibold">{profile?.name || 'Gestão E Salão'}</h1>
        <p className="text-[#CBA64B] text-[10px] font-bold uppercase tracking-wider">{profile?.professional_name || 'Agendamento Online'}</p>
        {profile?.address && <p className="text-gray-500 text-[10px] mt-1">{profile.address}</p>}
      </header>

      <div className="px-3 mt-3">
        {step === 1 && (
          <div>
            <h2 className="text-sm font-bold mb-3">Escolha o Serviço</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat: any) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${selectedCategory === cat ? 'bg-[#CBA64B] text-black' : 'bg-[#18181a] text-gray-400'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="space-y-2 mt-2">
              {services.filter((s: any) => selectedCategory === 'Todos' || s.category === selectedCategory).map((service: any) => (
                <div key={service.id} onClick={() => { setSelectedService(service); setStep(2); }} className="p-3 bg-[#141414] rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium">{service.name}</h3>
                    <p className="text-[10px] text-gray-500">{service.duration_minutes} min • R$ {service.price}</p>
                  </div>
                  <ChevronRight className="text-gray-500 w-4 h-4" />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-400 mb-3 text-sm"><ChevronLeft size={16} /> Voltar</button>
            <h2 className="text-sm font-bold mb-3">Escolha a Data</h2>
            <div className="grid grid-cols-4 gap-1.5">
              {dateList.map(date => (
                <button key={date.toString()} onClick={() => { setSelectedDate(date); setStep(3); }} className={`p-2 rounded-lg text-center ${isSameDay(date, selectedDate) ? 'bg-[#CBA64B] text-black' : 'bg-[#141414]'}`}>
                  <p className="text-[9px] text-gray-400">{format(date, 'EEE', { locale: ptBR })}</p>
                  <p className="text-sm font-bold">{format(date, 'dd')}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <button onClick={() => setStep(2)} className="flex items-center gap-2 text-gray-400 mb-3 text-sm"><ChevronLeft size={16} /> Voltar</button>
            <h2 className="text-sm font-bold mb-3">Escolha o Horário</h2>
            <div className="grid grid-cols-3 gap-1.5">
              {hours.map(time => (
                <button key={time} onClick={() => { setSelectedTime(time); setStep(4); }} className={`p-2 rounded-lg text-xs ${selectedTime === time ? 'bg-[#CBA64B] text-black' : 'bg-[#141414]'}`}>{time}</button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <button onClick={() => setStep(3)} className="flex items-center gap-2 text-gray-400 mb-3 text-sm"><ChevronLeft size={16} /> Voltar</button>
            <h2 className="text-sm font-bold mb-3">Seus Dados</h2>
            
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" className="w-full p-2.5 bg-[#141414] rounded-lg text-sm mb-2" />
            <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp" className="w-full p-2.5 bg-[#141414] rounded-lg text-sm mb-3" />
            
            <div className="p-2.5 bg-[#141414] rounded-lg mb-3">
              <p className="text-[10px] text-gray-400">Resumo</p>
              <p className="text-sm font-medium">{selectedService?.name}</p>
              <p className="text-[10px] text-gray-500">{format(selectedDate, 'dd/MM/yyyy')} às {selectedTime}</p>
            </div>

            <button onClick={handleBooking} disabled={loading} className="w-full py-2.5 bg-[#CBA64B] text-black font-bold rounded-lg text-sm disabled:opacity-50">
              {loading ? 'Enviando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
