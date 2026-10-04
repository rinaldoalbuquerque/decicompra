// Fonte de verdade das cores (spec §7.1). O globals.css repete estes valores; um teste garante a paridade.
export const colors = {
  'azul-profundo': '#172554',
  'azul-eletrico': '#2563EB',
  verde: '#16A34A',
  'verde-texto': '#15803D',
  'cinza-claro': '#F1F5F9',
  branco: '#FFFFFF',
  texto: '#0F172A',
  'texto-suave': '#475569',
  negativo: '#DC2626',
} as const

export type ColorToken = keyof typeof colors
