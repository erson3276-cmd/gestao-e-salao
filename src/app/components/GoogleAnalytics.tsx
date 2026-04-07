'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'
  
  useEffect(() => {
    if (measurementId === 'G-XXXXXXXXXX') return
    
    // Google Analytics 4
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script1)

    window.dataLayer = window.dataLayer || []
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(args)
    }
    window.gtag('js', new Date())
    window.gtag('config', measurementId)
  }, [measurementId])

  return null
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

export const Analytics = {
  salonCreated: () => trackEvent('salon_created'),
  login: () => trackEvent('login'),
  serviceCreated: () => trackEvent('service_created'),
  appointmentBooked: (serviceName: string) => trackEvent('appointment_booked', { service_name: serviceName }),
  subscriptionStarted: (plan: string) => trackEvent('subscription_started', { plan }),
  paymentFailed: (reason: string) => trackEvent('payment_failed', { reason }),
  whatsappConnected: () => trackEvent('whatsapp_connected'),
}