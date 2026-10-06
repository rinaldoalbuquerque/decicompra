import type { Metadata } from 'next'
import Link from 'next/link'

import { InstitutionalPage } from '@/components/site/InstitutionalPage'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  path: '/publicidade-e-transparencia/',
  title: 'Publicidade e transparência',
  description: 'Como o DeciCompra exibe anúncios e quais são as regras para conteúdo patrocinado.',
})

// Publicidade e transparência (spec §6.12, §10.2 e §10.4)
export default function AdvertisingPage() {
  return (
    <InstitutionalPage title="Publicidade e transparência">
      <h2>Anúncios</h2>
      <p>O DeciCompra pode exibir anúncios, por exemplo do Google AdSense. Seguimos estas regras:</p>
      <ul>
        <li>Anúncios são posicionados manualmente e ficam separados do conteúdo editorial.</li>
        <li>Nunca dentro do resumo de uma análise, da caixa &quot;Onde comprar&quot; ou das barras fixas.</li>
        <li>No máximo um anúncio a cada três ou quatro seções de um texto, e um só na página inicial.</li>
        <li>Sem anúncios flutuantes, de tela cheia ou pop-ups.</li>
        <li>
          Anúncios personalizados só são exibidos com o seu consentimento, que você pode mudar a qualquer momento em{' '}
          <Link href="/cookies/">Política de cookies</Link>.
        </li>
      </ul>
      <p>Anunciantes não têm qualquer influência sobre notas, rankings ou textos.</p>

      <h2>Conteúdo patrocinado</h2>
      <p>Se um dia publicarmos conteúdo patrocinado, ele seguirá regras permanentes:</p>
      <ul>
        <li>Será identificado com o selo &quot;Conteúdo patrocinado&quot;, visível no topo.</li>
        <li>Só pode existir em guias e textos educativos (Entenda).</li>
        <li>
          <strong>Nunca</strong> em análises de produto, listas de Melhores ou comparativos.
        </li>
      </ul>

      <h2>Links de afiliados</h2>
      <p>
        Alguns links para lojas podem gerar comissão. Veja como funcionam em <Link href="/divulgacao-de-afiliados/">Divulgação de afiliados</Link>.
      </p>

      <h2>Contato comercial</h2>
      <p>
        Propostas de parceria ou publicidade: <Link href="/contato/">formulário de contato</Link>, assunto &quot;Parcerias/Publicidade&quot;.
      </p>
    </InstitutionalPage>
  )
}
