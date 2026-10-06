import type { Metadata } from 'next'
import Link from 'next/link'

import { InstitutionalPage } from '@/components/site/InstitutionalPage'
import { pageMetadata } from '@/lib/metadata'

import { ContactForm } from './ContactForm'

export const metadata: Metadata = pageMetadata({
  path: '/contato/',
  title: 'Contato',
  description: 'Fale com o DeciCompra: dúvidas, correções de conteúdo, parcerias e privacidade.',
})

// Contato (spec §6.11)
export default function ContactPage() {
  return (
    <InstitutionalPage title="Contato">
      <p>
        Dúvidas, sugestões, correções ou parcerias: escreva para a gente. Para pedidos sobre seus dados pessoais, escolha o assunto
        &quot;Privacidade&quot;.
      </p>
      <p className="text-sm text-texto-suave">
        Sua mensagem é enviada por e-mail e não fica guardada no site. Veja a <Link href="/privacidade/">Política de privacidade</Link>.
      </p>
      <ContactForm />
    </InstitutionalPage>
  )
}
