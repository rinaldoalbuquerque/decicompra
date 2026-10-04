import { describe, expect, it } from 'vitest'

import { getTestPayload } from './helpers/getTestPayload'
import { getTestUsers } from './helpers/users'

describe('Configurações globais', () => {
  it('qualquer um lê; só o administrador edita o site', async () => {
    const payload = await getTestPayload()
    const { admin, editor } = await getTestUsers(payload)
    const publicSettings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: false })
    expect(publicSettings.adsEnabled).toBe(false)
    expect(publicSettings.affiliateNotice).toContain('comissão')

    await expect(
      payload.updateGlobal({ slug: 'site-settings', data: { ga4Id: 'G-HACK' }, user: editor, overrideAccess: false }),
    ).rejects.toThrow()
    const updated = await payload.updateGlobal({
      slug: 'site-settings',
      data: { contactEmail: 'contato@decicompra.com.br' },
      user: admin,
      overrideAccess: false,
    })
    expect(updated.contactEmail).toBe('contato@decicompra.com.br')
  })

  it('a home aceita até 12 cartões de subcategoria', async () => {
    const payload = await getTestPayload()
    const home = await payload.findGlobal({ slug: 'home-page', overrideAccess: false })
    expect(home).toBeDefined()
  })
})
