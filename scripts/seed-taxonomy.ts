import { getPayload } from 'payload'

import config from '../src/payload.config'
import { seedTaxonomy } from '../src/seed/taxonomy'

const payload = await getPayload({ config })
const result = await seedTaxonomy(payload)
console.log(`Categorias: ${result.created} criadas, ${result.existing} já existiam.`)
process.exit(0)
