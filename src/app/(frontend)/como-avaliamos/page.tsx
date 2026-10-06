import type { Metadata } from 'next'
import Link from 'next/link'

import { InstitutionalPage } from '@/components/site/InstitutionalPage'
import { getPublicCriteria } from '@/lib/data/taxonomy'
import { pageMetadata } from '@/lib/metadata'

export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  path: '/como-avaliamos/',
  title: 'Como avaliamos os produtos',
  description: 'A metodologia do DeciCompra: princípios, fontes, critérios e os pesos de cada subcategoria.',
})

const BANDS = [
  ['9,0 a 10', 'Excepcional'],
  ['8,0 a 8,9', 'Muito bom'],
  ['7,0 a 7,9', 'Bom'],
  ['6,0 a 6,9', 'Regular'],
  ['abaixo de 6,0', 'Não recomendado'],
]

// Metodologia pública (spec §9)
export default async function MethodologyPage() {
  const subcategories = await getPublicCriteria()
  return (
    <InstitutionalPage title="Como avaliamos os produtos">
      <p>
        Cada análise do DeciCompra segue a mesma metodologia, descrita aqui. Ela vale para todas as notas, rankings e comparativos do site.
      </p>

      <h2>Princípios</h2>
      <ul>
        <li>
          <strong>Pesquisa estruturada, sem testes físicos.</strong> Não usamos os produtos em laboratório. Reunimos e cruzamos as melhores
          fontes disponíveis, e nunca dizemos que &quot;testamos&quot; ou &quot;usamos&quot; um produto.
        </li>
        <li>
          <strong>Inteligência artificial como apoio, revisão humana sempre.</strong> Usamos IA para ajudar na pesquisa e na redação. Todo
          conteúdo é revisado por uma pessoa antes de ser publicado.
        </li>
        <li>
          <strong>A comissão nunca altera nota nem posição em ranking.</strong> Lojas e marcas não pagam para aparecer. Um produto pode ser
          recomendado mesmo sem link de loja parceira, e produtos com nota baixa também são publicados.
        </li>
        <li>
          <strong>Revisão periódica.</strong> Cada análise é revista no mínimo a cada 6 meses, ou antes se houver mudança relevante de preço ou de
          modelo. A data da última revisão aparece em todas as páginas.
        </li>
      </ul>

      <h2>Fontes</h2>
      <ul>
        <li>Especificações oficiais do fabricante</li>
        <li>Selo Procel e informações do Inmetro</li>
        <li>Reviews especializados com testes de laboratório, sempre citados com link</li>
        <li>Avaliações de compradores em volume relevante</li>
        <li>Reclame Aqui</li>
        <li>Termos de garantia e rede de assistência técnica no Brasil</li>
      </ul>

      <h2>Critérios</h2>
      <p>
        Partimos de critérios comuns e cada subcategoria os adapta: desempenho; recursos; confiabilidade e durabilidade; suporte no Brasil;
        custo-benefício (relativo à faixa de preço dentro da subcategoria); e eficiência energética, quando se aplica.
      </p>

      <h2>Como a nota é calculada</h2>
      <p>
        Cada produto recebe uma nota de 0 a 10 em cada critério, com uma justificativa. A <strong>Nota DeciCompra</strong> é a média ponderada
        dessas notas, com os pesos da subcategoria. Ela aparece com uma casa decimal e uma faixa:
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">Nota</th>
            <th scope="col">Faixa</th>
          </tr>
        </thead>
        <tbody>
          {BANDS.map(([range, band]) => (
            <tr key={band}>
              <td>{range}</td>
              <td>{band}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {subcategories.length > 0 ? (
        <>
          <h2>Pesos por subcategoria</h2>
          {subcategories.map((sub) => (
            <section key={sub.id} aria-label={sub.name}>
              <h3>
                {sub.name} <span className="font-normal text-texto-suave">({sub.categoryName})</span>
              </h3>
              <ul>
                {sub.criteria.map((criterion) => (
                  <li key={criterion.key}>
                    {criterion.name}: {criterion.weight}%
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      ) : null}

      <h2>Preços</h2>
      <p>
        Mostramos faixas de preço verificadas, com a data da verificação. Preços verificados há mais de 60 dias deixam de aparecer, e você vê
        apenas o botão para conferir o preço atual na loja.
      </p>

      <p>
        Viu algo errado? Conte pelo <Link href="/contato/">formulário de contato</Link>, assunto &quot;Correção de conteúdo&quot;. Veja também a{' '}
        <Link href="/politica-editorial/">Política editorial</Link>.
      </p>
    </InstitutionalPage>
  )
}
