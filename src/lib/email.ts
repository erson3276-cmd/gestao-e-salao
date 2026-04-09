import crypto from 'crypto'

export function generateVerificationCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function sendVerificationEmail(email: string, code: string, salonName: string) {
  const resendApiKey = process.env.RESEND_API_KEY
  
  if (!resendApiKey) {
    console.log('RESEND_API_KEY não configurado. Código de verificação:', code)
    return { success: true, debugCode: code }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Gestão E Salão <onboarding@gestaoesalao.com>',
        to: email,
        subject: 'Confirme seu email - Gestão E Salão',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0A0A0A; color: #ffffff; padding: 40px; margin: 0;">
            <div style="max-width: 500px; margin: 0 auto; background: #121021; border-radius: 20px; padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 28px; font-weight: 800; margin: 0;">
                  Gestão<span style="color: #5E41FF;">E</span>Salão
                </h1>
              </div>
              
              <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; text-align: center;">
                Confirme seu email
              </h2>
              
              <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
                Olá! Você criou uma conta para <strong style="color: #fff;">${salonName}</strong>.
                <br><br>
                Use o código abaixo para confirmar seu email:
              </p>
              
              <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #5E41FF;">${code}</span>
              </div>
              
              <p style="color: #6B7280; font-size: 14px; text-align: center;">
                Este código expira em 30 minutos.
              </p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #374151; text-align: center;">
                <p style="color: #6B7280; font-size: 12px;">
                  Se você não criou esta conta, ignore este email.
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend error:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Email error:', error)
    return { success: false, error: error.message }
  }
}

export async function sendWelcomeEmail(email: string, salonName: string, ownerName: string) {
  const resendApiKey = process.env.RESEND_API_KEY
  
  if (!resendApiKey) {
    console.log('RESEND_API_KEY não configurado')
    return { success: true }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Gestão E Salão <onboarding@gestaoesalao.com>',
        to: email,
        subject: 'Bem-vindo ao Gestão E Salão! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0A0A0A; color: #ffffff; padding: 40px; margin: 0;">
            <div style="max-width: 500px; margin: 0 auto; background: #121021; border-radius: 20px; padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 28px; font-weight: 800; margin: 0;">
                  Gestão<span style="color: #5E41FF;">E</span>Salão
                </h1>
              </div>
              
              <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 20px; text-align: center; color: #10B981;">
                ✓ Conta confirmada com sucesso!
              </h2>
              
              <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 20px; text-align: center;">
                Olá, <strong style="color: #fff;">${ownerName}</strong>!
                <br><br>
                Seu salão <strong style="color: #fff;">${salonName}</strong> está pronto para uso.
              </p>

              <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; margin: 30px 0;">
                <p style="color: #9CA3AF; font-size: 14px; margin-bottom: 15px; text-align: center;">
                  📅 Seu período de teste
                </p>
                <p style="color: #5E41FF; font-size: 18px; font-weight: 700; text-align: center;">
                  14 dias grátis
                </p>
                <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 10px;">
                  Depois, R$ 49,90/mês
                </p>
              </div>

              <a href="https://gestaoesalao.com.br/admin" style="display: block; background: linear-gradient(135deg, #5E41FF, #8B5CF6); color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; text-align: center; margin: 20px 0;">
                Começar agora →
              </a>
              
              <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 30px;">
                Dúvidas? Responda este email ou clique no chat no seu painel.
              </p>
            </div>
          </body>
          </html>
        `
      })
    })

    return { success: response.ok }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}