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
