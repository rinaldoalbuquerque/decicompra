'use server'

import { headers } from 'next/headers'

import { createRateLimiter, sendContactEmail, validateContact, type ContactField } from '@/content/contact'
import { getContactEmail } from '@/lib/data/settings'

export type ContactState = {
  status: 'idle' | 'sent' | 'error'
  message?: string
  errors?: Partial<Record<ContactField, string>>
  values?: Partial<Record<ContactField, string>>
}

const limiter = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 })

// Envio do formulário de contato (spec §6.11): valida, barra robôs e excesso, e manda por e-mail
export async function sendContact(_previous: ContactState, formData: FormData): Promise<ContactState> {
  const field = (name: string) => {
    const value = formData.get(name)
    return typeof value === 'string' ? value : ''
  }
  const values = { nome: field('nome'), email: field('email'), assunto: field('assunto'), mensagem: field('mensagem') }
  const result = validateContact({ ...values, site: field('site') })
  if (!result.ok) return { status: 'error', message: 'Confira os campos destacados.', errors: result.errors, values }
  // Robô: responde como se tivesse enviado, sem enviar
  if (result.spam) return { status: 'sent' }

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconhecido'
  if (!limiter.allow(ip)) return { status: 'error', message: 'Muitas mensagens em pouco tempo. Tente de novo mais tarde.', values }

  const to = await getContactEmail()
  if (!to) return { status: 'error', message: 'O formulário está temporariamente indisponível. Tente de novo mais tarde.', values }
  try {
    await sendContactEmail(result.data, { to })
    return { status: 'sent' }
  } catch (error) {
    console.error('[contato] falha no envio:', error)
    return { status: 'error', message: 'Não foi possível enviar agora. Tente de novo em alguns minutos.', values }
  }
}
