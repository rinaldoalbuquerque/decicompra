import type { GlobalConfig } from 'payload'

import type { TextFieldSingleValidation } from 'payload'

import { adminOnly, anyone, loggedInField } from '../access'
import { GA4_ID_PATTERN, ADSENSE_CLIENT_PATTERN, SEARCH_CONSOLE_TOKEN_PATTERN } from '../content/seo'
import { revalidateSiteLayout } from './revalidate'

// Estes valores vão parar dentro de scripts e meta tags: só o formato oficial é aceito
const matches =
  (pattern: RegExp, example: string): TextFieldSingleValidation =>
  (value) =>
    !value || pattern.test(String(value)) ? true : `Formato inválido. Exemplo: ${example}`

const linkFields = [
  {
    type: 'row' as const,
    fields: [
      { name: 'label', label: 'Texto', type: 'text' as const, required: true, admin: { width: '50%' } },
      { name: 'href', label: 'Endereço', type: 'text' as const, required: true, admin: { width: '50%', description: 'ex.: /guias/' } },
    ],
  },
]

// Configurações do site (spec §4.11)
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Configurações do site',
  admin: { group: 'Configurações' },
  access: { read: anyone, update: adminOnly },
  hooks: { afterChange: [revalidateSiteLayout] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Menu e rodapé',
          fields: [
            {
              name: 'mainNav',
              label: 'Menu principal',
              type: 'array',
              admin: { description: 'Vazio: usa o menu padrão (Categorias, Melhores, Comparativos, Guias, Entenda).' },
              fields: linkFields,
            },
            {
              name: 'footerColumns',
              label: 'Colunas do rodapé',
              type: 'array',
              admin: { description: 'Vazio: usa o rodapé padrão.' },
              fields: [
                { name: 'title', label: 'Título', type: 'text', required: true },
                { name: 'links', label: 'Links', type: 'array', fields: linkFields },
              ],
            },
          ],
        },
        {
          label: 'Afiliados e anúncios',
          fields: [
            {
              name: 'affiliateNotice',
              label: 'Aviso curto de afiliados',
              type: 'text',
              required: true,
              defaultValue: 'Podemos receber comissão pelas compras feitas a partir dos links.',
            },
            {
              name: 'adsEnabled',
              label: 'Anúncios ligados',
              type: 'checkbox',
              defaultValue: false,
              admin: { description: 'Ligue só depois da aprovação do AdSense.' },
            },
            {
              name: 'adsenseClientId',
              label: 'ID do cliente AdSense',
              type: 'text',
              validate: matches(ADSENSE_CLIENT_PATTERN, 'ca-pub-0000000000000000'),
              admin: { description: 'ex.: ca-pub-0000000000000000' },
            },
            {
              name: 'adSlots',
              label: 'Espaços de anúncio',
              type: 'array',
              fields: [
                {
                  name: 'placement',
                  label: 'Posição',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Home (entre seções)', value: 'home' },
                    { label: 'Entre seções de conteúdo', value: 'content' },
                    { label: 'Lateral (abaixo de "Onde comprar")', value: 'sidebar' },
                  ],
                },
                { name: 'slotId', label: 'ID do espaço', type: 'text', required: true },
              ],
            },
            { name: 'adsTxt', label: 'Conteúdo do ads.txt', type: 'textarea' },
          ],
        },
        {
          label: 'Medição e contato',
          fields: [
            {
              name: 'ga4Id',
              label: 'ID do Google Analytics 4',
              type: 'text',
              validate: matches(GA4_ID_PATTERN, 'G-ABC123DEF4'),
              admin: { description: 'ex.: G-XXXXXXXXXX. Só carrega para quem aceitar os cookies de estatísticas.' },
            },
            {
              name: 'contactEmail',
              label: 'E-mail que recebe o formulário de contato',
              type: 'email',
              access: { read: loggedInField },
            },
          ],
        },
        {
          label: 'Lançamento e privacidade',
          fields: [
            {
              name: 'indexingEnabled',
              label: 'Liberar o site para o Google',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Desligado: nenhuma página aparece no Google (robots.txt bloqueia tudo). Ligue só no lançamento, com o domínio definitivo configurado.',
              },
            },
            {
              name: 'searchConsoleVerification',
              label: 'Código de verificação do Google Search Console',
              type: 'text',
              validate: matches(SEARCH_CONSOLE_TOKEN_PATTERN, 'abc123_DEF-456'),
              admin: { description: 'Só o valor de "content" da meta tag que o Search Console mostra no método "Tag HTML".' },
            },
            {
              name: 'responsibleName',
              label: 'Nome do responsável (controlador dos dados)',
              type: 'text',
              admin: { description: 'Aparece na Política de Privacidade (LGPD).' },
            },
            {
              name: 'privacyEmail',
              label: 'E-mail de privacidade (público)',
              type: 'email',
              admin: { description: 'Aparece na Política de Privacidade para pedidos de titulares (LGPD).' },
            },
          ],
        },
      ],
    },
  ],
}
