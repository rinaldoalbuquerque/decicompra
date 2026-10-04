export type NavLink = { label: string; href: string }
export type FooterColumn = { title: string; links: NavLink[] }

// Provisório: na Fase 1 o menu e o rodapé passam a ser editados no painel (spec §4.11)
export const mainNav: NavLink[] = [
  { label: 'Categorias', href: '/categorias/' },
  { label: 'Melhores', href: '/melhores/' },
  { label: 'Comparativos', href: '/comparar/' },
  { label: 'Guias', href: '/guias/' },
  { label: 'Entenda', href: '/entenda/' },
]

export const footerColumns: FooterColumn[] = [
  {
    title: 'Categorias',
    links: [
      { label: 'Casa & Eletrodomésticos', href: '/casa-e-eletrodomesticos/' },
      { label: 'Ferramentas & Equipamentos', href: '/ferramentas-e-equipamentos/' },
      { label: 'Eletroportáteis', href: '/eletroportateis/' },
      { label: 'Tecnologia', href: '/tecnologia/' },
      { label: 'TVs & Entretenimento', href: '/tvs-e-entretenimento/' },
    ],
  },
  {
    title: 'Conteúdo',
    links: [
      { label: 'Melhores', href: '/melhores/' },
      { label: 'Comparativos', href: '/comparar/' },
      { label: 'Guias', href: '/guias/' },
      { label: 'Entenda', href: '/entenda/' },
      { label: 'Marcas', href: '/marcas/' },
    ],
  },
  {
    title: 'Sobre',
    links: [
      { label: 'Quem somos', href: '/sobre/' },
      { label: 'Como avaliamos', href: '/como-avaliamos/' },
      { label: 'Política editorial', href: '/politica-editorial/' },
      { label: 'Contato', href: '/contato/' },
    ],
  },
  {
    title: 'Transparência',
    links: [
      { label: 'Divulgação de afiliados', href: '/divulgacao-de-afiliados/' },
      { label: 'Publicidade e transparência', href: '/publicidade-e-transparencia/' },
      { label: 'Privacidade', href: '/privacidade/' },
      { label: 'Cookies', href: '/cookies/' },
      { label: 'Termos de uso', href: '/termos/' },
    ],
  },
]
