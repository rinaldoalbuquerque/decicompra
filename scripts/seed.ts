import { getPayload } from 'payload'

import config from '../src/payload.config'
import { seedAuthors } from '../src/seed/authors'
import { seedTaxonomy } from '../src/seed/taxonomy'

// Dados iniciais idempotentes: categorias da spec e o autor "Equipe DeciCompra"
const payload = await getPayload({ config })
const taxonomy = await seedTaxonomy(payload)
console.log(`Categorias: ${taxonomy.created} criadas, ${taxonomy.existing} já existiam.`)
const authors = await seedAuthors(payload)
console.log(`Autores: ${authors.created} criado(s).`)
process.exit(0)
