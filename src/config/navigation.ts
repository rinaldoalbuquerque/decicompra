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

type NavigationSettings = {
  mainNav?: { label?: string | null; href?: string | null }[] | null
  footerColumns?: { title?: string | null; links?: { label?: string | null; href?: string | null }[] | null }[] | null
} | null

const validLinks = (links: { label?: string | null; href?: string | null }[] | null | undefined): NavLink[] =>
  (links ?? [])
    .filter((link) => link.label?.trim() && link.href?.trim())
    .map((link) => ({ label: link.label!.trim(), href: link.href!.trim() }))

// Menu e rodapé editados no painel (spec §4.11); o que não foi configurado usa o padrão
export function resolveNavigation(settings: NavigationSettings): { mainNav: NavLink[]; footerColumns: FooterColumn[] } {
  const configuredNav = validLinks(settings?.mainNav)
  const configuredColumns = (settings?.footerColumns ?? [])
    .map((column) => ({ title: column.title?.trim() ?? '', links: validLinks(column.links) }))
    .filter((column) => column.title && column.links.length > 0)
  return {
    mainNav: configuredNav.length > 0 ? configuredNav : mainNav,
    footerColumns: configuredColumns.length > 0 ? configuredColumns : footerColumns,
  }
}
