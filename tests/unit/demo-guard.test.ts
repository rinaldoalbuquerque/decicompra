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

  it('reconhece o banco de produção escrito de outro jeito (pooler, parâmetros, aspas, maiúsculas)', () => {
    const prodFile = 'postgresql://u:p@ep-prod-123.sa-east-1.aws.neon.tech/neondb?sslmode=require'
    for (const url of [
      'postgresql://u:p@ep-prod-123-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      'postgres://outro:senha@EP-PROD-123.sa-east-1.aws.neon.tech:5432/neondb',
      ' "postgresql://u:p@ep-prod-123.sa-east-1.aws.neon.tech/neondb" ',
    ]) {
      expect(demoSeedBlocker({ DEMO_SEED: '1', DATABASE_URL: url }, prodFile)).toContain('produção')
    }
    expect(demoSeedBlocker({ DEMO_SEED: '1', DATABASE_URL: 'postgresql://u:p@ep-prod-123.sa-east-1.aws.neon.tech/outro' }, prodFile)).toBeNull()
  })

  it('libera em desenvolvimento', () => {
    expect(demoSeedBlocker({ DEMO_SEED: '1', DATABASE_URL: dev }, prod)).toBeNull()
    expect(demoSeedBlocker({ DEMO_SEED: '1', DATABASE_URL: dev }, null)).toBeNull()
  })
})
