import { jsonLdString } from '@/content/structured-data'

// Dados estruturados (spec §11) num <script> seguro: "<" escapado
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />
}
