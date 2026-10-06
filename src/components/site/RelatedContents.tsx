import Link from 'next/link'

import { contentPath } from '@/content/paths'
import { getRelatedContents } from '@/lib/data/contents'
import type { Content } from '@/payload-types'

import { Section } from './blocks'

const TYPE_LABEL: Record<Content['type'], string> = {
  melhores: 'Melhores',
  comparativo: 'Comparativo',
  guia: 'Guia',
  entenda: 'Entenda',
}

// Bloco "Relacionados" dos conteúdos (spec §6.5–6.7): mesma subcategoria ou mesmos produtos
export async function RelatedContents({ content }: { content: Content }) {
  const related = (await getRelatedContents(content)).filter((item) => item.slug)
  if (related.length === 0) return null
  return (
    <Section id="relacionados" title="Relacionados">
      <ul className="grid gap-3 sm:grid-cols-2">
        {related.map((item) => (
          <li key={item.id}>
            <Link
              href={contentPath(item.type, item.slug!)}
              className="block h-full rounded-xl border border-slate-200 p-4 hover:border-azul-eletrico"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">{TYPE_LABEL[item.type]}</span>
              <span className="mt-1 block font-semibold text-azul-eletrico">{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
