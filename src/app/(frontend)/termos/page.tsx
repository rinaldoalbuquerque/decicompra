import type { Metadata } from 'next'
import Link from 'next/link'

import { InstitutionalPage } from '@/components/site/InstitutionalPage'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  path: '/termos/',
  title: 'Termos de uso',
  description: 'Condições de uso do DeciCompra: natureza informativa, preços e lojas, e responsabilidades.',
})

// Termos de uso (spec §6.12)
export default function TermsPage() {
  return (
    <InstitutionalPage title="Termos de uso">
      <p>Ao usar o DeciCompra, você concorda com estes termos. Se não concordar, não use o site.</p>

      <h2>Natureza do site</h2>
      <p>
        O DeciCompra é um site informativo de análises, comparativos e guias de compra. As notas e recomendações são opiniões editoriais baseadas
        na metodologia publicada em <Link href="/como-avaliamos/">Como avaliamos os produtos</Link> e não substituem a sua avaliação nem as
        informações oficiais do fabricante.
      </p>

      <h2>Não vendemos produtos</h2>
      <p>
        O DeciCompra não vende produtos, não intermedeia pagamentos e não é parte da compra. Toda compra é feita diretamente na loja escolhida, sob
        os termos, preços, prazos, trocas e garantias dela.
      </p>

      <h2>Preços e disponibilidade</h2>
      <p>
        As faixas de preço mostradas são informativas e trazem a data em que foram verificadas. Preços, frete, estoque e condições podem mudar a
        qualquer momento nas lojas, e o que vale é o que a loja mostra no momento da compra. Não nos responsabilizamos por diferenças entre o que o
        site mostra e o que a loja pratica.
      </p>

      <h2>Links para lojas e outros sites</h2>
      <p>
        O site tem links para lojas e outros sites, alguns de afiliados (veja <Link href="/divulgacao-de-afiliados/">Divulgação de afiliados</Link>
        ). Não controlamos esses sites e não respondemos pelo conteúdo, pelas práticas ou pelos produtos deles.
      </p>

      <h2>Conteúdo do site</h2>
      <p>
        Textos, notas, tabelas e a identidade visual do DeciCompra são protegidos por direitos autorais. Você pode compartilhar links e citar
        trechos curtos com a fonte. Copiar ou republicar o conteúdo depende de autorização. Marcas e imagens de produtos pertencem aos seus
        titulares.
      </p>

      <h2>Limitação de responsabilidade</h2>
      <p>
        Fazemos o possível para manter as informações corretas e atualizadas, mas podem existir erros ou desatualizações. Se encontrar algum,
        avise pelo <Link href="/contato/">formulário de contato</Link> (veja a <Link href="/politica-editorial/">política de correções</Link>). O
        uso das informações é de responsabilidade de quem as utiliza.
      </p>

      <h2>Privacidade</h2>
      <p>
        O tratamento de dados pessoais segue a <Link href="/privacidade/">Política de privacidade</Link> e a{' '}
        <Link href="/cookies/">Política de cookies</Link>.
      </p>

      <h2>Mudanças e legislação</h2>
      <p>
        Estes termos podem mudar, e a data no topo indica a versão em vigor. Eles são regidos pelas leis brasileiras, incluindo o Código de Defesa
        do Consumidor quando aplicável.
      </p>
    </InstitutionalPage>
  )
}
