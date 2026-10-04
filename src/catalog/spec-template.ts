export type SpecType = 'number' | 'text' | 'boolean' | 'option'
export type SpecDirection = 'higher' | 'lower' | 'neutral'

export type SpecAttribute = {
  key: string
  label: string
  type: SpecType
  unit?: string | null
  options?: string[] | null
  group?: string | null
  direction?: SpecDirection | null
  highlight?: boolean | null
  comparable?: boolean | null
  required?: boolean | null
  perVariant?: boolean | null
}

export type SpecRow = { id?: string | null; key: string; label?: string | null; value?: string | null }

export type SpecScope = 'product' | 'variant'

export const KEY_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/

function inScope(attr: SpecAttribute, scope: SpecScope): boolean {
  return scope === 'variant' ? Boolean(attr.perVariant) : !attr.perVariant
}

function rowLabel(attr: SpecAttribute): string {
  return attr.unit ? `${attr.label} (${attr.unit})` : attr.label
}

// Uma linha por atributo do escopo, na ordem do modelo; valores existentes são mantidos
export function syncSpecRows(
  template: SpecAttribute[],
  rows: SpecRow[] | null | undefined,
  scope: SpecScope,
): SpecRow[] {
  const byKey = new Map((rows ?? []).map((row) => [row.key, row]))
  return template
    .filter((attr) => inScope(attr, scope))
    .map((attr) => {
      const existing = byKey.get(attr.key)
      return existing
        ? { ...existing, key: attr.key, label: rowLabel(attr) }
        : { key: attr.key, label: rowLabel(attr), value: null }
    })
}

export function validateSpecValue(attr: SpecAttribute, value: string | null | undefined): string | null {
  const v = value?.trim()
  if (!v) return null
  switch (attr.type) {
    case 'number':
      return /^-?\d+(?:[.,]\d+)?$/.test(v) ? null : `"${attr.label}" precisa ser um número.`
    case 'boolean':
      return ['sim', 'não', 'nao'].includes(v.toLowerCase()) ? null : `"${attr.label}" precisa ser "sim" ou "não".`
    case 'option': {
      const options = attr.options ?? []
      return options.includes(v) ? null : `"${attr.label}" precisa ser uma das opções: ${options.join(', ')}.`
    }
    default:
      return null
  }
}

// Forma canônica para guardar: número com ponto decimal, sim/não minúsculo, demais aparados
export function normalizeSpecValue(attr: SpecAttribute, value: string | null | undefined): string | null {
  const v = value?.trim()
  if (!v) return null
  if (attr.type === 'number' && /^-?\d+(?:[.,]\d+)?$/.test(v)) return v.replace(',', '.')
  if (attr.type === 'boolean') {
    const lower = v.toLowerCase()
    if (lower === 'sim') return 'sim'
    if (lower === 'não' || lower === 'nao') return 'não'
  }
  return v
}

export function normalizeSpecRows(template: SpecAttribute[], rows: SpecRow[]): SpecRow[] {
  const byKey = new Map(template.map((attr) => [attr.key, attr]))
  return rows.map((row) => {
    const attr = byKey.get(row.key)
    return attr ? { ...row, value: normalizeSpecValue(attr, row.value) } : row
  })
}

export function specValueErrors(template: SpecAttribute[], rows: SpecRow[]): string[] {
  const byKey = new Map(template.map((attr) => [attr.key, attr]))
  return rows.flatMap((row) => {
    const attr = byKey.get(row.key)
    const error = attr ? validateSpecValue(attr, row.value) : null
    return error ? [error] : []
  })
}

export function missingRequiredSpecs(template: SpecAttribute[], rows: SpecRow[], scope: SpecScope): string[] {
  const values = new Map(rows.map((row) => [row.key, row.value?.trim()]))
  return template.filter((attr) => inScope(attr, scope) && attr.required && !values.get(attr.key)).map((attr) => attr.label)
}

export function validateSpecTemplate(template: SpecAttribute[]): string[] {
  const errors: string[] = []
  const seen = new Set<string>()
  for (const attr of template) {
    if (seen.has(attr.key)) errors.push(`A chave "${attr.key}" está repetida.`)
    seen.add(attr.key)
    if (!KEY_PATTERN.test(attr.key)) {
      errors.push(`A chave "${attr.key}" é inválida: use letras minúsculas, números e _ (ex.: taxa_atualizacao).`)
    }
    if (attr.type === 'option' && (attr.options ?? []).length === 0) {
      errors.push(`O atributo "${attr.label}" é do tipo opção e precisa de pelo menos uma opção.`)
    }
  }
  return errors
}
