import type { Metadata } from 'next'
import React from 'react'

import { inter, manrope } from '@/design/fonts'

import './globals.css'

export const metadata: Metadata = {
  title: { default: 'DeciCompra · Compare. Entenda. Decida.', template: '%s | DeciCompra' },
  description: 'Análises independentes, comparativos e guias de compra para você escolher melhor.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${manrope.variable}`}>
      <body className="bg-branco text-texto antialiased">
        <main>{children}</main>
      </body>
    </html>
  )
}
