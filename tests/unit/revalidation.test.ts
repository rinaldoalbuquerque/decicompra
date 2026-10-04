import { describe, expect, it } from 'vitest'

import { pathsForBrand, pathsForCategory, pathsForContent, pathsForProduct } from '@/content/revalidation'

describe('caminhos a atualizar (spec §5.6)', () => {
  it('produto: página, endereço antigo, hubs, marca, conteúdos que o citam e home', () => {
    expect(
      pathsForProduct({
        slug: 'lg-c4',
        previousSlug: 'lg-c4-antigo',
        subcategoryPath: '/tvs/smart-tvs/',
        brandPath: '/marcas/lg/',
        contentPaths: ['/comparar/a-vs-b/', '/melhores/tvs/', '/comparar/a-vs-b/'],
      }),
    ).toEqual(['/produtos/lg-c4/', '/produtos/lg-c4-antigo/', '/tvs/smart-tvs/', '/marcas/lg/', '/comparar/a-vs-b/', '/melhores/tvs/', '/'])
  })

  it('conteúdo: página, endereço antigo (inclusive de outro tipo), índice do tipo, hub e home', () => {
    expect(
      pathsForContent({ type: 'guia', slug: 'b', previous: { type: 'entenda', slug: 'a' }, subcategoryPath: '/tvs/smart-tvs/' }),
    ).toEqual(['/guias/b/', '/entenda/a/', '/guias/', '/entenda/', '/tvs/smart-tvs/', '/'])
  })

  it('categoria e marca', () => {
    expect(pathsForCategory({ path: '/tvs/smart-tvs/', previousPath: '/tvs/smarts/', parentPath: '/tvs/' })).toEqual([
      '/tvs/smart-tvs/',
      '/tvs/smarts/',
      '/tvs/',
      '/categorias/',
      '/',
    ])
    expect(pathsForBrand({ slug: 'lg', previousSlug: null })).toEqual(['/marcas/lg/', '/marcas/', '/'])
  })
})
