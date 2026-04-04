import Link from 'next/link'
import { Calendar, Users, MessageSquare, DollarSign, TrendingUp, Shield, Zap, CheckCircle2, ArrowRight, Clock, Star, ChevronDown, Play, BarChart3, Smartphone, AlertCircle } from 'lucide-react'

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

function PhoneMockup({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`relative mx-auto w-[280px] h-[560px] bg-[#0A0A0A] rounded-[3rem] border-4 border-[#2a2a2a] shadow-2xl overflow-hidden ${className}`}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-[#0A0A0A] rounded-b-2xl z-20" />
      <div className="w-full h-full bg-[#121021] rounded-[2.5rem] overflow-hidden">
        {children}
      </div>
    </div>
  )
}

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
            <a href="#funcionalidades" className="text-sm text-gray-400 hover:text-white transition-colors">Funcionalidades</a>
            <a href="#depoimentos" className="text-sm text-gray-400 hover:text-white transition-colors">Depoimentos</a>
            <a href="#preco" className="text-sm text-gray-400 hover:text-white transition-colors">Preço</a>
            <a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors hidden sm:block">Entrar</Link>
            <Link href="/register" className="px-5 py-2.5 bg-[#5E41FF] text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-[#4a33cc] transition-all border-b-4 border-[#3D28B8] shadow-lg shadow-[#5E41FF]/20">
              30 Dias Grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#5E41FF]/15 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-[#5E41FF]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#5E41FF]/10 border border-[#5E41FF]/20 rounded-full text-[#5E41FF] text-xs font-black uppercase tracking-widest mb-8">
              <Zap size={14} /> O sistema que os salões de sucesso estão usando
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter italic uppercase leading-[0.95] mb-8">
              Seu salão organizado.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5E41FF] to-[#8B6AFF]">Seu tempo livre.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Agenda, clientes, financeiro e WhatsApp em um só lugar. 
              <span className="text-white font-bold"> 30 dias grátis</span> para você ver a diferença.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all border-b-4 border-[#3D28B8] shadow-xl shadow-[#5E41FF]/25">
                Começar Teste Grátis <ArrowRight size={18} />
              </Link>
              <a href="#funcionalidades" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                Ver Funcionalidades <ChevronDown size={18} />
              </a>
            </div>
            <p className="mt-6 text-xs text-gray-600">Sem cartão de crédito • Cancele quando quiser • Acesso imediato</p>
          </div>

          {/* Phone Mockups */}
          <div className="relative flex justify-center items-end gap-4 lg:gap-8">
            <PhoneMockup className="hidden lg:block -mb-8 opacity-60 scale-90">
              <div className="p-4 pt-10 h-full bg-[#0A0A0A]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#5E41FF]/20" />
                  <div>
                    <div className="h-2.5 w-20 bg-white/20 rounded" />
                    <div className="h-2 w-14 bg-white/10 rounded mt-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="p-3 bg-[#121021] rounded-xl border border-white/5">
                      <div className="flex justify-between items-center">
                        <div className="h-2.5 w-16 bg-[#5E41FF]/40 rounded" />
                        <div className="h-2 w-10 bg-white/10 rounded" />
                      </div>
                      <div className="h-2 w-24 bg-white/10 rounded mt-2" />
                    </div>
                  ))}
                </div>
              </div>
            </PhoneMockup>

            <PhoneMockup className="relative z-10">
              <div className="p-4 pt-10 h-full bg-[#0A0A0A]">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-3 w-20 bg-white/30 rounded" />
                  <div className="h-3 w-12 bg-[#5E41FF]/40 rounded" />
                </div>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['D','S','T','Q','Q','S','S'].map((d,i) => (
                    <div key={i} className="text-center text-[8px] text-gray-600 font-bold">{d}</div>
                  ))}
                  {Array.from({length: 14}, (_, i) => (
                    <div key={i} className={`text-center text-[10px] py-1.5 rounded-lg font-bold ${i === 5 ? 'bg-[#5E41FF] text-white' : i === 6 ? 'bg-[#5E41FF]/20 text-[#5E41FF]' : 'text-gray-500'}`}>
                      {i + 15}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-[#121021] rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <div className="h-2.5 w-20 bg-[#5E41FF]/50 rounded" />
                      <div className="h-2 w-12 bg-emerald-500/30 rounded text-emerald-400 text-[8px] px-1.5 py-0.5 rounded-full">09:00</div>
                    </div>
                    <div className="h-2 w-28 bg-white/10 rounded" />
                  </div>
                  <div className="p-3 bg-[#121021] rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <div className="h-2.5 w-24 bg-[#5E41FF]/50 rounded" />
                      <div className="h-2 w-12 bg-emerald-500/30 rounded text-emerald-400 text-[8px] px-1.5 py-0.5 rounded-full">10:30</div>
                    </div>
                    <div className="h-2 w-24 bg-white/10 rounded" />
                  </div>
                  <div className="p-3 bg-[#121021] rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <div className="h-2.5 w-16 bg-[#5E41FF]/50 rounded" />
                      <div className="h-2 w-12 bg-yellow-500/30 rounded text-yellow-400 text-[8px] px-1.5 py-0.5 rounded-full">14:00</div>
                    </div>
                    <div className="h-2 w-20 bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            </PhoneMockup>

            <PhoneMockup className="hidden lg:block -mb-8 opacity-60 scale-90">
              <div className="p-4 pt-10 h-full bg-[#0A0A0A]">
                <div className="h-3 w-24 bg-white/30 rounded mb-4" />
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-3 bg-[#121021] rounded-xl">
                    <div className="h-2 w-10 bg-emerald-500/40 rounded mb-1" />
                    <div className="h-4 w-16 bg-emerald-500/60 rounded" />
                  </div>
                  <div className="p-3 bg-[#121021] rounded-xl">
                    <div className="h-2 w-10 bg-[#5E41FF]/40 rounded mb-1" />
                    <div className="h-4 w-14 bg-[#5E41FF]/60 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-[#121021] rounded-xl" />
                  <div className="h-8 bg-[#121021] rounded-xl" />
                  <div className="h-8 bg-[#121021] rounded-xl" />
                </div>
              </div>
            </PhoneMockup>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase mb-4">
              Você se <span className="text-red-500">identifica?</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">Se pelo menos uma dessas situações faz parte do seu dia, o Gestão E Salão foi feito para você.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: AlertCircle, title: "Horários perdidos", desc: "Clientes esquecem e você fica com a cadeira vazia." },
              { icon: Clock, title: "Sem controle financeiro", desc: "Você não sabe exatamente quanto entra e sai por mês." },
              { icon: Users, title: "Clientes desorganizados", desc: "Cadernos, post-its e planilhas que ninguém atualiza." },
              { icon: MessageSquare, title: "WhatsApp lotado", desc: "Você perde horas respondendo mensagens e confirmando horários." },
              { icon: BarChart3, title: "Sem relatórios", desc: "Você não sabe qual serviço dá mais lucro ou qual dia é mais movimentado." },
              { icon: Smartphone, title: "Sem acesso remoto", desc: "Só consegue ver as informações do salão quando está lá." },
            ].map((pain, i) => (
              <div key={i} className="p-6 bg-red-500/[0.03] border border-red-500/10 rounded-2xl hover:border-red-500/20 transition-all">
                <pain.icon size={24} className="text-red-500/60 mb-4" />
                <h3 className="text-base font-black uppercase italic mb-2 text-red-400/80">{pain.title}</h3>
                <p className="text-gray-600 text-sm">{pain.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="funcionalidades" className="py-24 relative">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#5E41FF]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase mb-4">
              Imagine seu salão <span className="text-[#5E41FF]">funcionando assim</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">Tudo que você precisa em um só lugar. Sem complicação, sem planilhas, sem dor de cabeça.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Calendar, title: "Agenda Inteligente", desc: "Visualize seus horários em tempo real. Evite conflitos e organize o dia do seu salão com facilidade." },
              { icon: Users, title: "Gestão de Clientes", desc: "Cadastre clientes, veja histórico de atendimentos e envie lembretes automáticos por WhatsApp." },
              { icon: MessageSquare, title: "WhatsApp Integrado", desc: "Confirmações e lembretes automáticos. Cada salão conecta seu próprio WhatsApp via QR Code." },
              { icon: DollarSign, title: "Controle Financeiro", desc: "Registre vendas, despesas e comissões. Saiba exatamente quanto seu salão fatura." },
              { icon: TrendingUp, title: "Relatórios Detalhados", desc: "Gráficos e métricas para você tomar decisões inteligentes sobre seu negócio." },
              { icon: Shield, title: "Seguro e Privado", desc: "Cada salão tem seus dados isolados. Ninguém vê as informações do outro." },
            ].map((feature, i) => (
              <div key={i} className="group p-8 bg-[#121021]/50 border border-white/5 rounded-3xl hover:border-[#5E41FF]/30 transition-all hover:bg-[#121021]">
                <div className="w-14 h-14 rounded-2xl bg-[#5E41FF]/10 border border-[#5E41FF]/20 flex items-center justify-center mb-6 group-hover:bg-[#5E41FF]/20 group-hover:scale-110 transition-all">
                  <feature.icon size={24} className="text-[#5E41FF]" />
                </div>
                <h3 className="text-lg font-black uppercase italic mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase mb-4">
              Quem usa, <span className="text-[#5E41FF]">recomenda</span>
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
                <p className="text-gray-400 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5E41FF]/30 to-transparent flex items-center justify-center text-[#5E41FF] font-black text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-gray-600">{t.salon}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="preco" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase mb-4">
              Um plano. <span className="text-[#5E41FF]">Tudo incluso.</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">Sem plano básico limitado. Sem surpresas. Você paga um valor justo e leva tudo.</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-[#121021] border border-[#5E41FF]/20 rounded-3xl p-10 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#5E41FF]/10 blur-[80px]" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black uppercase italic">Profissional</h3>
                  <span className="px-3 py-1 bg-[#5E41FF]/10 border border-[#5E41FF]/20 rounded-full text-[#5E41FF] text-[10px] font-black uppercase tracking-widest">30 Dias Grátis</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-black">R$ 49</span>
                  <span className="text-gray-500 font-bold">,90/mês</span>
                </div>
                <p className="text-gray-600 text-sm mb-8">Tudo incluso. Sem limitações.</p>
                
                <ul className="space-y-4 mb-10">
                  {[
                    'Agenda completa com visualização semanal',
                    'Cadastro ilimitado de clientes',
                    'Cadastro ilimitado de serviços',
                    'WhatsApp integrado (QR Code)',
                    'Controle financeiro completo',
                    'Relatórios e métricas',
                    'Gestão de comissões',
                    'Suporte por WhatsApp',
                    'Acesso de qualquer dispositivo',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[#5E41FF] shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="w-full py-4 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all border-b-4 border-[#3D28B8] shadow-xl shadow-[#5E41FF]/20">
                  Testar 30 Dias Grátis <ArrowRight size={18} />
                </Link>
                <p className="text-center text-xs text-gray-600 mt-4">Depois, apenas R$ 49,90/mês. Cancele quando quiser.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase mb-4">
              Perguntas <span className="text-[#5E41FF]">frequentes</span>
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

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-[#5E41FF]/20 to-[#5E41FF]/5 border border-[#5E41FF]/10 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[#5E41FF]/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase mb-6">
                Seu salão merece<br />
                <span className="text-[#5E41FF]">ser organizado.</span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-8 text-lg">
                Teste grátis por 30 dias. Sem cartão de crédito. Sem compromisso.
              </p>
              <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all border-b-4 border-[#3D28B8] shadow-xl shadow-[#5E41FF]/25">
                Começar Agora <ArrowRight size={18} />
              </Link>
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
