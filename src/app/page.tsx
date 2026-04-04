import Link from 'next/link'
import { Calendar, Users, MessageSquare, DollarSign, TrendingUp, Shield, Zap, CheckCircle2, ArrowRight, Clock, Star, ChevronDown, BarChart3, Smartphone, AlertCircle, Phone, Heart, Target, ZapOff, MessageCircle, CreditCard, Bell, Lock, Repeat, Eye, Timer } from 'lucide-react'

const testimonials = [
  { name: "Carolina M.", salon: "Studio Bella", text: "Antes eu perdia 3 horários por semana. Com o Gestão E Salão, minha agenda é organizada e meus clientes adoram os lembretes automáticos.", rating: 5 },
  { name: "Rafael S.", salon: "Barbearia Old School", text: "O controle financeiro mudou meu negócio. Agora sei exatamente quanto entra e sai todo mês. Vale cada centavo.", rating: 5 },
  { name: "Juliana P.", salon: "Espaço JP", text: "O WhatsApp integrado é genial. Meus clientes chegam sabendo o horário e eu não preciso ficar ligando pra confirmar.", rating: 5 },
]

const faqs = [
  { q: "Preciso instalar algum programa?", a: "Não. Tudo funciona no navegador, do celular ou computador. Sem downloads, sem atualizações." },
  { q: "Posso testar antes de pagar?", a: "Sim! Você tem 30 dias grátis com acesso completo. Sem cartão de crédito." },
  { q: "O WhatsApp é incluso?", a: "Sim. Cada salão conecta seu próprio WhatsApp via QR Code. As confirmações e lembretes saem automaticamente." },
  { q: "E se eu quiser cancelar?", a: "Sem multa, sem burocracia. Cancele quando quiser direto no painel." },
  { q: "Funciona para barbearias também?", a: "Sim! O sistema é feito para qualquer tipo de salão: beleza, barbearia, estética, unhas, etc." },
]

const painPoints = [
  { icon: Clock, title: "3 horas perdidas por semana", desc: "Confirmando horários, respondendo 'qual horário tá livre?' e lembrando clientes." },
  { icon: AlertCircle, title: "Cadeira vazia = dinheiro perdido", desc: "Cliente não aparece. Você fica ali, esperando. E o dia que poderia ter lucrado mais?" },
  { icon: Smartphone, title: "Você vive 'preso' ao salão", desc: "Não consegue ver quem agendou sem estar lá. Sua vida pessoal sofre por causa da organização." },
  { icon: DollarSign, title: "Você 'acha' que tá lucrando", desc: "Mas não tem certeza. As contas no fim do mês são sempre uma surpresa." },
  { icon: MessageSquare, title: "WhatsApp como inimigo", desc: "30 mensagens não respondidas. Histórico perdido. Cliente que 'sumiu' porque você não viu." },
  { icon: Target, title: "Você não sabe o que melhorar", desc: "Qual serviço vende mais? Qual horário tem mais demanda? Você tá no escuro." },
]

const features = [
  { 
    icon: Calendar, 
    title: "Agenda que funciona sozinha", 
    desc: "Seus clientes agendam online. Você só foca no que importa: atender bem.",
    highlight: "Reduza 80% das ligações"
  },
  { 
    icon: Bell, 
    title: "Lembretes que realmente funcionam", 
    desc: "WhatsApp automático 24h antes. Clientes confirmam e você chega no salão com a agenda cheia.",
    highlight: "Nunca mais perca um cliente por esquecimento"
  },
  { 
    icon: MessageCircle, 
    title: "WhatsApp integrado ao sistema", 
    desc: "Confirmações, lembretes e notificações saem automaticamente. Seu WhatsApp vira uma máquina de reter clientes.",
    highlight: "Cada cliente recebe atenção personalizada"
  },
  { 
    icon: DollarSign, 
    title: "Financeiro sem planilha", 
    desc: "Entrada, saída, comissão. Tudo registrado. No fim do mês você sabe exatamente quanto lucrou.",
    highlight: "Decisões baseadas em dados, não em achismo"
  },
  { 
    icon: Users, 
    title: "Clientes organizados", 
    desc: "Histórico de cada um. Preferências. Aniversários. Seus clientes se sentem únicos.",
    highlight: "Fidelização automática"
  },
  { 
    icon: BarChart3, 
    title: "Relatórios que abrem a mente", 
    desc: "Gráficos simples. Você vê o que tá funcionando e o que precisa mudar.",
    highlight: "Crescimento consciente"
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5E41FF] to-[#3a28a3] flex items-center justify-center font-black italic text-white text-sm shadow-lg shadow-[#5E41FF]/30">
              G
            </div>
            <span className="text-base font-black tracking-tighter italic uppercase">Gestão<span className="text-[#5E41FF]">E</span>Salão</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#problema" className="text-sm text-gray-400 hover:text-white transition-colors">O Problema</a>
            <a href="#solucao" className="text-sm text-gray-400 hover:text-white transition-colors">Solução</a>
            <a href="#preco" className="text-sm text-gray-400 hover:text-white transition-colors">Preço</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors hidden sm:block">Entrar</Link>
            <Link href="/register" className="px-5 py-2.5 bg-[#5E41FF] text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-[#4a33cc] transition-all border-b-4 border-[#3D28B8] shadow-lg shadow-[#5E41FF]/20">
              Testar Grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Emotional Hook */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#5E41FF]/15 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-bold uppercase tracking-widest mb-8 animate-pulse">
              <ZapOff size={14} /> Você já perdeu dinheiro assim?
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter italic uppercase leading-[0.95] mb-6">
              E se você pudesse<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#5E41FF]">ganhar 3 horas</span><br />
              do seu tempo de volta?
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
              Todo dono de salão conhece isso: <strong className="text-white">ligações pedindo horário, mensagens sem resposta, cliente que não aparece.</strong>
            </p>
            
            <p className="text-lg md:text-xl text-[#5E41FF] font-bold max-w-2xl mx-auto mb-10">
              O Gestão E Salão resolve isso. Automaticamente.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto px-8 py-5 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all border-b-4 border-[#3D28B8] shadow-xl shadow-[#5E41FF]/25">
                Quero 30 dias grátis <ArrowRight size={18} />
              </Link>
              <a href="#problema" className="w-full sm:w-auto px-8 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                Entender primeiro
              </a>
            </div>
            
            <p className="mt-6 text-xs text-gray-600">Sem cartão de crédito • Cancele quando quiser • Acesso imediato</p>
          </div>
        </div>
      </section>

      {/* Pain Points - Make them feel the pain */}
      <section id="problema" className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4 block">Isso te incomoda?</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase mb-4">
              Se você reconhecer <span className="text-red-500">pelo menos 1</span>, continue lendo
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {painPoints.map((pain, i) => (
              <div key={i} className="p-6 bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/10 rounded-2xl hover:border-red-500/30 hover:from-red-500/10 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-all">
                    <pain.icon size={24} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase italic mb-2 text-red-400">{pain.title}</h3>
                    <p className="text-gray-500 text-sm">{pain.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-lg mb-6">
              Cada um desses problemas <strong className="text-white">custa dinheiro e tempo</strong>. Todos os dias.
            </p>
            <p className="text-[#5E41FF] font-bold text-xl">
              E se existisse uma forma de resolver todos de uma vez?
            </p>
          </div>
        </div>
      </section>

      {/* Solution - The transformation */}
      <section id="solucao" className="py-24 relative">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#5E41FF]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#5E41FF] text-xs font-bold uppercase tracking-widest mb-4 block">A solução</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase mb-4">
              Seu salão funcionando como um <span className="text-[#5E41FF]">relógio suíço</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">Cada funcionalidade resolve um dos seus problemas. Juntas, transformam seu negócio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="group p-8 bg-[#121021]/50 border border-white/5 rounded-3xl hover:border-[#5E41FF]/30 transition-all hover:bg-[#121021]">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#5E41FF]/10 border border-[#5E41FF]/20 flex items-center justify-center shrink-0 group-hover:bg-[#5E41FF]/20 group-hover:scale-110 transition-all">
                    <feature.icon size={28} className="text-[#5E41FF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black uppercase italic mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-3">{feature.desc}</p>
                    <span className="inline-flex items-center gap-1 text-[#5E41FF] text-xs font-bold">
                      <CheckCircle2 size={12} /> {feature.highlight}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 border-t border-white/5 bg-gradient-to-b from-[#5E41FF]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#5E41FF] text-xs font-bold uppercase tracking-widest mb-4 block">Resultados reais</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase">
              Quem testou, <span className="text-[#5E41FF]">não voltou atrás</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 bg-[#121021]/50 border border-white/5 rounded-3xl">
                <div className="flex gap-1 mb-4">
                  {Array.from({length: t.rating}, (_, j) => (
                    <Star key={j} size={16} className="text-[#5E41FF] fill-[#5E41FF]" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5E41FF]/30 to-transparent flex items-center justify-center text-[#5E41FF] font-black text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.salon}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Simple and clear */}
      <section id="preco" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#5E41FF] text-xs font-bold uppercase tracking-widest mb-4 block">Preço justo</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase mb-4">
              Menos que um <span className="text-[#5E41FF]">corte por semana</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">Tudo que você precisa, sem limitações. Nem plano 'básico' que não serve pra nada.</p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-gradient-to-b from-[#121021] to-[#0A0A0A] border-2 border-[#5E41FF]/30 rounded-3xl p-10 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#5E41FF]/10 blur-[80px]" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black uppercase italic">Completo</h3>
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest">30 Dias Grátis</span>
                </div>
                
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-black">R$ 49</span>
                  <span className="text-gray-500 font-bold">,90</span>
                </div>
                <p className="text-gray-500 text-sm mb-8">por mês, após o teste</p>
                
                <div className="bg-[#5E41FF]/10 border border-[#5E41FF]/20 rounded-2xl p-4 mb-8">
                  <p className="text-[#5E41FF] text-sm font-bold mb-2">🎁 Teste gratuito de 30 dias</p>
                  <p className="text-gray-400 text-xs">Sem compromisso. Sem cartão de crédito. Cancele quando quiser.</p>
                </div>
                
                <ul className="space-y-3 mb-8">
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
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#5E41FF] shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="w-full py-5 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all border-b-4 border-[#3D28B8] shadow-xl shadow-[#5E41FF]/20">
                  Começar Teste Grátis Agora <ArrowRight size={18} />
                </Link>
                
                <p className="text-center text-xs text-gray-600 mt-4">Após 30 dias, R$ 49,90/mês. Cancele quando quiser.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase">
              Dúvidas <span className="text-[#5E41FF]">frequentes</span>
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 bg-[#121021]/50 border border-white/5 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Urgency */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-[#5E41FF]/20 to-[#5E41FF]/5 border border-[#5E41FF]/10 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[#5E41FF]/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase mb-6">
                Cada dia sem o sistema<br />
                <span className="text-[#5E41FF]">é dinheiro que você deixa de ganhar</span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-8 text-lg">
                Seus clientes estão prontos para agendar. Seu concorrente já automatizou. Você vai ficar esperando?
              </p>
              <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all border-b-4 border-[#3D28B8] shadow-xl shadow-[#5E41FF]/25">
                Começar 30 Dias Grátis <ArrowRight size={18} />
              </Link>
              <p className="text-gray-600 text-sm mt-4">Levar menos de 2 minutos para começar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5E41FF] to-[#3a28a3] flex items-center justify-center font-black italic text-white text-sm">
              G
            </div>
            <span className="text-sm font-black tracking-tighter italic uppercase text-gray-500">Gestão<span className="text-[#5E41FF]">E</span>Salão</span>
          </div>
          <p className="text-xs text-gray-700">© 2026 Gestão E Salão. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  )
}
