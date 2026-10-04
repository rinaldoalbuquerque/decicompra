import { describe, expect, it } from 'vitest'

import { DEFAULT_AUTHOR, seedAuthors } from '@/seed/authors'

import { getTestPayload } from './helpers/getTestPayload'

describe('Autores', () => {
  it('o seed cria a "Equipe DeciCompra" uma vez só', async () => {
    const payload = await getTestPayload()
    await seedAuthors(payload)
    const second = await seedAuthors(payload)
    expect(second.created).toBe(0)
    const { docs } = await payload.find({ collection: 'authors', where: { slug: { equals: DEFAULT_AUTHOR.slug } } })
    expect(docs).toHaveLength(1)
    expect(docs[0].name).toBe('Equipe DeciCompra')
  })

  it('gera o slug pelo nome', async () => {
    const payload = await getTestPayload()
    const doc = await payload.create({ collection: 'authors', data: { name: 'Autora de Teste Ç' } })
    expect(doc.slug).toBe('autora-de-teste-c')
    await payload.delete({ collection: 'authors', id: doc.id })
  })
})
