// Identidade de um banco: host (sem o "-pooler" do Neon) + nome do banco; ignora usuário, porta e parâmetros
function databaseIdentity(url: string): string {
  const raw = url.trim().replace(/^["']|["']$/g, '').trim()
  try {
    const parsed = new URL(raw)
    return `${parsed.hostname.toLowerCase().replace(/-pooler(?=\.)/, '')}/${parsed.pathname.replace(/^\//, '')}`
  } catch {
    return raw
  }
}

// Os dados de demonstração nunca podem ir para a produção
export function demoSeedBlocker(env: Record<string, string | undefined>, productionDatabaseUrl: string | null): string | null {
  if (env.DEMO_SEED !== '1') return 'Defina DEMO_SEED=1 para criar os dados de demonstração (só em desenvolvimento).'
  if (env.VERCEL_ENV === 'production') return 'Recusado: ambiente de produção da Vercel.'
  if (productionDatabaseUrl && env.DATABASE_URL && databaseIdentity(env.DATABASE_URL) === databaseIdentity(productionDatabaseUrl)) {
    return 'Recusado: DATABASE_URL é o banco de produção.'
  }
  return null
}
