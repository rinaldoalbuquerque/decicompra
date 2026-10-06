import type { Metadata } from 'next'
import Link from 'next/link'

import { CookiePreferencesButton } from '@/components/consent/ConsentManager'
import { InstitutionalPage } from '@/components/site/InstitutionalPage'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  path: '/cookies/',
  title: 'Política de cookies',
  description: 'Quais cookies o DeciCompra usa, para quê, e como mudar a sua escolha.',
})

// Política de cookies (spec §6.12 e §10.3)
export default function CookiesPage() {
  return (
    <InstitutionalPage title="Política de cookies">
      <p>
        Cookies são pequenos arquivos guardados no seu navegador. Usamos três categorias. Só os necessários funcionam sem a sua permissão; os
        demais dependem da sua escolha no aviso de cookies.
      </p>
      <p>
        <CookiePreferencesButton className="rounded-lg bg-azul-profundo px-4 py-2 font-semibold text-branco" />
      </p>

      <h2>Categorias</h2>

      <h3>Necessários</h3>
      <p>Sempre ativos: o site precisa deles para funcionar.</p>
      <table>
        <thead>
          <tr>
            <th scope="col">Cookie</th>
            <th scope="col">Para quê</th>
            <th scope="col">Duração</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>dc_consentimento</td>
            <td>Guarda a sua escolha no aviso de cookies</td>
            <td>12 meses</td>
          </tr>
        </tbody>
      </table>

      <h3>Estatísticas</h3>
      <p>Usados pelo Google Analytics para medir, de forma agregada, como o site é usado. Só com a sua permissão.</p>
      <table>
        <thead>
          <tr>
            <th scope="col">Cookie</th>
            <th scope="col">Para quê</th>
            <th scope="col">Duração</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>_ga</td>
            <td>Distingue visitantes</td>
            <td>2 anos</td>
          </tr>
          <tr>
            <td>_ga_*</td>
            <td>Mantém o estado da sessão</td>
            <td>2 anos</td>
          </tr>
        </tbody>
      </table>

      <h3>Publicidade</h3>
      <p>
        Usados pelo Google AdSense para exibir e medir anúncios, e personalizá-los quando permitido. Só com a sua permissão e somente quando os
        anúncios estiverem ativos no site.
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">Cookie</th>
            <th scope="col">Para quê</th>
            <th scope="col">Duração</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>__gads, __gpi</td>
            <td>Exibição e frequência de anúncios</td>
            <td>até 13 meses</td>
          </tr>
          <tr>
            <td>IDE (doubleclick.net)</td>
            <td>Anúncios personalizados</td>
            <td>até 13 meses</td>
          </tr>
        </tbody>
      </table>

      <h2>Como mudar a sua escolha</h2>
      <p>
        Use o botão &quot;Preferências de cookies&quot;, no rodapé de todas as páginas ou acima. Você também pode apagar os cookies nas
        configurações do seu navegador. Ao clicar num link de loja, a loja pode usar os próprios cookies, conforme a política dela.
      </p>
      <p>
        Mais sobre o tratamento de dados na <Link href="/privacidade/">Política de privacidade</Link>.
      </p>
    </InstitutionalPage>
  )
}
