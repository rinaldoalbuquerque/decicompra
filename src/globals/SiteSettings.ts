import type { GlobalConfig } from 'payload'

import { adminOnly, anyone } from '../access'

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
            { name: 'adsenseClientId', label: 'ID do cliente AdSense', type: 'text', admin: { description: 'ex.: ca-pub-0000000000000000' } },
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
            { name: 'ga4Id', label: 'ID do Google Analytics 4', type: 'text', admin: { description: 'ex.: G-XXXXXXXXXX' } },
            { name: 'contactEmail', label: 'E-mail que recebe o formulário de contato', type: 'email' },
          ],
        },
      ],
    },
  ],
}
