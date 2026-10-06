type Revalidator = (path: string) => void | Promise<void>

// Padrão: revalidatePath do Next. Fora de uma requisição do Next (scripts, testes) não há cache a
// invalidar e a chamada falha; o erro é ignorado para não travar quem salvou.
const nextRevalidator: Revalidator = async (path) => {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath(path)
  } catch {
    // sem contexto do Next
  }
}

let current: Revalidator = nextRevalidator

// Testes trocam o revalidador por um espião; null volta ao padrão
export function setRevalidator(revalidator: Revalidator | null): void {
  current = revalidator ?? nextRevalidator
}

export async function revalidatePaths(paths: string[]): Promise<void> {
  for (const path of paths) await current(path)
}

// Listas paginadas (hubs, índices, marca, autor) guardam os dados com a etiqueta "listas":
// qualquer mudança no painel esvazia esse cache. expire: 0 = a próxima visita já busca de novo.
export const LISTS_TAG = 'listas'

type ListsRevalidator = () => void | Promise<void>

const nextListsRevalidator: ListsRevalidator = async () => {
  try {
    const { revalidateTag } = await import('next/cache')
    revalidateTag(LISTS_TAG, { expire: 0 })
  } catch {
    // sem contexto do Next
  }
}

let currentLists: ListsRevalidator = nextListsRevalidator

// Testes trocam por um espião; null volta ao padrão
export function setListsRevalidator(revalidator: ListsRevalidator | null): void {
  currentLists = revalidator ?? nextListsRevalidator
}

export async function revalidateLists(): Promise<void> {
  await currentLists()
}
