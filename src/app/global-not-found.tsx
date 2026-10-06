import type { Metadata } from 'next'

import './(frontend)/globals.css'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { NotFoundContent } from '@/components/site/NotFoundContent'
import { inter, manrope } from '@/design/fonts'
import { getPublicTaxonomy, type PublicCategory } from '@/lib/data/lists'
import { getSiteNavigation } from '@/lib/site-navigation'

export const metadata: Metadata = { title: 'Página não encontrada | DeciCompra' }

// 404 de endereços que não casam com nenhuma rota. O app tem dois layouts raiz (site e painel),
// então o Next usa este arquivo, que monta a própria página com o cabeçalho e o rodapé do site.
export default async function GlobalNotFound() {
  const [navigation, categories] = await Promise.all([getSiteNavigation(), getPublicTaxonomy().catch((): PublicCategory[] => [])])
  return (
    <html lang="pt-BR" className={`${inter.variable} ${manrope.variable}`}>
      <body className="flex min-h-screen flex-col bg-branco text-texto antialiased">
        <SiteHeader links={navigation.mainNav} categories={categories} />
        <main id="conteudo" className="flex-1">
          <NotFoundContent />
        </main>
        <SiteFooter columns={navigation.footerColumns} />
      </body>
    </html>
  )
}
