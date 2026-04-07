'use server'

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { SALON_COOKIE_NAME, SUPER_ADMIN_COOKIE_NAME } from '@/lib/auth'
import { getSalonSession, getSuperAdminSession } from '@/app/actions/salon-auth'
import { baileys } from '@/lib/baileys'

async function getSalonId(): Promise<string | null> {
  const session = await getSalonSession()
  const isAdmin = await getSuperAdminSession()
  if (session) return session.salonId
  if (isAdmin) return null
  return null
}

async function revalidateAdmin() {
  revalidatePath('/admin')
  revalidatePath('/admin/gestao')
  revalidatePath('/admin/agenda')
  revalidatePath('/admin/clientes')
  revalidatePath('/admin/servicos')
  revalidatePath('/admin/vendas')
  revalidatePath('/admin/despesas')
  revalidatePath('/admin/comissao')
  revalidatePath('/admin/relatorios')
}

export async function sendWhatsAppMessage(message: string, phone: string) {
  try {
    const salonId = await getSalonId()
    let instanceId: string | null = null
    
    if (salonId) {
      const { data: salon } = await supabase
        .from('salons')
        .select('whatsapp_instance_id')
        .eq('id', salonId)
        .single()
      instanceId = salon?.whatsapp_instance_id || null
    }
    
    if (!instanceId) {
      return { success: false, error: 'WhatsApp não configurado para este salão' }
    }
    
    const { baileys } = await import('@/lib/baileys')
    const result = await baileys.sendText(instanceId, phone, message)
    console.log('WhatsApp enviado:', result)
    return { success: true }
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error)
    return { success: false, error }
  }
}

async function callBaileysAPI(endpoint: string, method: string = 'GET', body?: any) {
  const apiUrl = process.env.BAILEYS_API_URL || ''
  const apiKey = process.env.BAILEYS_API_KEY || ''
  
  const url = `${apiUrl}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    'apikey': apiKey
  }
  
  const options: RequestInit = {
    method,
    headers
  }
  
  if (body) {
    options.body = JSON.stringify(body)
  }
  
  const res = await fetch(url, options)
  return res.json()
}

// ============== LOGIN ==============

export async function adminLogin(password: string) {
  if (password === 'moca2024') {
    const cookieStore = await cookies()
    cookieStore.set('admin_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24
    })
    return { success: true }
  }
  return { success: false, error: 'Senha incorreta' }
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_auth')
  cookieStore.delete(SALON_COOKIE_NAME)
  cookieStore.delete(SUPER_ADMIN_COOKIE_NAME)
  return { success: true }
}

export async function checkAdminAuth() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('admin_auth')
  const salonSession = cookieStore.get(SALON_COOKIE_NAME)
  const superAdminSession = cookieStore.get(SUPER_ADMIN_COOKIE_NAME)
  return auth?.value === 'authenticated' || !!salonSession || !!superAdminSession
}

// ============== PROFILE ==============

export async function getProfile() {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('profiles').select('*')
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  const { data } = await query.limit(1).maybeSingle()
  
  if (!data) {
    const { data: d2 } = await supabase.from('perfil').select('*').limit(1).maybeSingle()
    return d2
  }
  return data
}

export async function updateProfile(profileData: any) {
  const salonId = await getSalonId()
  const updateData = salonId ? { ...profileData, salon_id: salonId } : profileData
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', profileData.id)
    .select()
    .single()
  
  if (error) {
    console.error('Update profile error:', error)
    throw new Error('Falha ao atualizar perfil: ' + error.message)
  }
  
  await revalidateAdmin()
  revalidatePath('/admin/gestao')
  return { success: true, data }
}

export async function uploadProfileImage(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) throw new Error('Nenhum arquivo enviado')
  
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const fileName = `profile-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    
    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })
    
    if (error) {
      console.error('Upload error:', error)
      throw new Error(error.message)
    }
    
    const { data: urlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName)
    
    return { publicUrl: urlData.publicUrl }
  } catch (err: any) {
    console.error('Upload catch:', err)
    if (err.message?.includes('bucket')) {
      throw new Error('Bucket de armazenamento não configurado. Configure o Storage no Supabase.')
    }
    throw new Error(err.message || 'Erro ao fazer upload')
  }
}

export async function processTemplate(templateKey: string, data: any) {
  return `Template: ${templateKey}`
}

export async function validateVIP(whatsapp: string) {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('customers').select('active').eq('whatsapp', whatsapp)
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  const { data } = await query.single()
  
  return { 
    status: data?.active === false ? 'blocked' : 'active',
    message: data?.active === false ? 'Cliente bloqueado' : 'OK'
  }
}

// ============== MANAGER TALK ==============

export async function sendManagerTalkMessage(phone: string, message: string) {
  console.log(`Enviando mensagem para ${phone}: ${message}`)
  return { success: true }
}

// ============== AGENDA ==============

export async function getAppointments() {
  const salonId = await getSalonId()
  const baseQuery = supabase
    .from('appointments')
    .select('*, customers:customer_id(name, whatsapp), services:service_id(name, price, duration_minutes)')
    .order('start_time', { ascending: true })
  
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  const { data, error } = await query
  if (error) return []
  return data || []
}

export async function addAppointment(appointmentData: any) {
  const salonId = await getSalonId()
  const startDate = new Date(appointmentData.start_time)
  const minutes = startDate.getUTCMinutes()
  if (minutes !== 0 && minutes !== 30) {
    throw new Error('Agendamentos só podem ser em horários :00 ou :30')
  }

  const now = new Date()
  if (startDate <= now) {
    throw new Error('Não é possível agendar em horários passados')
  }

  const baseConflictQuery = supabase
    .from('appointments')
    .select('id')
    .neq('status', 'cancelado')
    .or(`and(start_time.lte.${appointmentData.start_time},end_time.gt.${appointmentData.start_time}),and(start_time.lt.${appointmentData.end_time},end_time.gte.${appointmentData.end_time})`)
  
  const conflictQuery = salonId ? baseConflictQuery.eq('salon_id', salonId) : baseConflictQuery
  const { data: conflicts } = await conflictQuery

  if (conflicts && conflicts.length > 0) {
    throw new Error('Horário já reservado')
  }

  const insertData = salonId ? { ...appointmentData, salon_id: salonId } : appointmentData
  const { data, error } = await supabase
    .from('appointments')
    .insert([insertData])
    .select()
    .single()
  
  if (error) throw new Error('Falha ao criar agendamento')

  try {
    const { data: customer } = await supabase
      .from('customers')
      .select('name, whatsapp')
      .eq('id', appointmentData.customer_id)
      .single()
    
    const { data: service } = await supabase
      .from('services')
      .select('name')
      .eq('id', appointmentData.service_id)
      .single()
    
    let salonName = 'Gestão E Salão'
    let instanceId: string | null = null
    if (salonId) {
      const { data: salon } = await supabase
        .from('salons')
        .select('name, whatsapp_instance_id')
        .eq('id', salonId)
        .single()
      if (salon) {
        salonName = salon.name
        instanceId = salon.whatsapp_instance_id
      }
    }
    
    if (customer?.whatsapp) {
      const serviceName = service?.name || 'Serviço'
      const dateStr = new Date(appointmentData.start_time).toLocaleDateString('pt-BR')
      const timeStr = new Date(appointmentData.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      
      const message = `Olá *${customer.name}*! ✨\n\nSeu agendamento de *${serviceName}* no *${salonName}* foi confirmado! ✅\n\n🗓️ *Data:* ${dateStr}\n🕒 *Horário:* ${timeStr}\n\nTe esperamos! 🌸`
      
      await supabase
        .from('whatsapp_messages')
        .insert({
          phone: customer.whatsapp.replace(/\D/g, ''),
          message: message,
          status: 'pending',
          salon_id: salonId || null
        })
      
      if (instanceId) {
        try {
          const { baileys } = await import('@/lib/baileys')
          await baileys.sendText(instanceId, customer.whatsapp.replace(/\D/g, ''), message)
        } catch (sendError) {
          console.error('Erro ao enviar WhatsApp:', sendError)
        }
      }
      
      console.log('Mensagem de confirmação salva para:', customer.whatsapp)
    }
  } catch (waError) {
    console.error('Erro ao salvar mensagem WhatsApp:', waError)
  }

  await revalidateAdmin()
  revalidatePath('/admin/agenda')
  return data
}

export async function updateAppointmentStatus(id: string, status: string) {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('appointments').update({ status }).eq('id', id)
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  
  const { error } = await query
  if (error) throw new Error('Falha ao atualizar status')

  await revalidateAdmin()
  revalidatePath('/admin/agenda')
  return { success: true }
}

export async function deleteAppointment(id: string) {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('appointments').delete().eq('id', id)
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  
  const { error } = await query
  if (error) throw new Error('Falha ao excluir')

  await revalidateAdmin()
  revalidatePath('/admin/agenda')
  return { success: true }
}

export async function completeAppointmentCheckout(appointmentId: string, saleData: any) {
  const salonId = await getSalonId()
  const insertData = salonId ? { ...saleData, salon_id: salonId } : saleData
  
  await supabase.from('vendas').insert([insertData])
  await updateAppointmentStatus(appointmentId, 'finalizado')
  
  await revalidateAdmin()
  revalidatePath('/admin/agenda')
  return { success: true }
}

// ============== CLIENTES ==============

export async function getCustomers() {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('customers').select('*').order('name', { ascending: true })
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  
  const { data } = await query
  return data || []
}

export async function addCustomer(customerData: any) {
  const salonId = await getSalonId()
  const insertData = salonId ? { ...customerData, salon_id: salonId } : customerData
  
  const { data, error } = await supabase
    .from('customers')
    .insert([insertData])
    .select()
    .single()
  
  if (error) throw new Error('Falha ao criar cliente')
  
  await revalidateAdmin()
  revalidatePath('/admin/clientes')
  return data
}

export async function updateCustomer(id: string, customerData: any) {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('customers').update(customerData).eq('id', id)
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  
  const { data, error } = await query.select().single()
  
  if (error) throw new Error('Falha ao atualizar cliente')
  
  await revalidateAdmin()
  revalidatePath('/admin/clientes')
  return data
}

export async function deleteCustomer(id: string) {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('customers').delete().eq('id', id)
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  
  const { error } = await query
  if (error) throw new Error('Falha ao excluir cliente')

  await revalidateAdmin()
  revalidatePath('/admin/clientes')
  return { success: true }
}

export async function toggleBlockCustomer(id: string, blocked: boolean) {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('customers').update({ active: !blocked }).eq('id', id)
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  
  const { error } = await query
  if (error) throw new Error('Falha ao atualizar')

  await revalidateAdmin()
  revalidatePath('/admin/clientes')
  return { success: true }
}

// ============== SERVIÇOS ==============

export async function getServices() {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('services').select('*').order('name', { ascending: true })
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  
  const { data } = await query
  return data || []
}

export async function addService(serviceData: any) {
  const salonId = await getSalonId()
  const insertData = salonId ? { ...serviceData, salon_id: salonId } : serviceData
  
  const { data, error } = await supabase
    .from('services')
    .insert([insertData])
    .select()
    .single()
  
  if (error) throw new Error('Falha ao criar serviço')
  
  await revalidateAdmin()
  revalidatePath('/admin/servicos')
  return data
}

export async function updateService(id: string, serviceData: any) {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('services').update(serviceData).eq('id', id)
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  
  const { data, error } = await query.select().single()
  
  if (error) throw new Error('Falha ao atualizar serviço')
  
  await revalidateAdmin()
  revalidatePath('/admin/servicos')
  return data
}

export async function deleteService(id: string) {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('services').delete().eq('id', id)
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  
  const { error } = await query
  if (error) throw new Error('Falha ao excluir serviço')

  await revalidateAdmin()
  revalidatePath('/admin/servicos')
  return { success: true }
}

// ============== DESPESAS ==============

export async function getExpenses(month?: number, year?: number, category?: string, paid?: boolean) {
  const salonId = await getSalonId()
  let q: any = supabase.from('despesas').select('*').order('date', { ascending: false })
  
  if (salonId) q = q.eq('salon_id', salonId)
  if (month && year) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]
    q = q.gte('date', startDate).lte('date', endDate)
  }
  
  if (category && category !== 'all') {
    q = q.eq('category', category)
  }
  
  if (paid !== undefined) {
    q = q.eq('paid', paid)
  }
  
  const { data } = await q
  return data || []
}

export async function addExpense(expenseData: {
  description: string
  amount: number
  category: string
  date: string
  due_date?: string | null
  paid?: boolean
  notes?: string | null
}) {
  const salonId = await getSalonId()
  const insertData = salonId ? { ...expenseData, salon_id: salonId, amount: Number(expenseData.amount), paid: expenseData.paid || false, paid_date: expenseData.paid ? new Date().toISOString().split('T')[0] : null } : { ...expenseData, amount: Number(expenseData.amount), paid: expenseData.paid || false, paid_date: expenseData.paid ? new Date().toISOString().split('T')[0] : null }
  
  const { data, error } = await supabase
    .from('despesas')
    .insert([insertData])
    .select()
    .single()
  
  if (error) throw new Error('Falha ao criar despesa: ' + error.message)
  
  await revalidateAdmin()
  revalidatePath('/admin/despesas')
  return data
}

export async function updateExpense(id: string, expenseData: {
  description?: string
  amount?: number
  category?: string
  date?: string
  due_date?: string | null
  paid?: boolean
  paid_date?: string | null
  notes?: string | null
}) {
  const salonId = await getSalonId()
  const updateData: any = { ...expenseData }
  if (expenseData.amount !== undefined) updateData.amount = Number(expenseData.amount)
  if (expenseData.paid !== undefined && expenseData.paid) {
    updateData.paid_date = expenseData.paid_date || new Date().toISOString().split('T')[0]
  }
  
  const baseQuery = supabase.from('despesas').update(updateData).eq('id', id)
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  
  const { data, error } = await query.select().single()
  
  if (error) throw new Error('Falha ao atualizar despesa: ' + error.message)
  
  await revalidateAdmin()
  revalidatePath('/admin/despesas')
  return data
}

export async function deleteExpense(id: string) {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('despesas').delete().eq('id', id)
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  
  const { error } = await query
  if (error) throw new Error('Falha ao excluir despesa: ' + error.message)

  await revalidateAdmin()
  revalidatePath('/admin/despesas')
  return { success: true }
}

export async function toggleExpensePaid(id: string, paid: boolean) {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('despesas').update({
    paid,
    paid_date: paid ? new Date().toISOString().split('T')[0] : null
  }).eq('id', id)
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  
  const { error } = await query
  if (error) throw new Error('Falha ao atualizar status: ' + error.message)

  await revalidateAdmin()
  revalidatePath('/admin/despesas')
  return { success: true }
}

// ============== VENDAS ==============

export async function getSales() {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('vendas').select('*, customers:customer_id(name), services:service_id(name)').order('created_at', { ascending: false })
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  
  const { data } = await query
  return data || []
}

export async function addSale(saleData: any) {
  const salonId = await getSalonId()
  const insertData = salonId ? { ...saleData, salon_id: salonId } : saleData
  
  const { data, error } = await supabase
    .from('vendas')
    .insert([insertData])
    .select()
    .single()
  
  if (error) throw new Error('Falha ao criar venda')
  
  await revalidateAdmin()
  revalidatePath('/admin/vendas')
  return data
}

export async function updateSale(id: string, saleData: any) {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('vendas').update(saleData).eq('id', id)
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  
  const { data, error } = await query.select().single()
  
  if (error) throw new Error('Falha ao atualizar venda')
  
  await revalidateAdmin()
  revalidatePath('/admin/vendas')
  return data
}

export async function deleteSale(id: string) {
  const salonId = await getSalonId()
  const baseQuery = supabase.from('vendas').delete().eq('id', id)
  const query = salonId ? baseQuery.eq('salon_id', salonId) : baseQuery
  
  const { error } = await query
  if (error) throw new Error('Falha ao excluir venda')

  await revalidateAdmin()
  revalidatePath('/admin/vendas')
  return { success: true }
}
