const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

// dd/mm/aaaa no horário de Brasília
export function formatDate(value: string | Date | null | undefined): string | null {
  if (!value) return null
  return dateFormat.format(new Date(value))
}
