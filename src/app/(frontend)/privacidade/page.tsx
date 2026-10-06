import type { Metadata } from 'next'
import Link from 'next/link'

import { InstitutionalPage } from '@/components/site/InstitutionalPage'
import { getPublicSettings } from '@/lib/data/settings'
import { pageMetadata } from '@/lib/metadata'

export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  path: '/privacidade/',
  title: 'Política de privacidade',
  description: 'Quais dados o DeciCompra trata, para quê, com quem compartilha e como exercer seus direitos (LGPD).',
})

// Política de privacidade (spec §6.12 e §10.3, LGPD). Controlador e e-mail vêm das Configurações do site.
export default async function PrivacyPage() {
  const { responsibleName, privacyEmail } = await getPublicSettings()
  const contactForm = (
    <Link href="/contato/">formulário de contato</Link>
  )
  return (
    <InstitutionalPage title="Política de privacidade">
      <p>
        Esta política explica como o DeciCompra trata dados pessoais, de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).
        Coletamos o mínimo necessário.
      </p>

      <h2>Quem é o controlador</h2>
      <p>
        O controlador dos dados é {responsibleName ? <strong>{responsibleName}</strong> : 'o responsável pelo DeciCompra'}, pessoa física
        responsável pelo site.{' '}
        {privacyEmail ? (
          <>
            Contato para assuntos de privacidade: <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>, ou o {contactForm}, assunto
            &quot;Privacidade&quot;.
          </>
        ) : (
          <>Contato para assuntos de privacidade: {contactForm}, assunto &quot;Privacidade&quot;.</>
        )}
      </p>

      <h2>Quais dados tratamos e para quê</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">Dados</th>
            <th scope="col">Finalidade</th>
            <th scope="col">Base legal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nome, e-mail, assunto e mensagem enviados pelo formulário de contato</td>
            <td>Responder ao seu contato</td>
            <td>Procedimentos a pedido do titular e legítimo interesse</td>
          </tr>
          <tr>
            <td>Endereço IP e dados técnicos de acesso, registrados pela empresa de hospedagem</td>
            <td>Segurança, prevenção de abuso e funcionamento do site</td>
            <td>Legítimo interesse</td>
          </tr>
          <tr>
            <td>Sua escolha no aviso de cookies</td>
            <td>Lembrar suas preferências</td>
            <td>Legítimo interesse</td>
          </tr>
          <tr>
            <td>Dados de navegação coletados pelo Google Analytics</td>
            <td>Estatísticas de uso para melhorar o site</td>
            <td>Consentimento</td>
          </tr>
          <tr>
            <td>Dados de navegação usados pelo Google AdSense</td>
            <td>Exibir anúncios (personalizados só com permissão)</td>
            <td>Consentimento</td>
          </tr>
        </tbody>
      </table>
      <p>
        O formulário de contato <strong>não grava</strong> sua mensagem no nosso banco de dados: ela é enviada por e-mail ao responsável e
        guardada só na caixa de entrada pelo tempo necessário para o atendimento.
      </p>
      <p>Não vendemos dados pessoais. Não pedimos cadastro nem dados de pagamento: as compras são feitas direto nas lojas.</p>

      <h2>Cookies</h2>
      <p>
        Cookies de estatísticas e de publicidade só são usados com o seu consentimento. Os detalhes e a forma de mudar sua escolha estão na{' '}
        <Link href="/cookies/">Política de cookies</Link>.
      </p>

      <h2>Com quem compartilhamos</h2>
      <ul>
        <li>Google (Analytics e AdSense), apenas com o seu consentimento;</li>
        <li>Vercel, que hospeda o site;</li>
        <li>Cloudflare, que armazena e entrega as imagens;</li>
        <li>Resend, que entrega por e-mail as mensagens do formulário de contato;</li>
        <li>autoridades públicas, quando houver obrigação legal.</li>
      </ul>
      <p>
        Google, Vercel, Cloudflare e Resend processam dados em servidores fora do Brasil (principalmente nos Estados Unidos). Essas
        transferências internacionais seguem as hipóteses do art. 33 da LGPD, como as garantias contratuais oferecidas por esses
        fornecedores. Ao clicar num link de loja, você passa a seguir a política de privacidade da loja.
      </p>

      <h2>Por quanto tempo guardamos</h2>
      <ul>
        <li>Mensagens de contato: pelo tempo necessário para responder e resolver o assunto.</li>
        <li>Escolha de cookies: 12 meses, quando perguntamos de novo.</li>
        <li>Registros técnicos de acesso: o site não os guarda; a empresa de hospedagem os mantém por poucos dias, para segurança.</li>
      </ul>

      <h2>Seus direitos</h2>
      <p>Pela LGPD, você pode pedir, a qualquer momento:</p>
      <ul>
        <li>confirmação de que tratamos seus dados e acesso a eles;</li>
        <li>correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo com a lei;</li>
        <li>portabilidade dos dados;</li>
        <li>eliminação dos dados tratados com base no consentimento;</li>
        <li>informação sobre com quem compartilhamos seus dados;</li>
        <li>revogação do consentimento (para cookies, a qualquer momento em &quot;Preferências de cookies&quot;, no rodapé).</li>
      </ul>
      <p>
        Para exercer seus direitos, use o {contactForm} com o assunto &quot;Privacidade&quot;
        {privacyEmail ? (
          <>
            {' '}
            ou escreva para <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>
          </>
        ) : null}
        . Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).
      </p>

      <h2>Mudanças nesta política</h2>
      <p>Quando esta política mudar, atualizamos a data no topo da página.</p>
    </InstitutionalPage>
  )
}
