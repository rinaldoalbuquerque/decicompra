import type { Metadata } from 'next'
import React from 'react'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { inter, manrope } from '@/design/fonts'
import { JsonLd } from '@/components/site/JsonLd'
import { robotsMetadata } from '@/content/seo'
import { siteLd } from '@/content/structured-data'
import { getPublicTaxonomy, type PublicCategory } from '@/lib/data/lists'
import { getPublicSettings } from '@/lib/data/settings'
import { getSiteNavigation } from '@/lib/site-navigation'
import { siteUrl } from '@/lib/site-url'

import './globals.css'

// Metadados do site inteiro (spec §11). Indexação só depois do lançamento: a chave
// "Liberar o site para o Google" das Configurações decide (até lá, noindex em tudo).
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings()
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: 'DeciCompra · Compare. Entenda. Decida.', template: '%s | DeciCompra' },
    description: 'Análises independentes, comparativos e guias de compra para você escolher melhor.',
    robots: robotsMetadata(settings.indexingEnabled),
    ...(settings.searchConsoleVerification ? { verification: { google: settings.searchConsoleVerification } } : {}),
    openGraph: { siteName: 'DeciCompra', locale: 'pt_BR', type: 'website' },
    twitter: { card: 'summary_large_image' },
  }
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
        <JsonLd data={siteLd(siteUrl())} />
      </body>
    </html>
  )
}
