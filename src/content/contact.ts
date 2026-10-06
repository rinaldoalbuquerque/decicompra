// Formulário de contato (spec §6.11): envio por e-mail, nada gravado no banco; anti-spam com campo isca e
// limite de envios por IP

export const CONTACT_SUBJECTS = ['Dúvida', 'Correção de conteúdo', 'Parcerias/Publicidade', 'Privacidade', 'Outro'] as const

export type ContactData = { nome: string; email: string; assunto: (typeof CONTACT_SUBJECTS)[number]; mensagem: string }
export type ContactField = keyof ContactData

type RawContact = Partial<Record<ContactField | 'site', unknown>>

export type ContactValidation =
  | { ok: true; spam: boolean; data: ContactData }
  | { ok: false; errors: Partial<Record<ContactField, string>> }

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateContact(raw: RawContact): ContactValidation {
  const nome = text(raw.nome)
  const email = text(raw.email)
  const assunto = text(raw.assunto)
  const mensagem = text(raw.mensagem)
  const errors: Partial<Record<ContactField, string>> = {}
  if (nome.length < 2 || nome.length > 100) errors.nome = 'Informe seu nome.'
  if (!EMAIL.test(email) || email.length > 200) errors.email = 'Informe um e-mail válido.'
  if (!(CONTACT_SUBJECTS as readonly string[]).includes(assunto)) errors.assunto = 'Escolha um assunto.'
  if (mensagem.length < 10) errors.mensagem = 'Escreva uma mensagem com pelo menos 10 caracteres.'
  else if (mensagem.length > 5000) errors.mensagem = 'A mensagem pode ter até 5.000 caracteres.'
  if (Object.keys(errors).length > 0) return { ok: false, errors }
  // Campo isca escondido: pessoas não o veem; robôs costumam preencher
  return { ok: true, spam: text(raw.site) !== '', data: { nome, email, assunto: assunto as ContactData['assunto'], mensagem } }
}

// Limite por IP em memória. Na Vercel cada instância tem a sua contagem: é uma barreira contra abuso
// simples, sem gravar IPs em banco (spec §6.11: nenhum dado armazenado).
export function createRateLimiter({ limit, windowMs, now = Date.now }: { limit: number; windowMs: number; now?: () => number }) {
  const hits = new Map<string, number[]>()
  return {
    allow(key: string): boolean {
      const current = now()
      const recent = (hits.get(key) ?? []).filter((time) => current - time < windowMs)
      if (recent.length >= limit) {
        hits.set(key, recent)
        return false
      }
      recent.push(current)
      hits.set(key, recent)
      if (hits.size > 10_000) hits.delete(hits.keys().next().value!)
      return true
    },
  }
}

type Env = Record<string, string | undefined>
type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

const DEFAULT_FROM = 'DeciCompra <onboarding@resend.dev>'

// Envia pela API do Resend. Sem chave: na Vercel é erro de configuração; em desenvolvimento e nos
// testes a mensagem só é registrada no console.
export async function sendContactEmail(data: ContactData, options: { to: string; env?: Env; fetch?: FetchLike }): Promise<void> {
  const env = options.env ?? process.env
  const subject = `[DeciCompra] ${data.assunto}: ${data.nome}`
  const body = `Nome: ${data.nome}\nE-mail: ${data.email}\nAssunto: ${data.assunto}\n\n${data.mensagem}\n`
  const key = env.RESEND_API_KEY?.trim()
  if (!key) {
    if (env.VERCEL_ENV) throw new Error('RESEND_API_KEY não configurada')
    console.info(`[contato] (sem RESEND_API_KEY, e-mail não enviado) Para: ${options.to}\n${subject}\n${body}`)
    return
  }
  const response = await (options.fetch ?? fetch)('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM,
      to: [options.to],
      reply_to: data.email,
      subject,
      text: body,
    }),
  })
  if (!response.ok) throw new Error(`Falha ao enviar e-mail (${response.status})`)
}
