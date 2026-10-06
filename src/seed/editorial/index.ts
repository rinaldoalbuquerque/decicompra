import { airFryers } from './air-fryers'
import type { EditorialPack } from './types'

export type { EditorialPack } from './types'
export { seedEditorialPack } from './seed'

// Pacotes de conteúdo de lançamento (Fase 4), por subcategoria
export const EDITORIAL_PACKS: Record<string, EditorialPack> = {
  'air-fryers': airFryers,
}
