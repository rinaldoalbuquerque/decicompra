import type { Metadata } from 'next'
import Link from 'next/link'

import { InstitutionalPage } from '@/components/site/InstitutionalPage'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  path: '/sobre/',
  title: 'Sobre o DeciCompra',
  description: 'O que é o DeciCompra, o que ele não é e como o site se mantém.',
})

export default function AboutPage() {
  return (
    <InstitutionalPage title="Sobre o DeciCompra">
      <p>
        O DeciCompra existe para ajudar você a escolher melhor antes de comprar. Reunimos especificações, avaliações especializadas e a
        experiência de quem já comprou, e transformamos tudo em análises, comparativos e guias diretos ao ponto.
      </p>

      <h2>Nossa missão</h2>
      <p>Compare. Entenda. Decida. Queremos que a decisão de compra seja mais simples, mais informada e mais segura, sem pressão para comprar.</p>

      <h2>O que o DeciCompra é</h2>
      <ul>
        <li>Um site de análises e comparativos de produtos vendidos no Brasil.</li>
        <li>
          Um lugar com critérios públicos: cada nota segue uma metodologia que você pode consultar em{' '}
          <Link href="/como-avaliamos/">Como avaliamos os produtos</Link>.
        </li>
        <li>Um conteúdo revisado por pessoas e atualizado periodicamente.</li>
      </ul>

      <h2>O que o DeciCompra não é</h2>
      <ul>
        <li>Não é uma loja: não vendemos produtos nem processamos pagamentos.</li>
        <li>Não fazemos testes físicos em laboratório: nossas análises são feitas por pesquisa estruturada, e dizemos isso com clareza.</li>
        <li>Não vendemos posições: lojas e marcas não pagam para aparecer nem para ter nota maior.</li>
      </ul>

      <h2>Como o site se mantém</h2>
      <p>
        Alguns links levam a lojas parceiras. Quando você compra a partir deles, podemos receber uma comissão, sem custo extra para você. Também
        podemos exibir anúncios identificados. Nada disso altera notas ou rankings. Os detalhes estão em{' '}
        <Link href="/divulgacao-de-afiliados/">Divulgação de afiliados</Link> e em{' '}
        <Link href="/publicidade-e-transparencia/">Publicidade e transparência</Link>.
      </p>

      <h2>Fale com a gente</h2>
      <p>
        Dúvidas, correções e sugestões são bem-vindas pelo <Link href="/contato/">formulário de contato</Link>.
      </p>
    </InstitutionalPage>
  )
}
