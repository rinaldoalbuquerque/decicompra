import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

// Instância do Payload para as páginas públicas (as consultas usam overrideAccess: false)
export function getSitePayload(): Promise<Payload> {
  return getPayload({ config })
}
