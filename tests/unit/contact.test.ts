import { describe, expect, it, vi } from 'vitest'

import { CONTACT_SUBJECTS, createRateLimiter, sendContactEmail, validateContact } from '@/content/contact'

const valid = { nome: 'Maria Silva', email: 'maria@exemplo.com', assunto: 'Dúvida', mensagem: 'Gostaria de saber mais sobre as notas.', confirmar_contato_hp: '' }

describe('formulário de contato: validação', () => {
  it('assuntos da spec §6.11', () => {
    expect(CONTACT_SUBJECTS).toEqual(['Dúvida', 'Correção de conteúdo', 'Parcerias/Publicidade', 'Privacidade', 'Outro'])
  })

  it('dados válidos passam, sem espaços sobrando', () => {
    expect(validateContact({ ...valid, nome: '  Maria Silva  ' })).toEqual({
      ok: true,
      spam: false,
      data: { nome: 'Maria Silva', email: 'maria@exemplo.com', assunto: 'Dúvida', mensagem: 'Gostaria de saber mais sobre as notas.' },
    })
  })

  it('erros por campo', () => {
    const result = validateContact({ nome: 'M', email: 'nao-e-email', assunto: 'Qualquer', mensagem: 'curta', confirmar_contato_hp: '' })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(Object.keys(result.errors).sort()).toEqual(['assunto', 'email', 'mensagem', 'nome'])
  })

  it('um campo chamado "site" (que o preenchimento automático pode preencher) não conta como isca', () => {
    expect(validateContact({ ...valid, site: 'https://meusite.com' } as never)).toMatchObject({ ok: true, spam: false })
  })

  it('quebras de linha e tabulações no nome viram espaço (o nome vai no assunto do e-mail)', () => {
    const result = validateContact({ ...valid, nome: 'Maria\r\nBcc: x@y.com\tSilva' })
    expect(result).toMatchObject({ ok: true, data: { nome: 'Maria Bcc: x@y.com Silva' } })
  })

  it('mensagem enorme é recusada', () => {
    const result = validateContact({ ...valid, mensagem: 'x'.repeat(5001) })
    expect(result.ok).toBe(false)
  })

  it('campo isca preenchido (robô) é marcado como spam', () => {
    const result = validateContact({ ...valid, confirmar_contato_hp: 'http://spam.com' })
    expect(result).toMatchObject({ ok: true, spam: true })
  })
})

describe('limite de envios por IP', () => {
  it('5 por hora por IP; depois libera', () => {
    let now = 0
    const limiter = createRateLimiter({ limit: 5, windowMs: 3_600_000, now: () => now })
    for (let i = 0; i < 5; i++) expect(limiter.allow('1.1.1.1')).toBe(true)
    expect(limiter.allow('1.1.1.1')).toBe(false)
    expect(limiter.allow('2.2.2.2')).toBe(true)
    now = 3_600_001
    expect(limiter.allow('1.1.1.1')).toBe(true)
  })
})

describe('envio por e-mail', () => {
  const data = { nome: 'Maria', email: 'maria@exemplo.com', assunto: 'Privacidade' as const, mensagem: 'Quero meus dados.' }

  it('com RESEND_API_KEY, envia pela API com resposta para o visitante', async () => {
    const fetch = vi.fn(async () => new Response('{}', { status: 200 }))
    await sendContactEmail(data, { to: 'dono@exemplo.com', env: { RESEND_API_KEY: 'chave' }, fetch })
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.resend.com/emails')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer chave')
    const body = JSON.parse(String(init.body))
    expect(body).toMatchObject({ to: ['dono@exemplo.com'], reply_to: 'maria@exemplo.com', subject: '[DeciCompra] Privacidade: Maria' })
    expect(body.from).toContain('onboarding@resend.dev')
    expect(body.text).toContain('Quero meus dados.')
  })

  it('remetente configurável (domínio próprio verificado)', async () => {
    const fetch = vi.fn(async () => new Response('{}', { status: 200 }))
    await sendContactEmail(data, { to: 'dono@exemplo.com', env: { RESEND_API_KEY: 'k', CONTACT_FROM_EMAIL: 'DeciCompra <contato@decicompra.com.br>' }, fetch })
    expect(JSON.parse(String((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body)).from).toBe('DeciCompra <contato@decicompra.com.br>')
  })

  it('erro da API vira falha', async () => {
    const fetch = vi.fn(async () => new Response('erro', { status: 500 }))
    await expect(sendContactEmail(data, { to: 'dono@exemplo.com', env: { RESEND_API_KEY: 'k' }, fetch })).rejects.toThrow()
  })

  it('sem chave: na Vercel falha; fora dela (dev/testes) só registra no console', async () => {
    const fetch = vi.fn()
    await expect(sendContactEmail(data, { to: 'dono@exemplo.com', env: { VERCEL_ENV: 'production' }, fetch })).rejects.toThrow()
    const log = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    await sendContactEmail(data, { to: 'dono@exemplo.com', env: {}, fetch })
    expect(fetch).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalled()
    log.mockRestore()
  })
})
