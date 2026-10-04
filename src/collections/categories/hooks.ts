import { APIError, ValidationError } from 'payload'
import type { CollectionBeforeChangeHook, CollectionBeforeDeleteHook } from 'payload'

import { validateCriteria, type Criterion } from '../../catalog/score'
import { validateSpecTemplate, type SpecAttribute } from '../../catalog/spec-template'
import { pick, relId } from '../../lib/relations'

export const validateCategory: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  const errors: { message: string; path: string }[] = []
  // Na criação o Payload também passa originalDoc (sem id); só a edição tem um documento existente
  const existingId = operation === 'update' ? relId(originalDoc?.id) : null
  const parentId = relId(pick(data, originalDoc, 'parent'))

  if (parentId === null) {
    // Categoria de 1º nível: modelo, critérios e âncora só existem em subcategorias
    data.specTemplate = []
    data.criteria = []
    data.isAnchor = false
    return data
  }

  if (existingId !== null && String(parentId) === String(existingId)) {
    errors.push({ path: 'parent', message: 'Uma categoria não pode ser mãe de si mesma.' })
  } else {
    const parent = await req.payload.findByID({ collection: 'categories', id: parentId, depth: 0, req })
    if (relId(parent.parent) !== null) {
      errors.push({ path: 'parent', message: 'A categoria-mãe precisa ser de 1º nível (só existem 2 níveis).' })
    }
  }

  if (existingId !== null) {
    const children = await req.payload.count({ collection: 'categories', where: { parent: { equals: existingId } }, req })
    if (children.totalDocs > 0) {
      errors.push({ path: 'parent', message: 'Esta categoria tem subcategorias e não pode virar subcategoria.' })
    }
  }

  const template = (pick<SpecAttribute[]>(data, originalDoc, 'specTemplate') ?? []) as SpecAttribute[]
  const criteria = (pick<Criterion[]>(data, originalDoc, 'criteria') ?? []) as Criterion[]
  errors.push(...validateSpecTemplate(template).map((message) => ({ path: 'specTemplate', message })))
  errors.push(...validateCriteria(criteria).map((message) => ({ path: 'criteria', message })))

  if (errors.length > 0) throw new ValidationError({ collection: 'categories', errors })
  return data
}

export const guardCategoryDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const children = await req.payload.count({ collection: 'categories', where: { parent: { equals: id } }, req })
  if (children.totalDocs > 0) {
    throw new APIError('Não é possível apagar: esta categoria tem subcategorias.', 409, undefined, true)
  }
}
