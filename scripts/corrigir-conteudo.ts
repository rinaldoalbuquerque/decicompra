import { getPayload } from 'payload'

import config from '../src/payload.config'
import { EDITORIAL_PACKS, refreshFromPack } from '../src/seed/editorial'

// Correções de 06/10/2026, conferidas nas páginas oficiais dos fabricantes. Só altera rascunhos que
// ninguém editou depois do carregamento; os editados aparecem no relatório para correção manual.
const CORRECOES: Record<string, Parameters<typeof refreshFromPack>[2]> = {
  'air-fryers': {
    products: ['philips-walita-serie-3000-xl-na341', 'philips-walita-serie-2000-xl-na230', 'britania-bfr50'],
    contents: ['mondial-grand-family-afn-50-bi-vs-philips-walita-serie-2000-xl-na230'],
  },
  'smart-tvs': {
    renamedProducts: { 'samsung-crystal-uhd-u8000f': 'samsung-crystal-uhd-u8100f' },
    products: ['lg-oled-evo-c5', 'samsung-neo-qled-qn85f', 'tcl-qd-mini-led-c6k', 'samsung-crystal-uhd-u8100f'],
    contents: ['melhores-smart-tvs', 'como-escolher-smart-tv'],
  },
  'furadeiras-e-parafusadeiras': { products: ['bosch-gsb-185-li', 'bosch-gsr-1000-smart', 'wap-bpf-12k3'] },
  'ar-condicionado': { products: ['lg-dual-inverter-compact-ai-12000', 'samsung-windfree-connect-12000', 'elgin-eco-inverter-ii-12000'] },
}

const payload = await getPayload({ config })
for (const [name, options] of Object.entries(CORRECOES)) {
  const { updated, skipped } = await refreshFromPack(payload, EDITORIAL_PACKS[name], options)
  console.log(`\n${name}: ${updated.length} corrigido(s)`)
  for (const item of updated) console.log(`  ✓ ${item}`)
  for (const item of skipped) console.log(`  ! ${item}`)
}
process.exit(0)
