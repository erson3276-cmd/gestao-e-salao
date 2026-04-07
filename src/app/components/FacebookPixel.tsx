'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    fbq: any
  }
}

export function useFacebookPixel() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView')
    }
  }, [pathname, searchParams])

  const trackEvent = (eventName: string, data?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, data)
    }
  }

  return { trackEvent }
}

export function FacebookPixelProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView')
    }
  }, [pathname])

  return <>{children}</>
}

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
