import type { Metadata } from 'next'
import React from 'react'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { inter, manrope } from '@/design/fonts'
import { getPublicTaxonomy, type PublicCategory } from '@/lib/data/lists'
import { getSiteNavigation } from '@/lib/site-navigation'

import './globals.css'

export const metadata: Metadata = {
  title: { default: 'DeciCompra · Compare. Entenda. Decida.', template: '%s | DeciCompra' },
  description: 'Análises independentes, comparativos e guias de compra para você escolher melhor.',
  // Provisório até o lançamento: a política de indexação definitiva é da Fase 3 (spec §5.5 e §11)
  robots: { index: false, follow: false },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [navigation, categories] = await Promise.all([getSiteNavigation(), getPublicTaxonomy().catch((): PublicCategory[] => [])])
  return (
    <html lang="pt-BR" className={`${inter.variable} ${manrope.variable}`}>
      <body className="flex min-h-screen flex-col bg-branco text-texto antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-branco focus:px-4 focus:py-2 focus:text-azul-profundo"
        >
          Pular para o conteúdo
        </a>
        <SiteHeader links={navigation.mainNav} categories={categories} />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <SiteFooter columns={navigation.footerColumns} />
      </body>
    </html>
  )
}
