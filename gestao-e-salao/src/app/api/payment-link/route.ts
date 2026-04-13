import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { salonName, ownerEmail, amount } = await request.json()
  
  const mpUrl = `https://mpago.la/2wXmYpz`
  
  return NextResponse.json({ 
    success: true, 
    paymentUrl: mpUrl,
    message: `Link de pagamento gerado para ${salonName}. Valor: R$ ${amount || '49,90'}`
  })
}
