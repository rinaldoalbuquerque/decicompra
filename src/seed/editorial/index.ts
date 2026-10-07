import { airFryers } from './air-fryers'
import { arCondicionado } from './ar-condicionado'
import { furadeiras } from './furadeiras'
import { notebooks } from './notebooks'
import { smartTvs } from './smart-tvs'
import type { EditorialPack } from './types'

export type { EditorialPack } from './types'
export { refreshFromPack, seedEditorialPack } from './seed'

// Pacotes de conteúdo de lançamento (Fase 4), por subcategoria
export const EDITORIAL_PACKS: Record<string, EditorialPack> = {
  'air-fryers': airFryers,
  'smart-tvs': smartTvs,
  notebooks,
  'furadeiras-e-parafusadeiras': furadeiras,
  'ar-condicionado': arCondicionado,
}
