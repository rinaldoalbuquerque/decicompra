import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CategoryFilter } from '@/components/site/CategoryFilter'
import { ContentCard } from '@/components/site/ContentCard'
import { EmptyState } from '@/components/site/EmptyState'
import { ListingPage } from '@/components/site/ListingPage'
import { Pagination } from '@/components/site/Pagination'
import { SubcategoryCard } from '@/components/site/SubcategoryCard'
import type { ContentCardData } from '@/lib/data/lists'

const item: ContentCardData = {
  id: 1,
  type: 'guia',
  slug: 'como-escolher',
  title: 'Como escolher uma TV',
  summary: 'O que olhar antes de comprar.',
  publishAt: '2026-10-01T12:00:00.000Z',
  reviewedAt: '2026-10-02T12:00:00.000Z',
  href: '/guias/como-escolher/',
  subcategoryName: 'Smart TVs',
}

describe('Pagination', () => {
  it('não aparece com uma página só', () => {
    const { container } = render(<Pagination basePath="/melhores/" page={1} pages={1} />)
    expect(container.innerHTML).toBe('')
  })

  it('página 1 sem ?pagina, anterior/próxima com rel e a atual marcada', () => {
    render(<Pagination basePath="/melhores/" page={2} pages={3} />)
    const prev = screen.getByRole('link', { name: /Anterior/ })
    const next = screen.getByRole('link', { name: /Próxima/ })
    expect(prev.getAttribute('href')).toBe('/melhores/')
    expect(prev.getAttribute('rel')).toBe('prev')
    expect(next.getAttribute('href')).toBe('/melhores/?pagina=3')
    expect(next.getAttribute('rel')).toBe('next')
    expect(screen.getByRole('link', { name: 'Página 2' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Página 1' }).getAttribute('href')).toBe('/melhores/')
  })

  it('preserva o filtro de categoria', () => {
    render(<Pagination basePath="/guias/" page={1} pages={2} extra={{ categoria: 'tecnologia' }} />)
    expect(screen.getByRole('link', { name: /Próxima/ }).getAttribute('href')).toBe('/guias/?categoria=tecnologia&pagina=2')
    expect(screen.queryByRole('link', { name: /Anterior/ })).toBeNull()
  })
})

describe('CategoryFilter', () => {
  it('"Todas" e cada categoria, com a ativa marcada', () => {
    render(
      <CategoryFilter
        basePath="/guias/"
        categories={[
          { slug: 'tecnologia', name: 'Tecnologia' },
          { slug: 'eletroportateis', name: 'Eletroportáteis' },
        ]}
        active="tecnologia"
      />,
    )
    expect(screen.getByRole('link', { name: 'Todas' }).getAttribute('href')).toBe('/guias/')
    const active = screen.getByRole('link', { name: 'Tecnologia' })
    expect(active.getAttribute('href')).toBe('/guias/?categoria=tecnologia')
    expect(active.getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Eletroportáteis' }).getAttribute('aria-current')).toBeNull()
  })
})

describe('ContentCard', () => {
  it('mostra tipo, título com link, resumo e subcategoria', () => {
    render(<ContentCard item={item} />)
    expect(screen.getByRole('link', { name: 'Como escolher uma TV' }).getAttribute('href')).toBe('/guias/como-escolher/')
    expect(screen.getByText('Guia')).toBeTruthy()
    expect(screen.getByText('O que olhar antes de comprar.')).toBeTruthy()
    expect(screen.getByText(/Smart TVs/)).toBeTruthy()
  })
})

describe('SubcategoryCard e EmptyState', () => {
  it('cartão com ícone, nome e descrição', () => {
    render(<SubcategoryCard href="/tvs/smart-tvs/" name="Smart TVs" description="TVs com apps" icon="📺" />)
    expect(screen.getByRole('link', { name: /Smart TVs/ }).getAttribute('href')).toBe('/tvs/smart-tvs/')
    expect(screen.getByText('TVs com apps')).toBeTruthy()
  })

  it('estado vazio com mensagem e ação', () => {
    render(<EmptyState title="Nada por aqui" action={{ label: 'Ver todos', href: '/guias/' }} />)
    expect(screen.getByText('Nada por aqui')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ver todos' }).getAttribute('href')).toBe('/guias/')
  })
})

describe('ListingPage', () => {
  it('trilha, título h1, introdução e conteúdo', () => {
    render(
      <ListingPage breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Guias' }]} title="Guias de compra" intro="Tudo antes de comprar.">
        <p>itens</p>
      </ListingPage>,
    )
    expect(screen.getByRole('navigation', { name: 'Trilha' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: 'Guias de compra' })).toBeTruthy()
    expect(screen.getByText('Tudo antes de comprar.')).toBeTruthy()
    expect(screen.getByText('itens')).toBeTruthy()
  })
})
