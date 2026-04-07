'use client'

import { useState } from 'react'
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
  CreditCard,
  Bell,
  BarChart3
} from 'lucide-react'

const plans = [
  { 
    id: "monthly",
    period: "Mensal", 
    price: 49, 
    total: 49,
    periodPrice: "R$ 49/mês",
    popular: false 
  },
  { 
    id: "semiannual",
    period: "Semestral", 
    price: 41.65, 
    total: 249.90,
    periodPrice: "R$ 41,65/mês",
    popular: true,
    savings: "Economize R$ 44,10"
  },
  { 
    id: "annual",
    period: "Anual", 
    price: 37.49, 
    total: 449.90,
    periodPrice: "R$ 37,49/mês",
    popular: false,
    savings: "Economize R$ 138,10"
  },
]

const benefits = [
  { icon: Calendar, title: "Agenda Inteligente", desc: "Clientes agendam 24h pelo link. Você sófoca em atender." },
  { icon: Bell, title: "Lembretes Automáticos", desc: "Alertas 24h antes. Clientes confirmam, agenda sempre cheia." },
  { icon: DollarSign, title: "Financeiro Completo", desc: "Entrada, saída, comissão. Tudo registrado. Lucro real." },
  { icon: Users, title: "Clientes Fidelizados", desc: "Histórico, preferências, anniversários. Cliente retorna sempre." },
  { icon: BarChart3, title: "Relatórios Reais", desc: "Gráficos simples. Veja o que funciona e cresça todo mês." },
  { icon: MessageSquare, title: "WhatsApp Integrado", desc: "Mensagens automáticas. Cliente nunca mais esquece." },
]

const features = [
  "Agenda online 24/7",
  "Múltiplos profissionais",
  "Controle de estoque",
  "Comissões automáticas",
  "Relatórios detalhados",
  "Suporte prioritário",
  "App para Android/iOS",
  "Atualizações gratuitas",
]

export default function VendasPage() {
  const [selectedPlan, setSelectedPlan] = useState("semiannual")

  const selected = plans.find(p => p.id === selectedPlan)!

  return (
    <div className="min-h-screen bg-[#030014] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#030014]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-black italic">
            Gestão<span className="text-purple-500">E</span>Salão
          </Link>
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Já tem conta? Fazer login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-bold mb-6">
            Escolha seu plano
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
            Sistema completo para
            <span className="block text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
              seu salão ou barbearia
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Deixe de perder tempo gerenciando planilhas e mensagens no WhatsApp. 
            Tenha controle total do seu negócio.
          </p>

          {/* Planos */}
          <div className="mb-8">
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {plans.map((plan) => (
                  <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    selectedPlan === plan.id 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  } ${plan.popular ? 'relative' : ''}`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold">
                      Mais popular
                    </span>
                  )}
                  <p className="text-white text-xl font-black mb-1">{plan.period}</p>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-black text-white">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                    <span className="text-gray-400">/mês</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">
                    Total: R$ {plan.total.toFixed(2).replace('.', ',')}
                  </p>
                  {plan.savings && (
                    <div className="inline-block px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-bold">
                      ✅ {plan.savings}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Principal */}
          <Link 
            href={`/register?plan=${selectedPlan}&redirect=checkout`} 
            className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%] text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-purple-500/40 hover:bg-[position:100%_0] transition-all duration-500"
          >
            <CreditCard className="w-6 h-6" />
            Assinar Agora - R$ {selected.total.toFixed(2).replace('.', ',')}
            <ArrowRight className="w-6 h-6" />
          </Link>

          <p className="text-gray-500 text-sm mt-4">
            🔒 Pagamento seguro via Asaas • Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">
            Tudo que você precisa para <span className="text-purple-400">grow</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all">
                <benefit.icon className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O que está incluído */}
      <section className="py-16 px-4 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">
            O que está incluído no plano
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-[#030014]/50 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferencial */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-8">
            Por que escolher o <span className="text-purple-400">Gestão E Salão</span>?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-bold mb-2">Rápido</h3>
              <p className="text-gray-400 text-sm">Em 5 minutos sua agenda já está no ar e funcionando</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-bold mb-2">Seguro</h3>
              <p className="text-gray-400 text-sm">Seus dados protegidos com criptografia de banco</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="font-bold mb-2">Sem limites</h3>
              <p className="text-gray-400 text-sm">Funciona para 1 ou 20 profissionais sem custo extra</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4">
            Pronto para transformar seu salão?
          </h2>
          <p className="text-gray-400 mb-8">
            Cadastre-se agora e tenha acesso imediato a todas as funcionalidades.
          </p>
          
          <Link 
            href={`/register?plan=${selectedPlan}&redirect=checkout`}
            className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%] text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-purple-500/40 hover:bg-[position:100%_0] transition-all duration-500"
          >
            Assinar Agora - R$ {selected.total.toFixed(2).replace('.', ',')}
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600 text-sm">
            © 2026 Gestão E Salão. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
