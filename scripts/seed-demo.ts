import { existsSync, readFileSync } from 'node:fs'

import dotenv from 'dotenv'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import { seedDemo } from '../src/seed/demo'
import { demoSeedBlocker } from '../src/seed/demo-guard'

const productionUrl = existsSync('.env.producao.local')
  ? (dotenv.parse(readFileSync('.env.producao.local')).DATABASE_URL ?? null)
  : null
const blocker = demoSeedBlocker(process.env, productionUrl)
if (blocker) {
  console.error(blocker)
  process.exit(1)
}

const payload = await getPayload({ config })
const result = await seedDemo(payload)
console.log(result.created ? 'Dados de demonstração criados.' : 'Dados de demonstração já existiam.')
process.exit(0)
