export type ProductStatus = 'rascunho' | 'ficha' | 'analise'

export type PublicationInput = {
  status: ProductStatus
  finalScore: number | null
  criteriaCount?: number
  imageCount: number
  variantCount: number
  missingSpecs: string[]
  verdict?: string | null
  prosCount: number
  consCount: number
  metaDescription?: string | null
  sourcesCount: number
  reviewedAt?: string | null
}

// O que falta para o produto sair de rascunho (ficha) ou virar análise publicada (spec §4.5 e §5.7)
export function checkProductPublication(input: PublicationInput): string[] {
  if (input.status === 'rascunho') return []
  const errors: string[] = []

  if (input.criteriaCount === 0) errors.push('A subcategoria ainda não tem critérios de nota; cadastre-os antes de publicar.')
  else if (input.finalScore === null) errors.push('Preencha a nota de todos os critérios.')
  if (input.imageCount < 1) errors.push('Adicione pelo menos 1 imagem.')
  if (input.variantCount < 1) errors.push('Cadastre pelo menos 1 variante.')
  if (input.missingSpecs.length > 0) {
    errors.push(`Especificações obrigatórias sem valor: ${input.missingSpecs.join(', ')}.`)
  }

  if (input.status === 'analise') {
    const verdict = input.verdict?.trim() ?? ''
    if (!verdict) errors.push('Escreva o veredito (uma frase).')
    if (input.prosCount < 3 || input.prosCount > 6) errors.push('Liste de 3 a 6 pontos positivos.')
    if (input.consCount < 2 || input.consCount > 5) errors.push('Liste de 2 a 5 pontos negativos.')
    const meta = input.metaDescription?.trim() || verdict
    if (meta.length < 70 || meta.length > 160) {
      errors.push('A meta descrição (ou o veredito, se ela estiver vazia) precisa ter de 70 a 160 caracteres.')
    }
    if (input.sourcesCount < 1) errors.push('Cite pelo menos 1 fonte.')
    if (!input.reviewedAt) errors.push('Informe a data de revisão.')
  }

  return errors
}
