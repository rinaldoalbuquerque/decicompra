import type { PayloadRequest } from 'payload'

import type { Criterion } from '../catalog/score'
import type { SpecAttribute } from '../catalog/spec-template'

// Modelo de especificações e critérios de nota de uma subcategoria
export async function loadSubcategoryRules(
  req: PayloadRequest,
  subcategoryId: number | string | null,
): Promise<{ template: SpecAttribute[]; criteria: Criterion[] }> {
  if (subcategoryId === null) return { template: [], criteria: [] }
  const subcategory = await req.payload.findByID({ collection: 'categories', id: subcategoryId, depth: 0, req })
  return {
    template: (subcategory.specTemplate ?? []) as unknown as SpecAttribute[],
    criteria: (subcategory.criteria ?? []) as unknown as Criterion[],
  }
}
