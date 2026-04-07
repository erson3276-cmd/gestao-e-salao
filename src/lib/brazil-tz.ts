export const BRAZIL_TZ = 'America/Sao_Paulo'

export function getCurrentDateInBrazil(): Date {
  const now = new Date()
  return new Date(now.toLocaleString('en-US', { timeZone: BRAZIL_TZ }))
}

export function toBrazilTz(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Date(d.toLocaleString('en-US', { timeZone: BRAZIL_TZ }))
}

export function formatDateBrazil(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', { timeZone: BRAZIL_TZ })
}

export function formatTimeBrazil(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('pt-BR', { timeZone: BRAZIL_TZ, hour: '2-digit', minute: '2-digit', hour12: false })
}

export function getDateStrBrazil(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: BRAZIL_TZ })
}

export function getBrazilNowISO(): string {
  const now = new Date()
  const offset = -3 * 60
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  return new Date(utc + (offset * 60000)).toISOString()
}