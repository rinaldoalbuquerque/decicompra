import type { Payload } from 'payload'

import type { Criterion } from '../catalog/score'
import { slugify } from '../lib/slug'

type SubcategorySeed = { name: string; slug: string; anchor?: boolean; criteria?: Criterion[] }
type CategorySeed = { name: string; slug: string; icon: string; subcategories: SubcategorySeed[] }

const sub = (name: string, extra: Partial<SubcategorySeed> = {}): SubcategorySeed => ({ name, slug: slugify(name), ...extra })

const c = (key: string, name: string, weight: number): Criterion => ({ key, name, weight })

// Spec §3.1 (categorias e âncoras) e §9.4 (pesos iniciais)
export const TAXONOMY: CategorySeed[] = [
  {
    name: 'Casa & Eletrodomésticos',
    slug: 'casa-e-eletrodomesticos',
    icon: '🏠',
    subcategories: [
      sub('Ar-condicionado', {
        anchor: true,
        criteria: [
          c('eficiencia_energetica', 'Eficiência energética (Procel/IDRS)', 25),
          c('desempenho_ruido', 'Desempenho e ruído', 20),
          c('recursos', 'Recursos (inverter, Wi-Fi, filtros)', 10),
          c('confiabilidade_suporte_instalacao', 'Confiabilidade, suporte e instalação', 20),
          c('custo_beneficio', 'Custo-benefício', 25),
        ],
      }),
      sub('Geladeiras'),
      sub('Máquinas de lavar'),
      sub('Micro-ondas'),
      sub('Fornos'),
      sub('Aspiradores'),
      sub('Climatizadores'),
    ],
  },
  {
    name: 'Ferramentas & Equipamentos',
    slug: 'ferramentas-e-equipamentos',
    icon: '🔧',
    subcategories: [
      sub('Furadeiras e parafusadeiras', {
        anchor: true,
        criteria: [
          c('potencia_desempenho', 'Potência e desempenho', 30),
          c('ergonomia', 'Ergonomia', 15),
          c('durabilidade', 'Durabilidade', 20),
          c('suporte_pecas', 'Suporte e peças', 15),
          c('custo_beneficio', 'Custo-benefício', 20),
        ],
      }),
      sub('Serras'),
      sub('Compressores'),
      sub('Lavadoras de alta pressão'),
      sub('Ferramentas manuais'),
    ],
  },
  {
    name: 'Eletroportáteis',
    slug: 'eletroportateis',
    icon: '🍳',
    subcategories: [
      sub('Air fryers', {
        anchor: true,
        criteria: [
          c('cozimento_capacidade', 'Cozimento e capacidade', 30),
          c('facilidade_uso_limpeza', 'Facilidade de uso e limpeza', 20),
          c('construcao_durabilidade', 'Construção e durabilidade', 20),
          c('suporte', 'Suporte', 10),
          c('custo_beneficio', 'Custo-benefício', 20),
        ],
      }),
      sub('Cafeteiras'),
      sub('Liquidificadores'),
      sub('Batedeiras'),
      sub('Panelas elétricas'),
      sub('Sanduicheiras'),
      sub('Processadores'),
    ],
  },
  {
    name: 'Tecnologia',
    slug: 'tecnologia',
    icon: '💻',
    subcategories: [
      sub('Notebooks', {
        anchor: true,
        criteria: [
          c('desempenho', 'Desempenho', 30),
          c('tela_construcao', 'Tela e construção', 15),
          c('bateria_portabilidade', 'Bateria e portabilidade', 15),
          c('confiabilidade_suporte', 'Confiabilidade e suporte', 15),
          c('custo_beneficio', 'Custo-benefício', 25),
        ],
      }),
      sub('Computadores'),
      sub('Monitores'),
      sub('Impressoras'),
      sub('Celulares'),
      sub('Tablets'),
      sub('Acessórios', { slug: 'acessorios-de-tecnologia' }),
      sub('Roteadores'),
      sub('Armazenamento'),
    ],
  },
  {
    name: 'TVs & Entretenimento',
    slug: 'tvs-e-entretenimento',
    icon: '📺',
    subcategories: [
      sub('Smart TVs', {
        anchor: true,
        criteria: [
          c('imagem', 'Imagem', 35),
          c('recursos_smart', 'Recursos/Smart', 15),
          c('som', 'Som', 10),
          c('confiabilidade_suporte', 'Confiabilidade e suporte', 15),
          c('custo_beneficio', 'Custo-benefício', 25),
        ],
      }),
      sub('Soundbars'),
      sub('Projetores'),
      sub('Acessórios', { slug: 'acessorios-de-tv' }),
    ],
  },
]

async function findBySlug(payload: Payload, slug: string) {
  const { docs } = await payload.find({ collection: 'categories', where: { slug: { equals: slug } }, depth: 0, limit: 1 })
  return docs[0] ?? null
}

// Cria só o que falta; nunca sobrescreve edições feitas no painel
export async function seedTaxonomy(payload: Payload): Promise<{ created: number; existing: number }> {
  let created = 0
  let existing = 0
  for (const [order, category] of TAXONOMY.entries()) {
    let parent = await findBySlug(payload, category.slug)
    if (parent) existing++
    else {
      parent = await payload.create({
        collection: 'categories',
        data: { name: category.name, slug: category.slug, icon: category.icon, order },
      })
      created++
    }
    for (const [subOrder, subcategory] of category.subcategories.entries()) {
      if (await findBySlug(payload, subcategory.slug)) {
        existing++
        continue
      }
      await payload.create({
        collection: 'categories',
        data: {
          name: subcategory.name,
          slug: subcategory.slug,
          parent: parent.id,
          order: subOrder,
          isAnchor: Boolean(subcategory.anchor),
          criteria: subcategory.criteria ?? [],
        },
      })
      created++
    }
  }
  return { created, existing }
}
