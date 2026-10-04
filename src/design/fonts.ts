import { Inter, Manrope } from 'next/font/google'

// Baixadas no build e servidas pelo próprio site (sem requisição ao Google no navegador)
export const manrope = Manrope({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})
