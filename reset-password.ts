import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ssdqkvsbhebrqihoekzz.supabase.co'
const supabaseServiceKey = 'sbp_af83d57a1f0e37e51fd995a2fb63ec5f340cab73'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const email = 'suanne.chagas4@gmail.com'
const newPassword = 'Salao2025'
const crypto = require('crypto')
const hash = crypto.createHash('sha256').update(newPassword + 'gestao-esalao-saas-2024-secure').digest('hex')

async function resetPassword() {
  const { data, error } = await supabase
    .from('salons')
    .update({ owner_password: hash })
    .eq('owner_email', email)
    .select()

  if (error) {
    console.error('Erro:', error.message)
    return
  }

  console.log('Senha redefinida com sucesso!')
  console.log('Email:', email)
  console.log('Nova senha:', newPassword)
}

resetPassword()
