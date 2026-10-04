import type { PayloadRequest } from 'payload'

// Marcas de contexto para operações internas dos hooks. O Payload grava o `context` de uma chamada
// no `req` compartilhado (às vezes trocando o objeto por uma cópia), então uma marca passada direto
// "vaza" para o resto da requisição. Aqui elas valem só durante `fn`; depois, o objeto de contexto
// original volta para o `req`, sem as marcas.
export async function withContext<T>(
  req: PayloadRequest,
  flags: Record<string, unknown>,
  fn: () => Promise<T>,
): Promise<T> {
  req.context ??= {}
  const original = req.context
  const previous = new Map(Object.keys(flags).map((key) => [key, { had: key in original, value: original[key] }]))
  Object.assign(original, flags)
  try {
    return await fn()
  } finally {
    for (const [key, { had, value }] of previous) {
      if (had) original[key] = value
      else delete original[key]
    }
    req.context = original
  }
}
