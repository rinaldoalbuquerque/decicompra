export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// "TVs & Entretenimento" → "tvs-e-entretenimento"
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
