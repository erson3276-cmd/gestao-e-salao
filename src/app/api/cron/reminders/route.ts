import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: salons, error } = await supabaseAdmin
      .from('salons')
      .select('id, name, owner_name, owner_phone, subscription_ends_at, whatsapp_instance_id')
      .eq('status', 'active')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const now = new Date()
    const results = []

    for (const salon of salons || []) {
      try {
        if (!salon.subscription_ends_at || !salon.owner_phone) continue

        const expiresAt = new Date(salon.subscription_ends_at)
        const daysDiff = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff <= 5 && daysDiff > 0) {
          const plural = daysDiff === 1 ? 'dia' : 'dias'
          const message = `Olá *${salon.owner_name}*! 👋\n\nLembrete: A assinatura do *${salon.name}* vence em *${daysDiff} ${plural}* (${expiresAt.toLocaleDateString('pt-BR')}).\n\nPara renovar, escolha seu plano:\n\n📅 *Mensal:* R$ 49,90\n📅 *Semestral:* R$ 249,90 (-16%)\n📅 *Anual:* R$ 449,90 (-25%)\n\n💳 *Chave PIX:* (21) 98275-5539\n\nApós o pagamento, envie o comprovante aqui mesmo! 😊`

          await supabaseAdmin
            .from('whatsapp_messages')
            .insert({
              phone: salon.owner_phone.replace(/\D/g, ''),
              message,
              status: 'pending',
              salon_id: salon.id
            })

          results.push({ salon: salon.name, owner: salon.owner_name, daysLeft: daysDiff })
        }
      } catch (salonError: any) {
        results.push({ salon: salon?.name || 'unknown', error: salonError.message })
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
