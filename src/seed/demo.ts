import type { Payload } from 'payload'
import sharp from 'sharp'

import type { SpecAttribute } from '../catalog/spec-template'
import { block, heading, lexicalDoc, paragraph } from './lexical'
import { seedAuthors } from './authors'
import { seedTaxonomy } from './taxonomy'

// Dados de demonstração para desenvolvimento e para os testes de navegador. Nunca na produção.
export const DEMO_SLUGS = {
  products: ['demo-tv-alfa', 'demo-tv-beta', 'demo-tv-gama'],
  contents: ['demo-tv-alfa-vs-demo-tv-beta', 'demo-melhores-tvs', 'demo-guia-como-escolher-tv', 'demo-entenda-oled-vs-qled'],
}

const TV_TEMPLATE: SpecAttribute[] = [
  { key: 'painel', label: 'Painel', type: 'option', options: ['OLED', 'QLED', 'LED'], required: true, comparable: true, highlight: true, group: 'Imagem' },
  { key: 'taxa_atualizacao', label: 'Taxa de atualização', type: 'number', unit: 'Hz', direction: 'higher', comparable: true, group: 'Imagem' },
  { key: 'hdr', label: 'HDR', type: 'text', comparable: true, group: 'Imagem' },
  { key: 'tamanho', label: 'Tamanho', type: 'number', unit: '"', perVariant: true, required: true, comparable: true, group: 'Geral' },
  { key: 'consumo', label: 'Consumo', type: 'number', unit: 'W', direction: 'lower', perVariant: true, comparable: true, group: 'Geral' },
]

const PUBLISH = {
  sources: [{ title: 'Ficha técnica do fabricante (demonstração)', url: 'https://www.exemplo.com.br/ficha' }],
  reviewedAt: new Date().toISOString(),
}

async function upsertBySlug<T extends { id: number }>(
  payload: Payload,
  collection: 'brands' | 'stores',
  slug: string,
  data: Record<string, unknown>,
): Promise<T> {
  const { docs } = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  if (docs[0]) return docs[0] as unknown as T
  return (await payload.create({ collection, data: { slug, ...data } as never })) as unknown as T
}

async function demoImage(payload: Payload, color: string, name: string) {
  const data = await sharp({ create: { width: 1600, height: 1000, channels: 3, background: color } }).png().toBuffer()
  return payload.create({
    collection: 'media',
    data: { alt: `Imagem ilustrativa da ${name} (demonstração)`, credit: 'DeciCompra (demonstração)' },
    file: { data, mimetype: 'image/png', name: `demo-${name.toLowerCase().replace(/\s+/g, '-')}.png`, size: data.length },
  })
}

const scores = (values: number[]) =>
  ['imagem', 'recursos_smart', 'som', 'confiabilidade_suporte', 'custo_beneficio'].map((key, i) => ({
    key,
    score: values[i],
    justification: 'Avaliação de demonstração baseada em especificações e reviews especializados.',
  }))

export async function seedDemo(payload: Payload): Promise<{ created: boolean }> {
  await seedTaxonomy(payload)
  await seedAuthors(payload)
  // Endereço antigo de demonstração (testes do redirecionamento 301)
  const redirect = { from: '/produtos/demo-tv-antiga/', to: '/produtos/demo-tv-alfa/' }
  const { totalDocs: hasRedirect } = await payload.count({ collection: 'redirects', where: { from: { equals: redirect.from } } })
  if (hasRedirect === 0) await payload.create({ collection: 'redirects', data: redirect as never })
  // Idempotente por slug: só cria o que falta (um item apagado é recriado)
  let created = false
  const ensure = async <T extends { id: number }>(collection: 'products' | 'contents', slug: string, make: () => Promise<T>): Promise<T> => {
    const { docs } = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    if (docs[0]) return docs[0] as unknown as T
    created = true
    return make()
  }

  const { docs: subs } = await payload.find({ collection: 'categories', where: { slug: { equals: 'smart-tvs' } }, limit: 1 })
  const subcategory = subs[0]
  if (!subcategory) throw new Error('Subcategoria smart-tvs não encontrada (rode pnpm seed).')
  if ((subcategory.specTemplate ?? []).length === 0) {
    await payload.update({ collection: 'categories', id: subcategory.id, data: { specTemplate: TV_TEMPLATE } })
  }

  const brand = await upsertBySlug<{ id: number }>(payload, 'brands', 'demo-eletronicos', { name: 'Demo Eletrônicos' })
  const storeA = await upsertBySlug<{ id: number; name: string }>(payload, 'stores', 'demo-loja-a', { name: 'Loja Demo A' })
  const storeB = await upsertBySlug<{ id: number; name: string }>(payload, 'stores', 'demo-loja-b', { name: 'Loja Demo B' })

  const createProduct = (name: string, slug: string) =>
    payload.create({ collection: 'products', data: { name, slug, brand: brand.id, subcategory: subcategory.id, status: 'rascunho' } })
  const defaultVariant = async (productId: number) =>
    (await payload.find({ collection: 'variants', where: { product: { equals: productId } }, limit: 1 })).docs[0]

  const verdict = (name: string) =>
    `A ${name} entrega imagem excelente para filmes e games, com bom equilíbrio entre recursos e preço no Brasil.`
  const analysis = (name: string) => ({
    verdict: verdict(name),
    pros: [{ text: 'Contraste muito alto' }, { text: 'Boa para games' }, { text: 'Sistema rápido' }],
    cons: [{ text: 'Brilho limitado em sala clara' }, { text: 'Som apenas razoável' }],
    recommendedFor: 'Quem assiste a filmes à noite e joga em console.',
    avoidIf: 'A sala é muito iluminada durante o dia.',
    faq: [{ question: 'Tem Wi-Fi?', answer: 'Sim, como toda Smart TV desta lista.' }],
    fullReview: lexicalDoc([heading('h2', 'Imagem'), paragraph('Texto de demonstração sobre a imagem.'), heading('h2', 'Recursos'), paragraph('Texto de demonstração sobre os recursos.')]),
    ...PUBLISH,
  })

  const offer = (product: number, variant: number, store: number, min: number, max: number) =>
    payload.create({
      collection: 'offers',
      data: {
        product,
        variant,
        store,
        url: `https://www.exemplo.com.br/demo/${product}-${variant}-${store}`,
        affiliateUrl: `https://www.exemplo.com.br/demo/${product}-${variant}-${store}?tag=decicompra-demo`,
        priceMin: min,
        priceMax: max,
        verifiedAt: new Date().toISOString(),
        status: 'active',
      },
    })

  // TV Demo Alfa: análise, 2 variantes, ofertas nas duas lojas
  const alfa = await ensure('products', 'demo-tv-alfa', async () => {
    const alfaImage = await demoImage(payload, '#172554', 'TV Demo Alfa')
    const alfa = await createProduct('TV Demo Alfa', 'demo-tv-alfa')
    const alfa55 = await defaultVariant(alfa.id)
    await payload.update({ collection: 'variants', id: alfa55.id, data: { label: '55"', modelCode: 'ALFA55', specs: [{ key: 'tamanho', value: '55' }, { key: 'consumo', value: '110' }] } })
    const alfa65 = await payload.create({ collection: 'variants', data: { product: alfa.id, label: '65"', modelCode: 'ALFA65', specs: [{ key: 'tamanho', value: '65' }, { key: 'consumo', value: '140' }] } })
    await payload.update({
      collection: 'products',
      id: alfa.id,
      data: {
        images: [alfaImage.id],
        specs: [{ key: 'painel', value: 'OLED' }, { key: 'taxa_atualizacao', value: '144' }, { key: 'hdr', value: 'Dolby Vision' }],
        scores: scores([9.2, 8.5, 7, 8, 8.4]),
        ...analysis('TV Demo Alfa'),
        status: 'analise',
      },
    })
    await offer(alfa.id, alfa55.id, storeA.id, 4300, 4600)
    await offer(alfa.id, alfa55.id, storeB.id, 4450, 5100)
    await offer(alfa.id, alfa65.id, storeA.id, 6200, 6900)
    return alfa
  })

  // TV Demo Beta: ficha, 1 oferta
  const beta = await ensure('products', 'demo-tv-beta', async () => {
    const betaImage = await demoImage(payload, '#2563EB', 'TV Demo Beta')
    const beta = await createProduct('TV Demo Beta', 'demo-tv-beta')
    const beta55 = await defaultVariant(beta.id)
    await payload.update({ collection: 'variants', id: beta55.id, data: { label: '55"', specs: [{ key: 'tamanho', value: '55' }, { key: 'consumo', value: '95' }] } })
    await payload.update({
      collection: 'products',
      id: beta.id,
      data: {
        images: [betaImage.id],
        specs: [{ key: 'painel', value: 'QLED' }, { key: 'taxa_atualizacao', value: '120' }, { key: 'hdr', value: 'HDR10+' }],
        scores: scores([8.8, 8, 7.5, 8, 8.9]),
        status: 'ficha',
      },
    })
    await offer(beta.id, beta55.id, storeB.id, 3900, 4400)
    return beta
  })

  // TV Demo Gama: análise, sem oferta
  const gama = await ensure('products', 'demo-tv-gama', async () => {
    const gamaImage = await demoImage(payload, '#16A34A', 'TV Demo Gama')
    const gama = await createProduct('TV Demo Gama', 'demo-tv-gama')
    const gama50 = await defaultVariant(gama.id)
    await payload.update({ collection: 'variants', id: gama50.id, data: { label: '50"', specs: [{ key: 'tamanho', value: '50' }] } })
    await payload.update({
      collection: 'products',
      id: gama.id,
      data: {
        images: [gamaImage.id],
        specs: [{ key: 'painel', value: 'LED' }, { key: 'taxa_atualizacao', value: '60' }],
        scores: scores([7, 7, 6.5, 7.5, 8]),
        ...analysis('TV Demo Gama'),
        status: 'analise',
      },
    })
    return gama
  })


  const summary = 'Conteúdo de demonstração do DeciCompra, usado para testar as páginas antes de existirem análises reais.'
  const contentBase = { summary, ...PUBLISH, status: 'publicado' as const }

  await ensure('contents', 'demo-tv-alfa-vs-demo-tv-beta', () => payload.create({
    collection: 'contents',
    data: {
      ...contentBase,
      title: 'TV Demo Alfa vs TV Demo Beta: qual comprar?',
      type: 'comparativo',
      comparedProducts: [alfa.id, beta.id],
      badges: [{ product: alfa.id, label: 'Vencedora geral' }, { product: beta.id, label: 'Melhor custo-benefício' }],
      chooseIf: [{ product: alfa.id, text: 'joga em console e quer 144 Hz' }, { product: beta.id, text: 'quer economizar sem abrir mão de boa imagem' }],
      conclusion: 'A Alfa vence em imagem e games; a Beta custa menos e entrega quase o mesmo.',
      body: lexicalDoc([heading('h2', 'Imagem'), paragraph('Comparação de demonstração da imagem.'), heading('h2', 'Games'), paragraph('Comparação de demonstração para games.')]),
    },
  }))
  await ensure('contents', 'demo-melhores-tvs', () => payload.create({
    collection: 'contents',
    data: {
      ...contentBase,
      title: 'As melhores TVs de demonstração',
      slug: 'demo-melhores-tvs',
      type: 'melhores',
      primarySubcategory: subcategory.id,
      modelsAnalyzed: 8,
      picks: [
        { product: alfa.id, profileLabel: 'Melhor no geral', position: 1, why: 'A melhor imagem da lista.' },
        { product: beta.id, profileLabel: 'Melhor custo-benefício', position: 2, why: 'Quase tão boa quanto a Alfa, por menos.' },
        { product: gama.id, profileLabel: 'Mais barata que vale a pena', position: 3, why: 'O básico bem feito.' },
      ],
      alsoConsidered: [],
      body: lexicalDoc([heading('h2', 'Como escolher'), paragraph('Resumo de demonstração de como escolher uma TV.')]),
    },
  }))
  await ensure('contents', 'demo-guia-como-escolher-tv', () => payload.create({
    collection: 'contents',
    data: {
      ...contentBase,
      title: 'Como escolher uma TV (demonstração)',
      slug: 'demo-guia-como-escolher-tv',
      type: 'guia',
      primarySubcategory: subcategory.id,
      body: lexicalDoc([
        heading('h2', 'Tamanho certo'),
        paragraph('Meça a distância do sofá até a parede.'),
        block({ blockType: 'tip', kind: 'dica', text: 'Para 2 metros de distância, 55" costuma ser o ideal.' }),
        heading('h2', 'Modelos que recomendamos'),
        block({ blockType: 'productCard', product: alfa.id }),
        block({ blockType: 'comparisonTable', products: [alfa.id, beta.id, gama.id], attributes: [] }),
        block({ blockType: 'faq', items: [{ question: 'OLED queima a tela?', answer: 'O risco existe, mas é baixo com uso normal.' }] }),
      ]),
    },
  }))
  await ensure('contents', 'demo-entenda-oled-vs-qled', () => payload.create({
    collection: 'contents',
    data: {
      ...contentBase,
      title: 'OLED vs QLED (demonstração)',
      slug: 'demo-entenda-oled-vs-qled',
      type: 'entenda',
      primarySubcategory: subcategory.id,
      body: lexicalDoc([
        heading('h2', 'A diferença em uma frase'),
        block({ blockType: 'sideBySide', leftTitle: 'OLED', leftText: 'Cada pixel acende sozinho: preto perfeito.', rightTitle: 'QLED', rightText: 'Painel LED com pontos quânticos: mais brilho.' }),
      ]),
    },
  }))

  await seedDemoHome(payload)
  await seedDemoSettings(payload)
  return { created }
}

// GA4 e e-mail de contato fictícios para os testes (só o que ainda não foi configurado)
async function seedDemoSettings(payload: Payload): Promise<void> {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const data = {
    ...(settings.ga4Id ? {} : { ga4Id: 'G-DEMO12345' }),
    ...(settings.contactEmail ? {} : { contactEmail: 'contato-demo@exemplo.com' }),
  }
  if (Object.keys(data).length > 0) await payload.updateGlobal({ slug: 'site-settings', data })
}

// Destaques da home com os dados de demonstração, só se nada foi escolhido no painel
async function seedDemoHome(payload: Payload): Promise<void> {
  const home = await payload.findGlobal({ slug: 'home-page', depth: 0 })
  const chosen = [home.subcategoryCards, home.featuredComparisons, home.featuredBest, home.featuredGuides, home.featuredExplainers, home.searchChips]
  if (chosen.some((list) => (list ?? []).length > 0)) return
  const idOf = async (collection: 'contents' | 'categories', slug: string) =>
    (await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0]?.id
  const ids = async (collection: 'contents' | 'categories', slugs: string[]) =>
    (await Promise.all(slugs.map((slug) => idOf(collection, slug)))).filter((id): id is number => typeof id === 'number')
  await payload.updateGlobal({
    slug: 'home-page',
    data: {
      searchChips: [
        { label: 'Smart TVs', href: '/tvs-e-entretenimento/smart-tvs/' },
        { label: 'TV Demo Alfa', href: '/produtos/demo-tv-alfa/' },
      ],
      subcategoryCards: await ids('categories', ['smart-tvs']),
      featuredComparisons: await ids('contents', ['demo-tv-alfa-vs-demo-tv-beta']),
      featuredBest: await ids('contents', ['demo-melhores-tvs']),
      featuredGuides: await ids('contents', ['demo-guia-como-escolher-tv']),
      featuredExplainers: await ids('contents', ['demo-entenda-oled-vs-qled']),
    },
  })
}
