import type { GlobalAfterChangeHook } from 'payload'

// Menu e rodapé aparecem em todas as páginas: ao salvar, as páginas geradas são refeitas.
// Fora de uma requisição do Next (scripts, testes) não há cache a invalidar, então o erro é ignorado.
export const revalidateSiteLayout: GlobalAfterChangeHook = async ({ doc }) => {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
    // Fora do layout: dependem da chave de indexação e do ads.txt das Configurações
    revalidatePath('/robots.txt')
    revalidatePath('/ads.txt')
  } catch {
    // sem contexto do Next
  }
  return doc
}

// A home lê o global "Página inicial": ao salvar, ela é refeita
export const revalidateHomePage: GlobalAfterChangeHook = async ({ doc }) => {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/')
  } catch {
    // sem contexto do Next
  }
  return doc
}
