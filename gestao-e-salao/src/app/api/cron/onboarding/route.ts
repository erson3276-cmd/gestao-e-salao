import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

interface OnboardingMessage {
  day: number
  title: string
  message: string
  action?: string
}

const ONBOARDING_MESSAGES: OnboardingMessage[] = [
  { 
    day: 1, 
    title: 'Bem-vindo ao Gestão E Salão!', 
    message: 'Hora de configurar seu salão. Comece adicionando seus serviços e profissionais.',
    action: '/admin/servicos'
  },
  { 
    day: 2, 
    title: 'Cadastre seus clientes', 
    message: 'Adicione sua base de clientes para lembrar birthdays e enviar lembretes.',
    action: '/admin/clientes'
  },
  { 
    day: 3, 
    title: 'Teste o agendamento online', 
    message: 'Seu salão já pode receber agendamentos pelo link. Compartilhe com suas clientes!',
    action: '/admin/agenda'
  },
  { 
    day: 5, 
    title: 'Configure horário de funcionamento', 
    message: 'Defina os dias e horários que seu salão atende.',
    action: '/admin/gestao'
  },
  { 
    day: 7, 
    title: 'Configure o WhatsApp', 
    message: 'Conecte seu WhatsApp para enviar lembretes automáticos aos clientes.',
    action: '/admin/gestao'
  },
  { 
    day: 10, 
    title: 'Acompanhe suas vendas', 
    message: 'Veja o relatório financeiro e descubra quais serviços mais vendem.',
    action: '/admin/vendas'
  },
  { 
    day: 12, 
    title: 'Últimos dias de teste!', 
    message: 'Faltam 2 dias para seu teste grátis terminar. Assine agora por R$49,90/mês.',
    action: '/assine'
  }
]

function getDiffDays(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

export async function GET() {
  try {
    const { data: salons, error } = await supabaseAdmin
      .from('salons')
      .select('id, owner_email, trial_start_at, trial_end_at, onboarding_sent, status')
      .eq('status', 'trial')

    if (error) {
      console.error('Error fetching salons:', error)
      return NextResponse.json({ success: false, error: error.message })
    }

    if (!salons || salons.length === 0) {
      return NextResponse.json({ success: true, message: 'Nenhum salão em trial' })
    }

    const today = new Date()
    const results: { salonId: string; day: number; message: string }[] = []

    for (const salon of salons) {
      if (!salon.trial_start_at) continue

      const trialStart = new Date(salon.trial_start_at)
      const daysSinceStart = getDiffDays(trialStart, today) + 1

      const currentOnboarding = salon.onboarding_sent as any || {}

      for (const msg of ONBOARDING_MESSAGES) {
        if (msg.day === daysSinceStart && !currentOnboarding[`day${msg.day}`]?.sent) {
          results.push({
            salonId: salon.id,
            day: msg.day,
            message: msg.title
          })

          currentOnboarding[`day${msg.day}`] = {
            sent: true,
            date: today.toISOString()
          }
        }
      }

      await supabaseAdmin
        .from('salons')
        .update({ onboarding_sent: currentOnboarding })
        .eq('id', salon.id)
    }

    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      messages: results
    })
  } catch (e: any) {
    console.error('Onboarding cron error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}