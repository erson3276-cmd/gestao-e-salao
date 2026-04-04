import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, MessageSquare, DollarSign, TrendingUp, CheckCircle2, ArrowRight, Shield, Zap, Smartphone } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#5E41FF]/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#5E41FF]/20 blur-[120px] rounded-full" />
        
        <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5E41FF] to-[#3a28a3] flex items-center justify-center font-black italic text-white shadow-lg shadow-[#5E41FF]/20">
              G
            </div>
            <span className="text-lg font-black tracking-tighter italic uppercase">Gestão<span className="text-[#5E41FF]">E</span>Salão</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Entrar</Link>
            <Link href="/register" className="px-5 py-2.5 bg-[#5E41FF] text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-[#4a33cc] transition-colors border-b-4 border-[#3D28B8]">
              Começar Grátis
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#5E41FF]/10 border border-[#5E41FF]/20 rounded-full text-[#5E41FF] text-xs font-black uppercase tracking-widest mb-8">
            <Zap size={14} /> Sistema Completo para Salões
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter italic uppercase leading-none mb-6">
            Gerencie seu salão<br />
            <span className="text-[#5E41FF]">sem complicação</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Agenda, clientes, financeiro e WhatsApp em um só lugar. 
            Tudo que você precisa para organizar seu salão e ganhar mais tempo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all border-b-4 border-[#3D28B8] shadow-xl shadow-[#5E41FF]/20">
              Criar Conta Grátis <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
              Já tenho conta
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase mb-4">
            Tudo que seu salão <span className="text-[#5E41FF]">precisa</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Ferramentas profissionais para organizar seu dia a dia e atender melhor seus clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Calendar, title: 'Agenda Inteligente', desc: 'Visualize seus horários, evite conflitos e organize o dia do seu salão com facilidade.' },
            { icon: Users, title: 'Gestão de Clientes', desc: 'Cadastre clientes, veja histórico de atendimentos e envie lembretes automáticos.' },
            { icon: MessageSquare, title: 'WhatsApp Integrado', desc: 'Confirmações e lembretes automáticos. Cada salão pode conectar seu próprio WhatsApp.' },
            { icon: DollarSign, title: 'Controle Financeiro', desc: 'Registre vendas, despesas e comissões. Saiba exatamente quanto seu salão fatura.' },
            { icon: TrendingUp, title: 'Relatórios Detalhados', desc: 'Gráficos e métricas para você tomar decisões inteligentes sobre seu negócio.' },
            { icon: Shield, title: 'Seguro e Privado', desc: 'Cada salão tem seus dados isolados. Ninguém vê as informações do outro.' },
          ].map((feature, i) => (
            <div key={i} className="p-8 bg-[#121021]/50 border border-white/5 rounded-3xl hover:border-[#5E41FF]/20 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#5E41FF]/10 border border-[#5E41FF]/20 flex items-center justify-center mb-6 group-hover:bg-[#5E41FF]/20 transition-colors">
                <feature.icon size={24} className="text-[#5E41FF]" />
              </div>
              <h3 className="text-lg font-black uppercase italic mb-3">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase mb-4">
            Plano <span className="text-[#5E41FF]">simples e justo</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Comece grátis. Sem cartão de crédito. Sem compromisso.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-[#121021] border border-[#5E41FF]/20 rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#5E41FF]/10 blur-[80px]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black uppercase italic">Profissional</h3>
                <span className="px-3 py-1 bg-[#5E41FF]/10 border border-[#5E41FF]/20 rounded-full text-[#5E41FF] text-[10px] font-black uppercase tracking-widest">Mais Popular</span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black">R$ 49</span>
                <span className="text-gray-500 font-bold">,90/mês</span>
              </div>
              <p className="text-gray-600 text-sm mb-8">Tudo que você precisa para gerenciar seu salão.</p>
              
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
                Começar Agora <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="bg-gradient-to-r from-[#5E41FF]/20 to-[#5E41FF]/5 border border-[#5E41FF]/10 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#5E41FF]/5" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase mb-4">
              Pronto para organizar seu salão?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Crie sua conta em menos de 2 minutos. Sem cartão de crédito. Sem compromisso.
            </p>
            <Link href="/register" className="inline-flex items-center gap-3 px-8 py-4 bg-[#5E41FF] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all border-b-4 border-[#3D28B8] shadow-xl shadow-[#5E41FF]/20">
              Criar Conta Grátis <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
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
