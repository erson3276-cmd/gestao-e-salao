'use client'

import { useEffect, useRef, useState } from 'react'

const ABANDONED_CART_KEY = 'gestao_salao_abandoned_cart'
const CART_TIMEOUT = 30 * 60 * 1000 // 30 minutos

interface AbandonedCart {
  email: string
  phone: string
  plan: string
  value: number
  timestamp: number
}

export function useAbandonedCart(email: string, phone: string, plan: string, value: number) {
  const savedCart = useRef<AbandonedCart | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(ABANDONED_CART_KEY)
    if (stored) {
      try {
        savedCart.current = JSON.parse(stored)
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (email && phone) {
      const cart: AbandonedCart = {
        email,
        phone,
        plan,
        value,
        timestamp: Date.now()
      }
      localStorage.setItem(ABANDONED_CART_KEY, JSON.stringify(cart))
    }
  }, [email, phone, plan, value])

  const clearCart = () => {
    localStorage.removeItem(ABANDONED_CART_KEY)
  }

  const checkAbandoned = (): AbandonedCart | null => {
    const stored = localStorage.getItem(ABANDONED_CART_KEY)
    if (!stored) return null
    
    try {
      const cart: AbandonedCart = JSON.parse(stored)
      const elapsed = Date.now() - cart.timestamp
      
      if (elapsed > CART_TIMEOUT && elapsed < 24 * 60 * 60 * 1000) {
        return cart
      }
    } catch {}
    
    return null
  }

  return { clearCart, checkAbandoned }
}
