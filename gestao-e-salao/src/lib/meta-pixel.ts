export function trackPurchase(value: number, currency: string = 'BRL', content_name?: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value,
      currency,
      content_type: 'subscription',
      content_name: content_name || 'Gestão E Salão'
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

export function trackInitiateCheckout(value: number, currency: string = 'BRL', content_type?: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value,
      currency,
      content_type: content_type || 'subscription'
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

export function trackSubscribe(value: number, currency: string = 'BRL', plan?: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Subscribe', {
      value,
      currency,
      content_type: 'subscription',
      plan: plan
    })
  }
}