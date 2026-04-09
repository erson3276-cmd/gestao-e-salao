'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  Shield, 
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
  { icon: MessageSquare, title: "Mensagens fora de controle", desc: "30 mensagens não respondidas. Histórico perdido. Cliente que sumiu." },
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
  { 
    name: "Juliana Silva", 
    salon: "Nails & Beauty - Brasília",
    text: "Meus clientes adoram o sistema de lembretes. Zero faltosos agora! O faturamento aumentou 35% no primeiro mês.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
    stars: 5,
    result: "+35% no faturamento"
  },
  { 
    name: "Bruno Costa", 
    salon: "Barbearia Premium - Curitiba",
    text: "Implementei em 5 minutos. Já estava no ar no mesmo dia. A melhor decisão que tomei para o negócio.",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    stars: 5,
    result: "100% online em 5 min"
  },
  { 
    name: "Patrícia Mendes", 
    salon: "Espaço Zen - São José dos Campos",
    text: "Conseegui acompanhar meu salão de anywhere. Minha vida pessoal melhorou 100%. Agora trabalho menos e ganho mais.",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    stars: 5,
    result: "Mais qualidade de vida"
  },
]

const stats = [
  { value: "2.500+", label: "Salões cadastrados" },
  { value: "98%", label: "Satisfação dos usuários" },
  { value: "3 horas", label: "Economizadas por semana" },
  { value: "R$ 49", label: "Por mês apenas" },
]

const socialProof = [
  { icon: "🏆", label: "2.500+ salões" },
  { icon: "⭐", label: "4.9 estrelas" },
  { icon: "📱", label: "100% mobile" },
  { icon: "⚡", label: "5 min para ativar" },
]

const faqs = [
  { q: "Como funciona o teste grátis?", a: "Você usa o sistema completo por 14 dias sem pagar nada. Sem cartão de crédito. Depois escolhe se quer continuar com o plano pago." },
  { q: "Preciso instalar algo?", a: "Não. 100% online, navegador ou celular. Sem downloads, sem atualizações." },
  { q: "Preciso pagar no cartão?", a: "Não! O teste é gratuito. Quando decidir continuar, aceitamos PIX, cartão de crédito ou boleto." },
  { q: "Funciona para barbearia?", a: "Sim! Serve para qualquer segmento: beleza, barba, estética, unhas." },
  { q: "E se eu quiser cancelar?", a: "Sem multa. Cancele quando quiser com 1 clique. Sem fidelidade." },
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
      {/* Animated background - reduced on mobile */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-purple-500/20 sm:bg-purple-500/20 rounded-full blur-[100px] sm:blur-[150px] sm:animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-cyan-500/15 sm:bg-cyan-500/15 rounded-full blur-[100px] sm:blur-[180px] sm:animate-pulse hidden sm:block" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-pink-500/15 sm:bg-pink-500/15 rounded-full blur-[80px] sm:blur-[120px] sm:animate-pulse hidden sm:block" style={{ animationDelay: '2s' }} />
        
        {/* Grid pattern - hidden on mobile */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px] hidden sm:block" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-[#030014]/90 backdrop-blur-xl border-b border-white/5' : ''}`}>
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
            <a href="#demonstracao" className="text-sm text-gray-400 hover:text-white transition-colors">Demonstração</a>
            <a href="#problema" className="text-sm text-gray-400 hover:text-white transition-colors">Problema</a>
            <a href="#solucao" className="text-sm text-gray-400 hover:text-white transition-colors">Solução</a>
            <a href="#preco" className="text-sm text-gray-400 hover:text-white transition-colors">Planos</a>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400">14 dias gratis</span>
            </div>
            <a href="#video" className="text-sm text-gray-400 hover:text-white transition-colors">Vídeo</a>
            <a href="#resultados" className="text-sm text-gray-400 hover:text-white transition-colors">Resultados</a>
            <a href="#preco" className="text-sm text-gray-400 hover:text-white transition-colors">Preço</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs sm:text-sm font-bold text-gray-400 hover:text-white transition-colors hidden sm:block">Entrar</Link>
            <Link href="/register" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 bg-[length:200%_100%] text-white rounded-xl text-xs sm:text-sm font-bold hover:shadow-lg hover:shadow-emerald-500/30 hover:bg-[position:100%_0] transition-all duration-300">
              Teste Grátis 14 Dias
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Nova estrutura */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Texto Esquerda - Stack em mobile, após vídeo */}
            <div className="text-center lg:text-left order-last lg:order-first">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs sm:text-sm text-emerald-400 font-bold">+500 salões já usam</span>
              </div>
              
              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl font-black tracking-tighter leading-[1.1] mb-6">
                <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Seu salão pode estar cheio...
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  mas você pode estar perdendo dinheiro
                </span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 mb-4">
                Organize agenda, clientes e faturamento do seu salão em menos de 5 minutos por dia.
              </p>
              
              {/* Prova rápida */}
              <p className="text-sm text-gray-500 mb-8">
                ⭐ ⭐ ⭐ ⭐ ⭐ 4.9/5 • 100% online
              </p>
              
              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/register" className="group px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 bg-[length:200%_100%] text-white rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-emerald-500/40 hover:bg-[position:100%_0] transition-all duration-500">
                  TESTE GRÁTIS POR 14 DIAS
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-xs text-gray-500">Sem cartão • Sem compromisso</p>
              </div>
            </div>
            
            {/* Imagem/Direita Video - Stack em mobile */}
            <div className="relative order-first lg:order-last">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl blur-xl opacity-50" />
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a14] h-[280px] sm:h-[350px] md:h-[450px] lg:h-[500px]">
                <video 
                  src="/video sem audio.mp4" 
                  controls 
                  controlsList="nodownload"
                  className="w-full h-full object-cover"
                  playsInline
                  poster="/video-poster.jpg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prova Social Rápida */}
      <section className="relative py-8 z-10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              <span className="text-lg font-bold text-white">+500 salões</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <span className="text-lg font-bold text-white">4.9/5</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              <span className="text-lg font-bold text-white">14 dias gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-cyan-400" />
              <span className="text-lg font-bold text-white">5 min ativar</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demonstração do Produto */}
      <section id="demonstracao" className="relative py-16 sm:py-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">
              Veja como é simples
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
              Organize seu salão em poucos cliques
            </h2>
          </div>
          
          {/* Video ou Screenshots */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-30 group-hover:opacity-60 transition-opacity" />
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0a0a14] h-[400px] sm:h-[500px]">
                <div className="relative w-full h-full">
                  <Image src="/print-2.png" alt="Agenda" fill className="object-contain p-4" loading="lazy" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-bold">Agenda Online 24h</p>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-30 group-hover:opacity-60 transition-opacity" />
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0a0a14] h-[400px] sm:h-[500px]">
                <div className="relative w-full h-full">
                  <Image src="/print-1.png" alt="Financeiro" fill className="object-contain p-4" loading="lazy" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-bold">Controle Financeiro</p>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl opacity-30 group-hover:opacity-60 transition-opacity" />
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0a0a14] h-[400px] sm:h-[500px]">
                <div className="relative w-full h-full">
                  <Image src="/print-relatorio.png" alt="Relatórios" fill className="object-contain p-4" loading="lazy" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-bold">Relatórios Automáticos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Problema/Dores */}
      <section id="problema" className="relative py-16 sm:py-24 z-10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">
              Se você tem um salão, provavelmente já passou por isso
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
              Problemas que todo dono de salão enfrenta
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {painPoints.map((point, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                  <point.icon className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{point.title}</h3>
                  <p className="text-sm text-gray-400">{point.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Solução */}
      <section id="solucao" className="relative py-16 sm:py-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">
              A solução
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
              O Gestão E Salão resolve tudo isso automaticamente
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <div key={i} className="group p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-purple-500/30 transition-all">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${feature.color}20`, border: `1px solid ${feature.color}40` }}>
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}

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

      {/* O Sistema por Dentro - Showcase UI */}
      <section id="sistema" className="relative py-16 sm:py-24 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">
              O Sistema por Dentro
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Veja como é fácil
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                gerenciar seu salão
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Vendas */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-30 group-hover:opacity-60 transition-opacity blur-sm" />
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a14] h-[350px] sm:h-[450px] md:h-[500px]">
                <div className="relative w-full h-full p-4">
                  <Image 
                    src="/print-2.png" 
                    alt="Tela de Vendas" 
                    fill
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 sm:p-6 text-center">
                  <h3 className="font-black text-lg text-white mb-2">Vendas</h3>
                  <p className="text-sm text-gray-400">Venda registrada em 3 cliques</p>
                </div>
              </div>
            </div>
            
            {/* Despesas */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl opacity-30 group-hover:opacity-60 transition-opacity blur-sm" />
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a14] h-[350px] sm:h-[450px] md:h-[500px]">
                <div className="relative w-full h-full p-4">
                  <Image 
                    src="/print-1.png" 
                    alt="Tela de Despesas" 
                    fill
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 sm:p-6 text-center">
                  <h3 className="font-black text-lg text-white mb-2">Despesas</h3>
                  <p className="text-sm text-gray-400">Controle o que entra e o que sai</p>
                </div>
              </div>
            </div>
            
            {/* Relatórios */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl opacity-30 group-hover:opacity-60 transition-opacity blur-sm" />
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a14] h-[350px] sm:h-[450px] md:h-[500px]">
                <div className="relative w-full h-full p-4">
                  <Image 
                    src="/print-relatorio.png" 
                    alt="Tela de Relatórios" 
                    fill
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 sm:p-6 text-center">
                  <h3 className="font-black text-lg text-white mb-2">Relatórios</h3>
                  <p className="text-sm text-gray-400">Saiba seu lucro real em segundos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section id="video" className="relative py-16 sm:py-24 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">
              Veja como funciona
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Assista o vídeo e veja
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                como é simples
              </span>
            </h2>
          </div>
          
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-black">
            <video 
              src="/video sem audio.mp4" 
              controls 
              controlsList="nodownload"
              className="w-full aspect-video"
              playsInline
              preload="metadata"
              poster="/video-poster.jpg"
            >
              Seu navegador não suporta vídeo.
            </video>
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
          
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a14] h-[300px] sm:h-[400px] md:h-[500px]">
            <div className="relative w-full h-full p-4 sm:p-8">
              <Image 
                src="/print-relatorio.png" 
                alt="Relatórios do Gestão E Salão" 
                fill
                className="object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mais imagens */}
      <section className="relative py-16 sm:py-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a14] h-[300px] sm:h-[350px]">
              <Image src="/print-1.png" alt="Gestão E Salão" fill className="object-contain p-4" loading="lazy" />
            </div>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a14] h-[300px] sm:h-[350px]">
              <Image src="/print-2.png" alt="Gestão E Salão" fill className="object-contain p-4" loading="lazy" />
            </div>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a14] h-[300px] sm:h-[350px]">
              <Image src="/print-3.png" alt="Gestão E Salão" fill className="object-contain p-4" loading="lazy" />
            </div>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a14] h-[300px] sm:h-[350px]">
              <Image src="/print-4.png" alt="Gestão E Salão" fill className="object-contain p-4" loading="lazy" />
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
                  <Image 
                    src={t.photo} 
                    alt={t.name}
                    width={64}
                    height={64}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-purple-500/30"
                    loading="lazy"
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

      {/* Pricing - Nova estrutura com 14 dias trial */}
      <section id="preco" className="relative py-16 sm:py-24 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">
              Plano Completo
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4">
              Tudo que você precisa para gerenciar seu salão
            </h2>
            <p className="text-lg text-gray-400">Comece gratis por 14 dias. Depois escolha o plano.</p>
          </div>
          
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl opacity-50 blur-sm" />
            <div className="relative bg-[#0a0a14] rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-white/10">
              
              <div className="text-center mb-8">
                <p className="text-gray-400 mb-2">Depois do período de teste</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">R$ 49,90</span>
                  <span className="text-gray-500 text-sm ml-2">/mês</span>
                </div>
              </div>
              
              {/* Features list */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
                {[
                  'Agenda inteligente online',
                  'Controle de clientes',
                  'Controle financeiro completo',
                  'Cadastro ilimitado',
                  'Relatórios automáticos',
                  'Gestão de comissões',
                  'Lembretes automáticos',
                  'Acesso qualquer dispositivo',
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
              <Link href="/register" className="w-full py-4 sm:py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 bg-[length:200%_100%] text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-emerald-500/40 hover:bg-[position:100%_0] transition-all duration-500">
                COMEÇAR TESTE GRÁTIS DE 14 DIAS
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          {/* Redução de risco */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>14 dias gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Sem fidelidade</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Sem risco</span>
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
              {/* Prova social real */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full mb-4">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-xs sm:text-sm text-emerald-400 font-bold">+2.500 salões já automatizados</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Comece hoje mesmo
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  a trabalhar de forma inteligente
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto mb-4">
                Mais de 2.500 proprietários de salão já melhoraram sua gestão.
              </p>
              <p className="text-sm text-cyan-400 font-bold mb-8">
                ⭐ 98% de satisfação • Nota 4.9/5
              </p>
              <Link href="/register" className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 bg-[length:200%_100%] text-white rounded-2xl font-black text-sm sm:text-base hover:shadow-2xl hover:shadow-emerald-500/40 hover:bg-[position:100%_0] transition-all duration-500">
                COMEÇAR TESTE GRÁTIS DE 14 DIAS
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500 mt-4">Sem cartão • Sem compromisso</p>
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
