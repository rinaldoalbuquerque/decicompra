import { beforeEach, describe, expect, it, vi } from 'vitest'

let fail = false
const findGlobal = vi.fn(async () => {
  if (fail) throw new Error('timeout')
  return { indexingEnabled: true, ga4Id: 'G-ABC123DEF4', adsenseClientId: '<script>', adSlots: [] }
})
vi.mock('@/lib/data/payload', () => ({ getSitePayload: async () => ({ findGlobal }) }))

const { getAdsEnabled, getPublicSettings } = await import('@/lib/data/settings')

beforeEach(() => {
  fail = false
})

const outcome = async <T,>(promise: Promise<T>) => {
  try {
    return { value: await promise }
  } catch (error) {
    return { error: (error as Error).message }
  }
}

describe('configurações públicas', () => {
  it('lê a chave de indexação e descarta IDs em formato inválido', async () => {
    const settings = await getPublicSettings()
    expect(settings.indexingEnabled).toBe(true)
    expect(settings.ga4Id).toBe('G-ABC123DEF4')
    expect(settings.adsenseClientId).toBeNull()
  })

  it('falha no banco NÃO vira "fora do Google": o erro sobe (o Next mantém a última versão boa da página)', async () => {
    fail = true
    expect(await outcome(getPublicSettings())).toEqual({ error: 'timeout' })
  })

  it('anúncios: em caso de erro, desligados', async () => {
    fail = true
    expect(await getAdsEnabled()).toBe(false)
  })
})
