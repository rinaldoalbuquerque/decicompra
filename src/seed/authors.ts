import type { Payload } from 'payload'

// Autoria pela marca (spec §0 e §4.10)
export const DEFAULT_AUTHOR = {
  name: 'Equipe DeciCompra',
  slug: 'equipe-decicompra',
  bio: 'Conteúdos produzidos por pesquisa estruturada, com apoio de IA e revisão humana obrigatória antes da publicação.',
}

export async function seedAuthors(payload: Payload): Promise<{ created: number }> {
  const { totalDocs } = await payload.count({ collection: 'authors', where: { slug: { equals: DEFAULT_AUTHOR.slug } } })
  if (totalDocs > 0) return { created: 0 }
  await payload.create({ collection: 'authors', data: DEFAULT_AUTHOR })
  return { created: 1 }
}
