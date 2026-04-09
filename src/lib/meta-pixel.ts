export function trackPurchase(value: number, currency: string = 'BRL') {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value,
      currency,
      content_type: 'subscription',
      content_name: 'Gestão E Salão'
    })
  }
}

export function trackLead() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: 'Cadastro Gestão E Salão'
    })
  }
}

export function trackInitiateCheckout(value: number) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value,
      currency: 'BRL',
      content_type: 'subscription'
    })
  }
}

export function trackCompleteRegistration() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      content_name: 'Cadastro Gestão E Salão'
    })
  }
}

export function trackSubscribe(plan: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Subscribe', {
      value: plan,
      currency: 'BRL',
      content_type: 'subscription'
    })
  }
}