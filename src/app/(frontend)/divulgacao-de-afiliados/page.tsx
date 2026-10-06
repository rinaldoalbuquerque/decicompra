import type { Metadata } from 'next'
import Link from 'next/link'

import { InstitutionalPage } from '@/components/site/InstitutionalPage'
import { getActiveStores } from '@/lib/data/people'
import { pageMetadata } from '@/lib/metadata'

export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  path: '/divulgacao-de-afiliados/',
  title: 'Divulgação de afiliados',
  description: 'Como funcionam os links para lojas no DeciCompra e por que eles não influenciam as notas.',
})

// Divulgação de afiliados (spec §6.12 e §10.1): exigência do CONAR e do Google
export default async function AffiliateDisclosurePage() {
  const stores = await getActiveStores()
  return (
    <InstitutionalPage title="Divulgação de afiliados">
      <p>
        O DeciCompra participa de programas de afiliados de lojas online. Isso significa que alguns links do site levam a lojas parceiras e,
        quando você compra a partir deles, <strong>podemos receber uma comissão</strong>.
      </p>

      <h2>Como funcionam os links</h2>
      <ul>
        <li>Os botões &quot;Ver na loja&quot; passam por um endereço nosso (/ir/) e levam você à página do produto na loja.</li>
        <li>A compra é feita direto na loja: o DeciCompra não vende, não recebe pagamentos e não vê seus dados de compra.</li>
        <li>
          <strong>A comissão não muda o preço</strong> que você paga. Ela é paga pela loja.
        </li>
        <li>Junto aos botões de loja sempre aparece o aviso &quot;Podemos receber comissão&quot;.</li>
      </ul>

      <h2>Independência das notas</h2>
      <p>
        A comissão nunca altera notas, rankings ou recomendações. Recomendamos produtos mesmo quando não há link de loja parceira, e publicamos
        produtos com nota baixa. A metodologia está em <Link href="/como-avaliamos/">Como avaliamos os produtos</Link>.
      </p>

      <h2>Preços</h2>
      <p>
        Mostramos faixas de preço com a data em que foram verificadas. O preço final, o frete e a disponibilidade são sempre os da loja no
        momento da compra.
      </p>

      {stores.length > 0 ? (
        <>
          <h2>Lojas parceiras atuais</h2>
          <ul>
            {stores.map((store) => (
              <li key={store.id}>
                {store.name}
                {store.affiliateProgram ? <span className="text-texto-suave"> ({store.affiliateProgram})</span> : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <p>
        Dúvidas? Fale com a gente pelo <Link href="/contato/">formulário de contato</Link>.
      </p>
    </InstitutionalPage>
  )
}
