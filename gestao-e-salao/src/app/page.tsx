'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Star, 
  ChevronDown, 
  BarChart3, 
  Smartphone, 
  AlertCircle,
  Bell,
  Lock,
  Sparkles,
  Rocket,
  Heart,
  Target,
  Flame,
  Crown,
  Play,
  Quote
} from 'lucide-react'

const painPoints = [
  { icon: Clock, title: "3 horas perdidas por semana", desc: "Confirmando horários, respondendo mensagens e lembrando clientes." },
  { icon: AlertCircle, title: "Cadeira vazia = dinheiro perdido", desc: "Cliente não aparece. Você fica esperando. E o dia que poderia ter lucrado mais?" },
  { icon: Smartphone, title: "Preso ao salão 24/7", desc: "Não consegue acompanhar nada sem estar lá. Sua vida pessoal sofre." },
  { icon: DollarSign, title: "Você 'acha' que lucra", desc: "Mas não tem certeza. As contas no fim do mês são sempre uma surpresa." },
  { icon: MessageSquare, title: "WhatsApp fora de controle", desc: "30 mensagens não respondidas. Histórico perdido. Cliente que sumiu." },
  { icon: Target, title: "Voando às cegas", desc: "Qual serviço vende mais? Qual horário tem mais demanda? Sem dados." },
]

const features = [
  { 
    icon: Calendar, 
    title: "Agenda Inteligente", 
    desc: "Clientes agendam sozinhos. Você só foca em atender.",
    color: "#8B5CF6"
  },
  { 
    icon: Bell, 
    title: "Lembretes Automáticos", 
    desc: "Alertas 24h antes do agendamento. Clientes confirmam, agenda sempre cheia.",
    color: "#F59E0B"
  },
  { 
    icon: DollarSign, 
    title: "Financeiro Completo", 
    desc: "Entrada, saída, comissão. Tudo registrado. Lucro real.",
    color: "#EF4444"
  },
  { 
    icon: Users, 
    title: "Clientes Fidelizados", 
    desc: "Histórico, preferências, aniversários. Clientes únicos.",
    color: "#EC4899"
  },
  { 
    icon: BarChart3, 
    title: "Relatórios Visuais", 
    desc: "Gráficos simples. Veja o que funciona e cresça.",
    color: "#3B82F6"
  },
]

const testimonials = [
  { 
    name: "Roberto Santos", 
    salon: "Barbearia Classic - São Paulo",
    text: "Minha vida mudou completamente. Antes eu vivia no WhatsApp confirmando horários. Agora meus clientes agendam sozinhos e eu foco no que amo: barbear com qualidade.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    stars: 5,
    result: "+40% em agendamentos"
  },
  { 
    name: "Carla Beatriz", 
    salon: "Espaço Beleza Pura - Rio de Janeiro", 
    text: "O controle financeiro me surpreendeu. Descobri que estava perdendo dinheiro em produtos e horas vagas. Em 2 meses já recuperei o investimento no sistema.",
    photo: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&h=200&fit=crop&crop=face",
    stars: 5,
    result: "R$ 2.800/mês economizado"
  },
  { 
    name: "Marcos Oliveira", 
    salon: "Studio Hair Pro - Belo Horizonte", 
    text: "Tinha 3 profissionais e era uma bagunça. Agora cada um vê sua agenda, suas comissões. Time feliz, clientes felizes.",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    stars: 5,
    result: "80% menos ligações"
  },
]

const stats = [
  { value: "98%", label: "Satisfação dos usuários" },
  { value: "3 horas", label: "Economizadas por semana" },
  { value: "R$ 49", label: "Por mês apenas" },
]

const faqs = [
  { q: "Preciso instalar algo?", a: "Não. 100% online, navegador ou celular. Sem downloads, sem atualizações." },
  { q: "Preciso pagar no cartão?", a: "Não! Aceitamos PIX, cartão de crédito ou boleto bancário." },
  { q: "Funciona para barbearia?", a: "Sim! Serve para qualquer segmento: beleza, barba, estética, unhas." },
  { q: "E se eu quiser cancelar?", a: "Sem multa. Cancele quando quiser, 1 clique." },
]

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [countersVisible, setCountersVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCountersVisible(true) },
      { threshold: 0.3 }
    )
    const el = document.getElementById('stats-section')
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <main className="min-h-screen bg-[#030014] text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#030014]/90 backdrop-blur-xl border-b border-white/5' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-lg opacity-50" />
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tighter">Gestão</span>
              <span className="text-base sm:text-lg font-black tracking-tighter bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">E</span>
              <span className="text-base sm:text-lg font-black tracking-tighter">Salão</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#problema" className="text-sm text-gray-400 hover:text-white transition-colors">Problema</a>
            <a href="#solucao" className="text-sm text-gray-400 hover:text-white transition-colors">Solução</a>
            <a href="#resultados" className="text-sm text-gray-400 hover:text-white transition-colors">Resultados</a>
            <a href="#preco" className="text-sm text-gray-400 hover:text-white transition-colors">Preço</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs sm:text-sm font-bold text-gray-400 hover:text-white transition-colors hidden sm:block">Entrar</Link>
            <Link href="/register" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_100%] text-white rounded-xl text-xs sm:text-sm font-bold hover:shadow-lg hover:shadow-purple-500/30 hover:bg-[position:100%_0] transition-all duration-300">
              Assinar Agora
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full mb-6 sm:mb-8">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs sm:text-sm text-gray-300 font-medium">Simplifique a gestão do seu salão</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Seu salão merece
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                funcionar sozinho
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
              Deixe de perder <strong className="text-white">3 horas por semana</strong> confirmando horários. 
              Deixe o sistema trabalhar por você.
            </p>
            
            <p className="text-lg sm:text-xl text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text font-bold mb-8 sm:mb-12">
              +40% mais agendamentos • 80% menos ligações • 100% de controle
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
              <Link href="/register" className="w-full sm:w-auto group px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%] text-white rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-purple-500/40 hover:bg-[position:100%_0] transition-all duration-500">
                Assinar Agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#solucao" className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 hover:bg-white/10 transition-all backdrop-blur-sm">
                <Play className="w-5 h-5" />
                Ver como funciona
              </a>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600">R$ 49/mês • PIX, cartão ou boleto • Pagamento único</p>
          </div>
          
          {/* Hero Image/Preview */}
          <div className="mt-16 sm:mt-24 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent z-10" />
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-sm">
              <img 
                src="/print-agenda.png" 
                alt="Agenda do Gestão E Salão" 
                className="w-full aspect-[16/9] sm:aspect-[21/9] object-cover"
              />
            </div>
            
            {/* Floating elements */}
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 px-3 sm:px-4 py-2 sm:py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl sm:rounded-2xl backdrop-blur-md animate-bounce" style={{ animationDuration: '3s' }}>
              <p className="text-emerald-400 text-xs sm:text-sm font-bold">+5 agendamentos hoje</p>
            </div>
            <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 px-3 sm:px-4 py-2 sm:py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl sm:rounded-2xl backdrop-blur-md animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
              <p className="text-purple-400 text-xs sm:text-sm font-bold">R$ 1.847,00 hoje</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="relative py-16 sm:py-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <p className="text-2xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section id="problema" className="relative py-16 sm:py-24 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">
              Você se identifica?
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4">
              <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                O problema que ninguém
              </span>
              <br />
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                fala sobre salões
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">Cada um desses problemas custa dinheiro e tempo. Todos os dias.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {painPoints.map((pain, i) => (
              <div key={i} className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/10 hover:border-red-500/30 transition-all hover:scale-[1.02]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-all">
                    <pain.icon className="w-6 h-6 sm:w-7 sm:h-7 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-red-400 mb-2">{pain.title}</h3>
                    <p className="text-sm sm:text-base text-gray-500">{pain.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12 sm:mt-16">
            <p className="text-xl sm:text-2xl text-white font-bold mb-4">
              E se existisse uma forma de resolver todos de uma vez?
            </p>
            <a href="#solucao" className="inline-flex items-center gap-2 text-purple-400 font-bold hover:text-purple-300 transition-colors">
              Descobrir a solução <ChevronDown className="w-5 h-5 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="solucao" className="relative py-16 sm:py-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">
              A solução completa
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4">
              <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Tudo que você precisa,
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                nada que não precisa
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <div key={i} className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-purple-500/30 transition-all hover:scale-[1.02] hover:bg-gradient-to-br hover:from-white/[0.08]">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${feature.color}20`, border: `1px solid ${feature.color}40` }}>
                    <feature.icon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: feature.color }} />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Relatório */}
      <section className="relative py-16 sm:py-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">
              Relatórios detalhados
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Veja o que funciona
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                e tome decisões assertivas
              </span>
            </h2>
          </div>
          
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10">
            <img 
              src="/print-relatorio.png" 
              alt="Relatórios do Gestão E Salão" 
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Mais imagens */}
      <section className="relative py-16 sm:py-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10">
              <img src="/print-1.png" alt="Gestão E Salão" className="w-full" />
            </div>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10">
              <img src="/print-2.png" alt="Gestão E Salão" className="w-full" />
            </div>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10">
              <img src="/print-3.png" alt="Gestão E Salão" className="w-full" />
            </div>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10">
              <img src="/print-4.png" alt="Gestão E Salão" className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section id="resultados" className="relative py-16 sm:py-24 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">
              Resultados reais
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4">
              <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Donas de salão
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                que já transformaram seus negócios
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/5 hover:border-purple-500/30 transition-all">
                {/* Quote icon */}
                <Quote className="absolute top-4 right-4 w-8 h-8 text-purple-500/20" />
                
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({length: t.stars}).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                
                {/* Result badge */}
                <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold mb-4">
                  {t.result}
                </div>
                
                {/* Photo and info */}
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={t.photo} 
                    alt={t.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-purple-500/30"
                  />
                  <div>
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{t.salon}</p>
                  </div>
                </div>
                
                {/* Testimonial text */}
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="preco" className="relative py-16 sm:py-24 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">
              Preço justo
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4">
              <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Menos que um
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                corte por semana
              </span>
            </h2>
          </div>
          
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl opacity-50 blur-sm" />
            <div className="relative bg-[#0a0a14] rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-white/10">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black mb-2">Plano Completo</h3>
                  <p className="text-gray-400">Tudo que você precisa para gerenciar seu salão</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">R$ 49</span>
                  <span className="text-xl text-gray-400 font-bold">,90</span>
                  <span className="text-gray-500 text-sm ml-2">/mês</span>
                </div>
              </div>
              
              {/* Trial badge */}
              <div className="mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Plano profissional completo</p>
                    <p className="text-sm text-gray-400">Tudo que você precisa para gestão do seu salão</p>
                  </div>
                </div>
              </div>
              
              {/* Features list */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
                {[
                  'Agenda inteligente com agendamento online',
                  'WhatsApp integrado - confirmações automáticas',
                  'Controle financeiro completo',
                  'Cadastro ilimitado de clientes e serviços',
                  'Relatórios e métricas detalhadas',
                  'Gestão de comissões da equipe',
                  'Lembretes automáticos por WhatsApp',
                  'Acesso de qualquer dispositivo',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              
              {/* CTA */}
              <Link href="/register" className="w-full py-4 sm:py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%] text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-purple-500/40 hover:bg-[position:100%_0] transition-all duration-500">
                Assinar Agora
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <p className="text-center text-xs sm:text-sm text-gray-500 mt-4">R$ 49/mês. PIX, cartão ou boleto.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-16 sm:py-24 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Dúvidas
              </span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {' '}frequentes
              </span>
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/20 transition-all">
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-sm sm:text-base text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-16 sm:py-24 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-8 sm:p-12 md:p-16 text-center">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-cyan-500/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,purple-500/30,transparent_50%)]" />
            
            <div className="relative z-10">
              <Rocket className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Cada dia sem o sistema
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  é dinheiro que você deixa de ganhar
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto mb-8">
                Seus clientes estão prontos para agendar. Seu concorrente já automatizou. E você?
              </p>
              <Link href="/register" className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%] text-white rounded-2xl font-black text-sm sm:text-base hover:shadow-2xl hover:shadow-purple-500/40 hover:bg-[position:100%_0] transition-all duration-500">
                Assinar Agora
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500 mt-4">Pronto para usar em 2 minutos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 sm:py-12 z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="font-bold tracking-tight">Gestão<span className="text-purple-400">E</span>Salão</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">© 2026 Gestão E Salão. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
