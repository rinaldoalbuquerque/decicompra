import { unstable_cache } from 'next/cache'

import { LISTS_TAG } from '@/lib/revalidate'

// Guarda o resultado com a etiqueta "listas" por até 1 h. Fora do Next (testes, scripts) não há
// cache disponível e a função roda direto. O resultado precisa ser serializável (JSON).
export function cachedList<Args extends unknown[], Result>(key: string, fn: (...args: Args) => Promise<Result>) {
  const cached = unstable_cache(fn, [key], { tags: [LISTS_TAG], revalidate: 3600 })
  return async (...args: Args): Promise<Result> => {
    try {
      return await cached(...args)
    } catch (error) {
      if (error instanceof Error && error.message.includes('incrementalCache missing')) return fn(...args)
      throw error
    }
  }
}
