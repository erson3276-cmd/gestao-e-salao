import { createHash } from 'crypto'

export function hashPassword(password: string): string {
  return createHash('sha256').update(password + (process.env.AUTH_SALT || 'gestao-esalao-saas-2024-secure')).digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export interface SalonSession {
  salonId: string
  salonName: string
  ownerEmail: string
  plan: string
  subscriptionEndsAt: string
}

export const SALON_COOKIE_NAME = 'salon_session'
export const SUPER_ADMIN_COOKIE_NAME = 'super_admin_session'
export const SUPER_ADMIN_EMAIL = 'admin@gestaoesalao.com'
export const SUPER_ADMIN_PASSWORD = 'EricAdmin2024!'
