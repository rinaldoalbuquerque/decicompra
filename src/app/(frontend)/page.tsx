import type { Metadata } from 'next'
import Link from 'next/link'

import { Hero } from '@/components/home/Hero'
import { AdSlot } from '@/components/site/AdSlot'
import { PAGE_CONTAINER, Section } from '@/components/site/blocks'
import { ContentGrid } from '@/components/site/ContentCard'
import { ProductGrid } from '@/components/site/ProductGrid'
import { SubcategoryCard } from '@/components/site/SubcategoryCard'
import { getHomeData } from '@/lib/data/home'
import type { ContentCardData } from '@/lib/data/lists'
import { getAdsEnabled } from '@/lib/data/settings'
import { pageMetadata } from '@/lib/metadata'

export const revalidate = 3600

export const metadata: Metadata = {
  ...pageMetadata({ path: '/', title: 'DeciCompra · Compare. Entenda. Decida.', ownImage: true }),
  // Título completo, sem o sufixo "| DeciCompra" do modelo
  title: { absolute: 'DeciCompra · Compare. Entenda. Decida.' },
}

const TRUST = [
  { title: 'Independente', text: 'Não vendemos produtos nem aceitamos pagamento por notas.' },
  { title: 'Critérios públicos', text: 'Cada nota segue critérios e pesos que você pode consultar.' },
  { title: 'Transparente', text: 'Avisamos quando um link pode nos render comissão.' },
  { title: 'Atualizado', text: 'Revisamos preços e conteúdos periodicamente.' },
]

function ContentSection({ id, title, items, more }: { id: string; title: string; items: ContentCardData[]; more: string }) {
  if (items.length === 0) return null
  return (
    <Section id={id} title={title}>
      <ContentGrid items={items} />
      <p className="mt-4">
        <Link href={more} className="font-semibold text-azul-eletrico hover:underline">
          Ver todos →
        </Link>
      </p>
    </Section>
  )
}

// Home (spec §6.1, versão 2 aprovada)
export default async function HomePage() {
  const [data, adsEnabled] = await Promise.all([getHomeData(), getAdsEnabled()])

  return (
    <>
      <Hero chips={data.chips} image={data.heroImage} background={data.heroBackground} />

      <div className={PAGE_CONTAINER}>
        {data.subcategories.length + data.categories.length > 0 ? (
          <Section id="procurando" title="O que você está procurando?">
            {data.subcategories.length > 0 ? (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.subcategories.map((sub) => (
                  <li key={sub.id}>
                    <SubcategoryCard href={sub.href} name={sub.name} description={sub.description} icon={sub.icon} />
                  </li>
                ))}
              </ul>
            ) : null}
            {data.categories.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {data.categories.map((category) => (
                  <li key={category.slug}>
                    <Link href={category.href} className="font-semibold text-azul-eletrico hover:underline">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </Section>
        ) : null}

        <ContentSection id="comparativos" title="Comparativos em destaque" items={data.comparisons} more="/comparar/" />
        <ContentSection id="melhores" title="Melhores do momento" items={data.best} more="/melhores/" />

        <AdSlot placement="home" enabled={adsEnabled} />

        <ContentSection id="guias" title="Guias de compra" items={data.guides} more="/guias/" />

        {data.recent.length > 0 ? (
          <Section id="recentes" title="Análises recentes">
            <ProductGrid items={data.recent} />
          </Section>
        ) : null}

        <ContentSection id="entenda" title="Entenda antes de comprar" items={data.explainers} more="/entenda/" />

        <Section id="por-que-confiar" title="Por que confiar no DeciCompra">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((item) => (
              <li key={item.title} className="rounded-xl bg-cinza-claro p-4">
                <p className="font-bold">{item.title}</p>
                <p className="mt-1 text-sm text-texto-suave">{item.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            <Link href="/como-avaliamos/" className="underline">
              Como avaliamos os produtos
            </Link>
          </p>
        </Section>
      </div>
    </>
  )
}
