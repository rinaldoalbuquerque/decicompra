import type { NumberFieldSingleValidation } from 'payload'

// Nota de 0 a 10 com no máximo uma casa decimal (spec §5.1); vazia é permitida no rascunho
export const validateScore: NumberFieldSingleValidation = (value) => {
  if (value === null || value === undefined) return true
  if (value < 0 || value > 10) return 'A nota precisa ficar entre 0 e 10.'
  return Math.abs(value * 10 - Math.round(value * 10)) < 1e-9 ? true : 'Use no máximo uma casa decimal (ex.: 8.5).'
}
