import { describe, expect, it } from 'vitest'

import { readEnv } from '@/lib/env'

const SECRET = 'a'.repeat(64)
const base = { DATABASE_URL: 'postgresql://u:p@host/db', PAYLOAD_SECRET: SECRET }
const r2 = {
  R2_BUCKET: 'decicompra-media-dev',
  R2_ENDPOINT: 'https://abc.r2.cloudflarestorage.com',
  R2_ACCESS_KEY_ID: 'key',
  R2_SECRET_ACCESS_KEY: 'secret',
  R2_PUBLIC_URL: 'https://pub-123.r2.dev/',
}

describe('readEnv', () => {
  it('lê banco e segredo e deixa o R2 nulo quando nenhuma variável R2 existe', () => {
    expect(readEnv(base)).toEqual({ databaseUrl: base.DATABASE_URL, payloadSecret: SECRET, r2: null })
  })

  it('trata variáveis R2 vazias ou só com espaços como ausentes', () => {
    const blanks = Object.fromEntries(Object.keys(r2).map((k) => [k, '  ']))
    expect(readEnv({ ...base, ...blanks }).r2).toBeNull()
  })

  it('lê o R2 completo e remove a barra final da URL pública', () => {
    expect(readEnv({ ...base, ...r2 }).r2).toEqual({
      bucket: 'decicompra-media-dev',
      endpoint: 'https://abc.r2.cloudflarestorage.com',
      accessKeyId: 'key',
      secretAccessKey: 'secret',
      publicUrl: 'https://pub-123.r2.dev',
    })
  })

  it.each(['DATABASE_URL', 'PAYLOAD_SECRET'])('falha nomeando %s quando ausente', (key) => {
    const source: Record<string, string | undefined> = { ...base }
    delete source[key]
    expect(() => readEnv(source)).toThrow(`Variável de ambiente obrigatória ausente: ${key}`)
  })

  it('falha quando DATABASE_URL está em branco', () => {
    expect(() => readEnv({ ...base, DATABASE_URL: '   ' })).toThrow('DATABASE_URL')
  })

  it('falha quando PAYLOAD_SECRET tem menos de 32 caracteres', () => {
    expect(() => readEnv({ ...base, PAYLOAD_SECRET: 'curto' })).toThrow(
      'PAYLOAD_SECRET precisa ter pelo menos 32 caracteres',
    )
  })

  it('falha listando as variáveis que faltam quando o R2 está configurado pela metade', () => {
    const partial = { ...base, R2_BUCKET: r2.R2_BUCKET, R2_ENDPOINT: r2.R2_ENDPOINT }
    expect(() => readEnv(partial)).toThrow(
      'Configuração do R2 incompleta. Faltando: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL.',
    )
  })

  it('exige o R2 quando roda na Vercel', () => {
    expect(() => readEnv({ ...base, VERCEL: '1' })).toThrow('Na Vercel, as variáveis R2_* são obrigatórias')
  })

  it('aceita a Vercel quando o R2 está completo', () => {
    expect(readEnv({ ...base, ...r2, VERCEL: '1' }).r2?.bucket).toBe('decicompra-media-dev')
  })
})
