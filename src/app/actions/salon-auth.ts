'use server'

import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { hashPassword, verifyPassword, SALON_COOKIE_NAME, SUPER_ADMIN_COOKIE_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, type SalonSession } from '@/lib/auth'

async function salonsTableExists(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('salons').select('id', { count: 'exact', head: true })
    return !error
  } catch {
    return false
  }
}

export async function salonLogin(email: string, password: string) {
  try {
    if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
      const cookieStore = await cookies()
      cookieStore.set(SUPER_ADMIN_COOKIE_NAME, 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })
      return { success: true, redirect: '/super-admin' }
    }

    const tableExists = await salonsTableExists()
    if (!tableExists) {
      return { success: false, error: 'Sistema em manutencao. Tente novamente mais tarde.' }
    }

    const { data: salon, error } = await supabaseAdmin
      .from('salons')
      .select('*')
      .eq('owner_email', email)
      .single()

    if (error || !salon) {
      return { success: false, error: 'Email ou senha incorretos' }
    }

    if (salon.status === 'blocked') {
      return { success: false, error: 'Sua conta esta bloqueada. Entre em contato com o suporte.' }
    }

    if (salon.status === 'inactive') {
      return { success: false, error: 'Sua conta esta inativa. Renove sua assinatura.' }
    }

    const isValid = verifyPassword(password, salon.owner_password)
    if (!isValid) {
      return { success: false, error: 'Email ou senha incorretos' }
    }

    const session: SalonSession = {
      salonId: salon.id,
      salonName: salon.name,
      ownerEmail: salon.owner_email,
      plan: salon.plan
    }

    const cookieStore = await cookies()
    cookieStore.set(SALON_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return { success: true, redirect: '/admin/agenda' }
  } catch (error) {
    console.error('Salon login error:', error)
    return { success: false, error: 'Erro ao conectar ao servidor' }
  }
}

export async function salonRegister(data: {
  salonName: string
  ownerName: string
  ownerEmail: string
  ownerPassword: string
  ownerPhone?: string
}) {
  try {
    const tableExists = await salonsTableExists()
    if (!tableExists) {
      return { success: false, error: 'Sistema em manutencao. Tente novamente mais tarde.' }
    }

    const { data: existing } = await supabaseAdmin
      .from('salons')
      .select('id')
      .eq('owner_email', data.ownerEmail)
      .single()

    if (existing) {
      return { success: false, error: 'Este email ja esta cadastrado' }
    }

    const hashedPassword = hashPassword(data.ownerPassword)

    const { data: salon, error } = await supabaseAdmin
      .from('salons')
      .insert([{
        name: data.salonName,
        owner_name: data.ownerName,
        owner_email: data.ownerEmail,
        owner_password: hashedPassword,
        owner_phone: data.ownerPhone || null,
        plan: 'profissional',
        status: 'active',
        subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Salon register error:', error)
      return { success: false, error: 'Erro ao criar conta. Tente novamente.' }
    }

    const session: SalonSession = {
      salonId: salon.id,
      salonName: salon.name,
      ownerEmail: salon.owner_email,
      plan: salon.plan
    }

    const cookieStore = await cookies()
    cookieStore.set(SALON_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return { success: true, redirect: '/admin/gestao' }
  } catch (error) {
    console.error('Salon register error:', error)
    return { success: false, error: 'Erro ao conectar ao servidor' }
  }
}

export async function salonLogout() {
  const cookieStore = await cookies()
  cookieStore.delete(SALON_COOKIE_NAME)
  cookieStore.delete(SUPER_ADMIN_COOKIE_NAME)
  return { success: true }
}

export async function getSalonSession(): Promise<SalonSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SALON_COOKIE_NAME)
    if (!sessionCookie) return null
    return JSON.parse(sessionCookie.value) as SalonSession
  } catch {
    return null
  }
}

export async function getSuperAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SUPER_ADMIN_COOKIE_NAME)
    return sessionCookie?.value === 'authenticated'
  } catch {
    return false
  }
}
