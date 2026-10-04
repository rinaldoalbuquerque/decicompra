import { isHttpsUrl } from './url'

export type R2Config = {
  bucket: string
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  publicUrl: string
}

export type AppEnv = {
  databaseUrl: string
  payloadSecret: string
  r2: R2Config | null
}

type EnvSource = Record<string, string | undefined>

const MIN_SECRET_LENGTH = 32

const R2_KEYS: Record<keyof R2Config, string> = {
  bucket: 'R2_BUCKET',
  endpoint: 'R2_ENDPOINT',
  accessKeyId: 'R2_ACCESS_KEY_ID',
  secretAccessKey: 'R2_SECRET_ACCESS_KEY',
  publicUrl: 'R2_PUBLIC_URL',
}

function read(source: EnvSource, key: string): string | undefined {
  const value = source[key]?.trim()
  return value ? value : undefined
}

function required(source: EnvSource, key: string): string {
  const value = read(source, key)
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${key}. Veja o arquivo .env.example.`)
  }
  return value
}

function readR2(source: EnvSource): R2Config | null {
  const fields = Object.keys(R2_KEYS) as (keyof R2Config)[]
  const values = fields.map((field) => [field, read(source, R2_KEYS[field])] as const)
  const missing = values.filter(([, value]) => !value).map(([field]) => R2_KEYS[field])

  if (missing.length === fields.length) return null
  if (missing.length > 0) {
    throw new Error(`Configuração do R2 incompleta. Faltando: ${missing.join(', ')}.`)
  }

  const config = Object.fromEntries(values) as R2Config
  for (const field of ['endpoint', 'publicUrl'] as const) {
    if (!isHttpsUrl(config[field])) {
      throw new Error(`${R2_KEYS[field]} precisa ser uma URL https:// completa (ex.: https://exemplo.com).`)
    }
  }
  return { ...config, publicUrl: config.publicUrl.replace(/\/+$/, '') }
}

// Lê e valida a configuração do ambiente; falha cedo com mensagem clara
export function readEnv(source: EnvSource = process.env): AppEnv {
  const databaseUrl = required(source, 'DATABASE_URL')
  const payloadSecret = required(source, 'PAYLOAD_SECRET')
  if (payloadSecret.length < MIN_SECRET_LENGTH) {
    throw new Error(`PAYLOAD_SECRET precisa ter pelo menos ${MIN_SECRET_LENGTH} caracteres.`)
  }

  const r2 = readR2(source)
  if (!r2 && source.VERCEL === '1') {
    throw new Error(
      'Na Vercel, as variáveis R2_* são obrigatórias: o disco do servidor é temporário e as imagens enviadas seriam perdidas.',
    )
  }

  return { databaseUrl, payloadSecret, r2 }
}
