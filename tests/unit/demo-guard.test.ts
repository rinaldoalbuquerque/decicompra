import { describe, expect, it } from 'vitest'

import { demoSeedBlocker } from '@/seed/demo-guard'

const dev = 'postgresql://u:p@ep-dev.neon.tech/neondb'
const prod = 'postgresql://u:p@ep-prod.neon.tech/neondb'

describe('demoSeedBlocker', () => {
  it('exige DEMO_SEED=1', () => {
    expect(demoSeedBlocker({ DATABASE_URL: dev }, null)).toContain('DEMO_SEED=1')
  })

  it('recusa o banco de produção e o ambiente de produção da Vercel', () => {
    expect(demoSeedBlocker({ DEMO_SEED: '1', DATABASE_URL: prod }, prod)).toContain('produção')
    expect(demoSeedBlocker({ DEMO_SEED: '1', DATABASE_URL: dev, VERCEL_ENV: 'production' }, null)).toContain('produção')
  })

  it('libera em desenvolvimento', () => {
    expect(demoSeedBlocker({ DEMO_SEED: '1', DATABASE_URL: dev }, prod)).toBeNull()
    expect(demoSeedBlocker({ DEMO_SEED: '1', DATABASE_URL: dev }, null)).toBeNull()
  })
})
