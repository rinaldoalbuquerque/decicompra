import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { migrations } from '@/migrations'

let cached: Promise<Payload> | null = null

// Conecta ao banco de teste e aplica as migrações pendentes (idempotente).
// As migrações são passadas explicitamente: carregadas pelo Node puro, os imports de tipo dos arquivos gerados falham.
export function getTestPayload(): Promise<Payload> {
  cached ??= (async () => {
    const payload = await getPayload({ config: await config })
    // O tipo Migration do Payload declara args como unknown; as migrações geradas tipam os args concretos
    await payload.db.migrate({ migrations: migrations as never })
    return payload
  })()
  return cached
}
