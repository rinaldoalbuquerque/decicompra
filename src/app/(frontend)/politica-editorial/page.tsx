import type { Metadata } from 'next'
import Link from 'next/link'

import { InstitutionalPage } from '@/components/site/InstitutionalPage'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  path: '/politica-editorial/',
  title: 'Política editorial',
  description: 'Como o conteúdo do DeciCompra é produzido, revisado e corrigido.',
})

export default function EditorialPolicyPage() {
  return (
    <InstitutionalPage title="Política editorial">
      <h2>Como produzimos o conteúdo</h2>
      <ol>
        <li>
          <strong>Pesquisa:</strong> reunimos especificações oficiais, selos, reviews especializados, avaliações de compradores e informações de
          garantia e assistência no Brasil.
        </li>
        <li>
          <strong>Redação com apoio de IA:</strong> usamos inteligência artificial para organizar a pesquisa e redigir uma primeira versão.
        </li>
        <li>
          <strong>Revisão humana:</strong> uma pessoa confere fatos, notas, fontes e clareza antes de qualquer publicação.
        </li>
        <li>
          <strong>Publicação:</strong> só publicamos com fontes citadas, data de revisão e as notas justificadas critério a critério.
        </li>
        <li>
          <strong>Revisão periódica:</strong> todo conteúdo é revisto no mínimo a cada 6 meses, ou antes quando algo relevante muda.
        </li>
      </ol>

      <h2>Independência</h2>
      <p>
        As análises seguem a metodologia publicada em <Link href="/como-avaliamos/">Como avaliamos os produtos</Link>. Comissões de afiliados e
        anúncios não influenciam notas, rankings ou recomendações. Lojas e marcas não pagam para aparecer nem revisam nossos textos antes da
        publicação.
      </p>

      <h2>Fontes</h2>
      <p>
        Citamos as fontes usadas em cada conteúdo, com link quando possível. Damos preferência a informações oficiais e a avaliações com
        metodologia clara.
      </p>

      <h2>Autoria</h2>
      <p>Os conteúdos são assinados pela Equipe DeciCompra, responsável pela pesquisa, redação e revisão.</p>

      <h2>Política de correções</h2>
      <p>
        Erros acontecem, e queremos corrigi-los rápido. Se encontrar uma informação errada ou desatualizada, avise pelo{' '}
        <Link href="/contato/">formulário de contato</Link>, assunto &quot;Correção de conteúdo&quot;.
      </p>
      <ul>
        <li>Verificamos cada aviso e, se o erro se confirmar, corrigimos o conteúdo.</li>
        <li>Correções que mudam uma nota, um ranking ou uma recomendação são registradas no próprio conteúdo, com a data da correção.</li>
        <li>Ajustes pequenos (digitação, links) são feitos sem registro.</li>
      </ul>
    </InstitutionalPage>
  )
}
