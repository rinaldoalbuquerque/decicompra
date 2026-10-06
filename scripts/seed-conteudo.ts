import { getPayload } from 'payload'

import config from '../src/payload.config'
import { EDITORIAL_PACKS, seedEditorialPack } from '../src/seed/editorial'

// Conteúdo de lançamento (Fase 4): cria o que falta de cada pacote, como rascunho / em revisão.
// Nunca altera o que já existe. Revise e publique pelo painel.
const payload = await getPayload({ config })
for (const [name, pack] of Object.entries(EDITORIAL_PACKS)) {
  const { created, skipped } = await seedEditorialPack(payload, pack)
  console.log(`\n${name}: ${created.length} criado(s), ${skipped.length} já existia(m)`)
  for (const item of created) console.log(`  + ${item}`)
}
process.exit(0)
