# DeciCompra · Fase 2B (Home, hubs, índices, busca e 404): Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Formato enxuto, a pedido do responsável: decisões, interfaces e testes. O código é escrito na execução, sempre com TDD.
>
> **Divisão da Fase 2:**
> - **2A (concluída):** fundamentos e as páginas de produto, comparativo, melhores, guia e entenda
> - **2B (este plano):** home completa, categoria/subcategoria, marca, autor, índices, busca, 404, redirecionamentos servidos e pendências da 2A

**Goal:** Todas as páginas da spec §6 (exceto contato e institucionais, que são da Fase 3) passam a existir. O visitante navega da home aos hubs, dos hubs aos conteúdos, e encontra qualquer coisa pela busca. Endereços antigos redirecionam.

**Architecture:**
- **Páginas sem paginação** (home, categoria, 404): estáticas com `revalidate = 3600` e `revalidatePath` nos hooks, como na 2A.
- **Páginas com paginação ou filtro** (subcategoria, marca, autor e os índices): leem `?pagina=N` e `?categoria=`, então são dinâmicas.
  - Os dados vêm de funções embrulhadas em `unstable_cache`, com a etiqueta `listas` e `revalidate: 3600`.
  - Os hooks chamam `revalidateTag('listas', { expire: 0 })` a cada mudança, então o banco só é consultado quando o cache esvazia (spec §12.4).
  - O projeto não usa Cache Components (decisão da 2A), então `unstable_cache` é o mecanismo indicado em `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`.
- **Busca:**
  - full-text do PostgreSQL (`portuguese` + `unaccent` + prefixo) em SQL direto, só para achar os ids candidatos
  - os documentos são carregados depois pelo Local API com `overrideAccess: false`, então rascunhos nunca vazam
  - `/busca/` e as sugestões são dinâmicos
- **Redirecionamentos:** quando uma página daria 404, antes ela consulta a coleção `redirects` (e, no comparativo, a ordem canônica) e responde 301. Páginas que existem não pagam essa consulta.

**Spec:** [docs/superpowers/specs/2026-10-03-decicompra-design.md](../specs/2026-10-03-decicompra-design.md): §3.1 (regra da subcategoria vazia), §3.2 (URLs, comparativo canônico, 301), §4.11 (home), §5.5 (indexação), §5.6, §6 (princípios, 6.1–6.3, 6.8–6.10), §7, §11 (canonical da paginação e título "{título} | DeciCompra"), §12.2–12.4.

## Global Constraints
- **Herdadas** da 2A, incluindo botões de loja, faixa de preço, nota com vírgula, `AdSlot` desligado, rascunho → 404 e acesso público com `overrideAccess: false`.
- **Indexação (spec §5.5):** a página só pode pôr `noindex`, nunca `index: true`. O `noindex` global do layout continua até o lançamento (Fase 3).
  - subcategoria ou categoria sem item público → `noindex` (a página abre, com estado vazio)
  - marca com menos de 3 itens públicos → `noindex`
  - `/busca/` → sempre `noindex`
- **Item público** de uma subcategoria: um conteúdo público com ela em `primarySubcategory` ou `relatedSubcategories`, ou um produto em `analise`. Uma categoria tem item público se alguma subcategoria dela tiver. Um conteúdo é público se estiver publicado, ou agendado com a data já alcançada (como na 2A).
- **Menus e home (spec §3.1):** subcategoria sem item público não aparece no menu "Categorias", nos cartões da home nem em `/categorias/`.
- **Grades de produtos** (hub, marca, "Análises recentes"): só produtos em `analise`. Produtos em `ficha` aparecem só na busca e nas próprias páginas.
- **Paginação:**
  - 24 itens por página, com `?pagina=N`
  - `pagina` ausente, inválida ou menor que 1 → página 1
  - página além da última → 404
  - `?pagina=1` nunca aparece nos links
  - os links usam `rel="prev"`/`rel="next"`
- **Filtro dos índices:** `?categoria={slug-da-categoria}`. Uma categoria desconhecida mostra a lista vazia com o link "ver todos", não um erro.
- **Busca:** ignora acentos e maiúsculas e aceita prefixos. A partir de 2 caracteres; abaixo disso, a página mostra as sugestões e as categorias. O termo é limitado a 80 caracteres.
- **Slugs reservados:** uma categoria de 1º nível não pode usar `produtos`, `melhores`, `comparar`, `guias`, `entenda`, `marcas`, `autores`, `categorias`, `busca`, `ir`, `admin`, `api`, `sobre`, `contato`, `como-avaliamos`, `politica-editorial`, `divulgacao-de-afiliados`, `publicidade-e-transparencia`, `privacidade`, `cookies`, `termos`, `_next`.
- **JavaScript no navegador** (spec §12.2): só nas sugestões da busca, na busca do cabeçalho que aparece ao rolar na home e no menu "Categorias ▾". O resto é HTML do servidor.

## Review Focus
1. **Rascunho escolhido no painel:** um produto em rascunho, ou um conteúdo não público, que esteja nos destaques da home, numa grade, num índice, na busca ou nas sugestões não aparece em lugar nenhum. Nada de link para uma página 404.
2. **Paginação com valores estranhos:** `?pagina=0`, `-1`, `abc`, `2.5`, `99999` e `?pagina=2&pagina=3` dão a página 1 ou 404, nunca erro 500.
3. **Busca com entrada hostil ou vazia:** `c++`, `o'neill`, `%`, `\`, `geladéira`, `ÁGUA`, um só caractere, 500 caracteres e só espaços → resultados coerentes ou o estado "sem resultados", nunca erro 500 nem SQL quebrado.
4. **Endereço antigo:**
   - produto, conteúdo, marca, categoria ou subcategoria que mudou de slug → 301 para o novo
   - comparativo com os produtos em outra ordem → 301 para a ordem canônica
   - redirecionamento que aponta para um lugar que não existe → 404, sem loop
5. **Hub de subcategoria sem nada publicado:** a página abre com uma mensagem clara e `noindex`, e não aparece no menu, na home nem em `/categorias/`.

---

### Task 1: Dados das listas (cache por etiqueta) e regras de visibilidade
**Files:**
- `src/content/pagination.ts` (puro)
- `src/content/visibility.ts` (puro)
- `src/lib/data/lists.ts`
- `src/lib/revalidate.ts` (`revalidateLists`)
- `src/collections/revalidation-hooks.ts`, mais um hook em `Authors.ts`
- testes

**Interfaces:**
- `parsePage(value: string | string[] | undefined): number`: `'2'` → 2; ausente, inválido, `< 1`, decimal ou lista → 1
- `pageCount(total, perPage = 24)` e `pageHref(basePath, page, extra?: Record<string,string>)`: a página 1 sai sem `pagina`, e os parâmetros saem em ordem estável
- `isBrandIndexable(publicItems: number)` → `>= 3`
- `revalidateLists()`: chama `revalidateTag('listas', { expire: 0 })` dentro de `try/catch` e pode ser trocado em testes, como o `setRevalidator`
- **Carga** (em `src/lib/data/lists.ts`, cada uma embrulhada em `unstable_cache(fn, [chave], { tags: ['listas'], revalidate: 3600 })`, retornando só dados serializáveis):
  - `getPublicTaxonomy()` → `{ id, slug, name, description, icon, order, subcategories: { id, slug, name, description, icon, publicItems }[] }[]`, só com as subcategorias que têm item público e as categorias que têm alguma delas, ordenadas por `order`/nome
  - `listContents({ type?, subcategoryIds?, authorId?, productIds?, page, perPage })` → `{ docs: ContentCardData[], total, page, pages }`, por `-publishAt`
  - `listAnalyzedProducts({ subcategoryId?, brandId?, page, perPage })` → `{ docs: ProductSummary[], total, page, pages }`, por `-publishedAt` e usando `getProductSummaries`
  - `countBrandPublicItems(brandId)`: produtos em análise + conteúdos que citam algum produto da marca
  - `ContentCardData` = `{ id, type, slug, title, summary, publishAt, reviewedAt, href, subcategoryName }`
- **Hooks:** todo `afterChange`/`afterDelete` de revalidação já existente chama também `revalidateLists()`. `Authors` ganha `afterChange` com `revalidatePaths(['/autores/{slug}/', ...antigo])` + `revalidateLists()`.
- **Pendência da 2A:** `revalidateCategory` monta o `previousPath` com o pai anterior (`previousDoc.parent`), não com o atual.

**Testes:**
- **unit:** `parsePage` com todos os valores do Review Focus 2; `pageHref` (página 1 sem parâmetro, filtro preservado); `isBrandIndexable`
- **int (dados de demonstração):**
  - `getPublicTaxonomy` inclui `smart-tvs` e omite uma subcategoria do seed sem conteúdo (ex.: `soundbars`)
  - `listContents({ type: 'melhores' })` traz o Melhores de demonstração e não traz um conteúdo em rascunho criado no teste
  - `listAnalyzedProducts` não traz Beta (ficha) nem um rascunho
  - mudar a subcategoria-mãe faz `revalidateCategory` mandar o caminho antigo correto
  - salvar um conteúdo chama `revalidateLists` (espião)

### Task 2: Redirecionamentos servidos, comparativo canônico e slugs reservados
**Files:**
- `src/lib/data/redirects.ts`
- `src/content/comparison.ts` (`canonicalComparisonSlug`)
- `src/collections/categories/hooks.ts` (`validateCategory`)
- as 5 páginas `[slug]` da 2A; as páginas novas desta fase usam o mesmo helper ao serem criadas
- `src/seed/demo.ts`: cria o redirecionamento de demonstração `/produtos/demo-tv-antiga/` → `/produtos/demo-tv-alfa/` (idempotente)
- testes

**Interfaces:**
- `notFoundOrRedirect(path: string): Promise<never>`:
  - busca `redirects` com `from = path`
  - se achar, chama `permanentRedirect(to)`
  - senão, `notFound()`
  - um `to` igual ao próprio `path` é ignorado (sem loop)
- `canonicalComparisonSlug(slug)`: separa por `-vs-`, ordena por ponto de código e junta. Na página de comparativo, se o slug pedido não existe e o canônico existe, responde `permanentRedirect` para ele.
- **Slugs reservados:** `validateCategory` recusa uma categoria de 1º nível com slug reservado (lista nas Global Constraints) e mostra a mensagem "Este endereço é usado pelo site; escolha outro nome."

**Testes:**
- **unit:** `canonicalComparisonSlug('b-vs-a')` → `'a-vs-b'`; com 3 produtos; com um slug sem `-vs-`
- **int:** categoria com slug `marcas` é recusada; subcategoria com slug `marcas` é aceita, porque o caminho é `/{pai}/marcas/`
- **e2e:**
  - um redirecionamento criado pelo seed de demonstração (`/produtos/demo-tv-antiga/` → `/produtos/demo-tv-alfa/`) responde 301 com `Location` correto
  - `/comparar/demo-tv-beta-vs-demo-tv-alfa/` → 301 para `/comparar/demo-tv-alfa-vs-demo-tv-beta/`
  - um redirecionamento para destino inexistente termina em 404

### Task 3: Componentes de lista e navegação
**Files:** `src/components/site/`:
- `ContentCard` (tipo, título, resumo, data de revisão)
- `ContentGrid`
- `ProductGrid` (usa `ProductCard`)
- `Pagination` (só links, sem JavaScript)
- `CategoryFilter` (links "Todas · {categoria}…", com `aria-current` na ativa)
- `SubcategoryCard` (ícone, nome, descrição)
- `EmptyState`
- `ListingPage` (cabeçalho com trilha, título, introdução, filtro, grade, paginação)

Testes de componente.

**Testes:**
- `Pagination`:
  - não renderiza com 1 página
  - página 1 sem `?pagina`
  - `rel="prev"`/`rel="next"`
  - página atual com `aria-current="page"`
  - preserva `categoria`
- `CategoryFilter` marca a ativa
- `ContentCard` monta o link pelo tipo
- `EmptyState` mostra a mensagem e um link

### Task 4: Categoria e subcategoria (spec §6.2–6.3)
**Files:**
- `src/app/(frontend)/[categoria]/page.tsx` (estática, `revalidate = 3600`, `generateStaticParams` → `[]`)
- `src/app/(frontend)/[categoria]/[subcategoria]/page.tsx` (dinâmica, lê `pagina`)

**Categoria:**
- trilha
- introdução (`description`)
- grade de subcategorias com item público (`SubcategoryCard`)
- destaques: até 4 Melhores, 4 comparativos e 4 guias de todas as subcategorias dela
- links para os índices filtrados (`/melhores/?categoria={slug}` etc.)

**Subcategoria:** trilha → introdução → Melhores principal em destaque (o mais recente) → Guias → Comparativos → Produtos analisados (grade paginada, 24 por página) → Entenda → Critérios de avaliação com pesos e link para `/como-avaliamos/`.
- Uma seção sem itens não aparece.
- Sem nenhum item: `EmptyState` "Ainda estamos preparando as análises de {nome}" + `noindex`.
- Na página 2 em diante, só a grade de produtos e a trilha. O título ganha "— página N".

**Regras comuns:**
- Uma subcategoria pedida sob a categoria errada (`/outra-categoria/smart-tvs/`) dá 404 via `notFoundOrRedirect`.
- Categoria inativa ou inexistente → `notFoundOrRedirect`.
- `generateMetadata`: título, descrição, `noindex` conforme as Global Constraints e `alternates.canonical` com `?pagina=N` quando N > 1 (spec §11).

**Testes e2e:**
- `/tvs-e-entretenimento/` lista Smart TVs e não lista Soundbars (vazia)
- `/tvs-e-entretenimento/smart-tvs/` mostra o Melhores, o guia, o comparativo, a grade com Alfa e Gama sem Beta, e os critérios
- `/tvs-e-entretenimento/soundbars/` abre com o estado vazio e `noindex`
- `/eletroportateis/smart-tvs/` → 404
- `?pagina=99` → 404; `?pagina=abc` → página 1

### Task 5: Marca e autor (spec §6.8)
**Files:**
- `src/app/(frontend)/marcas/[slug]/page.tsx`
- `src/app/(frontend)/autores/[slug]/page.tsx`

Ambas dinâmicas e paginadas.

**Marca:**
- trilha (Início › Marcas › {marca})
- logo e descrição
- link para o site oficial (`rel="nofollow noopener"`, nova aba)
- produtos analisados (grade paginada)
- conteúdos que citam produtos da marca (até 12)
- `noindex` se `countBrandPublicItems < 3`

**Autor:**
- nome, imagem e bio
- conteúdos assinados (grade paginada)

**Testes:**
- **e2e:**
  - `/marcas/demo-eletronicos/` lista Alfa e Gama, não Beta, e mostra o comparativo
  - `/autores/equipe-decicompra/` lista os 4 conteúdos de demonstração
  - marca inexistente → 404
- **int:** `countBrandPublicItems` da marca de demonstração = 2 produtos em análise + conteúdos que citam

### Task 6: Índices (spec §6.8)
**Files:**
- `src/app/(frontend)/categorias/page.tsx` (estática): todas as categorias com as subcategorias públicas, em `SubcategoryCard`
- `src/app/(frontend)/{melhores,comparar,guias,entenda}/page.tsx` (dinâmicas): `ListingPage` com `CategoryFilter`, `ContentGrid` e `Pagination`
- `src/app/(frontend)/marcas/page.tsx` (dinâmica): marcas com ao menos 1 item público, em ordem alfabética e paginadas

**Regras:**
- títulos "Melhores", "Comparativos", "Guias de compra", "Entenda" e "Marcas", cada um com uma frase de introdução
- índice vazio mostra `EmptyState`

**Testes e2e:**
- `/melhores/` lista o Melhores de demonstração
- `/guias/?categoria=tvs-e-entretenimento` lista o guia
- `/guias/?categoria=tecnologia` mostra o estado vazio com "ver todos"
- `/categorias/` mostra TVs & Entretenimento › Smart TVs e não mostra Soundbars
- `/marcas/` lista Demo Eletrônicos

### Task 7: Busca (spec §6.9 e §12.3)
**Files:**
- migração `pnpm payload migrate:create busca` com `CREATE EXTENSION IF NOT EXISTS unaccent;` (o `down` não remove a extensão)
- `src/content/search-query.ts` (puro)
- `src/lib/data/search.ts`
- `src/app/(frontend)/busca/page.tsx`
- `src/app/(frontend)/busca/sugestoes/route.ts`

**Interfaces:**
- `toTsQuery(term: string): string | null`:
  - minúsculas, sem acentos
  - todo caractere fora de `[a-z0-9]` vira espaço
  - palavras com menos de 2 caracteres são descartadas
  - cada palavra restante vira `palavra:*`, unidas por ` & `
  - nenhuma palavra restante → `null`
  - limita a 80 caracteres e 8 palavras
- `searchAll(term, { perGroup }): Promise<SearchGroups>`:
  - `SearchGroups` = `{ products, comparisons, best, articles, brands, subcategories }`, cada um uma lista de `{ id, title, href, meta? }`. `articles` reúne guia e entenda.
  - **Passo 1 (SQL via `payload.db.drizzle.execute(sql\`…\`)`, com parâmetros e nunca concatenação):** por tipo, ids ordenados por `ts_rank` de `to_tsvector('portuguese', unaccent(texto)) @@ to_tsquery('portuguese', $q)`. Os textos:
    - produtos: nome + nome da marca + `model_code` das variantes
    - conteúdos: título + resumo
    - marcas: nome
    - subcategorias: nome
  - Os nomes de tabelas e colunas vêm de `src/migrations/*.json` e devem ser conferidos antes de escrever o SQL.
  - **Passo 2:** carga pelo Local API com `overrideAccess: false` e `id in`, mantendo a ordem do passo 1. Produtos em rascunho e conteúdos não públicos caem aqui. Subcategorias sem item público também são descartadas (via `getPublicTaxonomy`).
- **`/busca/?q=`:**
  - campo com o termo
  - grupos na ordem Produtos · Comparativos · Melhores · Guias e Entenda · Marcas · Subcategorias, até 12 por grupo
  - sem resultados: "Nada encontrado para “{termo}”", os chips de sugestão da home e as categorias
  - `robots: noindex`; título "Busca: {termo}"
- **`GET /busca/sugestoes/?q=`:**
  - JSON `{ groups: { type, label, items: { title, href }[] }[] }`
  - no máximo 6 itens no total, intercalando os grupos por relevância
  - `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`
  - `q` curto → `{ groups: [] }`

**Testes:**
- **unit:** `toTsQuery` com cada entrada do Review Focus 3 (`'geladéira'` → `'geladeira:*'`; `"o'neill"` → `'neill:*'`; `'smart tv'` → `'smart:* & tv:*'`; `'c++'`, `'%'`, `'\'` e `'   '` → `null`; 500 caracteres → no máximo 80 caracteres e 8 palavras)
- **int (com a extensão aplicada pelas migrações do banco de teste):**
  - `'alfa'` acha TV Demo Alfa
  - `'tv demo'` acha as três públicas
  - `'ALFÁ'` acha Alfa
  - um produto em rascunho com nome único não aparece
  - `'smart'` acha a subcategoria Smart TVs
  - o código de modelo de uma variante acha o produto
  - entradas hostis não lançam erro
- **e2e:**
  - `/busca/?q=alfa` mostra o produto e o comparativo
  - `/busca/?q=zzzz` mostra "Nada encontrado"
  - `/busca/sugestoes/?q=al` responde JSON com até 6 itens

### Task 8: Cabeçalho (busca com sugestões e menu Categorias)
**Files:**
- `src/components/layout/SiteHeader.tsx` e `MobileMenu.tsx`
- `src/components/layout/SearchBox.tsx` (cliente)
- `src/components/layout/CategoriesMenu.tsx` (cliente: `details`/`summary` ou botão com `aria-expanded`)
- `src/app/(frontend)/layout.tsx` (passa a taxonomia pública)

**Regras:**
- **`SearchBox`:**
  - um `form` `GET /busca/` com um campo `q`, que funciona sem JavaScript
  - com JavaScript, sugestões a partir de 2 caracteres, com espera de 200 ms, cancelando o pedido anterior
  - lista agrupada por tipo, com setas e Enter para navegar e Esc para fechar
  - `role="combobox"`/`listbox`
- **Menu "Categorias ▾":** o item do menu principal com `href` `/categorias/` vira um botão. Ele abre um painel com as categorias e as subcategorias públicas, mais "Ver todas" → `/categorias/`. No celular, entra como uma seção do `MobileMenu`.
- **Home:** a busca do cabeçalho fica oculta até a busca principal sair da tela (`IntersectionObserver`), e o cabeçalho recebe `hideSearchUntilScroll`. Nas outras páginas, aparece sempre.

**Testes:**
- **componente:**
  - `SearchBox` envia para `/busca/`
  - com um `fetch` simulado, mostra sugestões agrupadas e navega com o teclado
  - o menu lista só o que recebe
- **e2e:**
  - digitar "alf" no cabeçalho de `/produtos/demo-tv-alfa/` mostra "TV Demo Alfa", e Enter leva à busca
  - o menu Categorias mostra Smart TVs

### Task 9: Home completa (spec §6.1)
**Files:**
- `src/app/(frontend)/page.tsx`
- `src/globals/HomePage.ts` (campo `heroImage`, upload de mídia, opcional) + migração
- `src/lib/data/home.ts`
- `src/components/home/*`

**Seções:**
1. **Topo escuro:**
   - linha "Análises independentes · Não vendemos produtos"
   - "Compare. Entenda. **Decida.**"
   - texto de apoio
   - busca grande (`form` GET `/busca/`, botão verde)
   - chips do painel
   - três atalhos (→ `/categorias/`, `/comparar/`, `/melhores/`)
   - imagem `heroImage` só no desktop, com carregamento prioritário
2. "O que você está procurando?": cartões das subcategorias escolhidas no painel, só as públicas; abaixo, a linha com as categorias públicas.
3. Comparativos em destaque
4. Melhores do momento
5. `AdSlot` (único, abaixo da dobra)
6. Guias de compra
7. Análises recentes: os 6 produtos em análise mais recentes por `publishedAt`
8. Entenda antes de comprar
9. Faixa de confiança: Independente · Critérios públicos · Transparente · Atualizado, com link para `/como-avaliamos/`

**Regras:**
- `getHomeData()` lê o global `home-page` com `depth: 0` e carrega os ids escolhidos com `overrideAccess: false`, mantendo a ordem do painel e descartando os não públicos.
- Uma seção sem itens não aparece.
- Sem nada configurado, a home ainda abre com o topo, as categorias públicas e as análises recentes.
- O hook do global `home-page` passa a revalidar `/`.
- O seed de demonstração preenche o global com os conteúdos de demonstração **só se ele estiver vazio**.

**Testes:**
- **int:**
  - `getHomeData` descarta um conteúdo despublicado que continua escolhido no painel
  - mantém a ordem do painel
- **e2e:**
  - a home mostra o título, os chips, o comparativo, o Melhores, o guia, o Entenda e "Análises recentes" com Alfa
  - a busca principal envia para `/busca/?q=`
  - no celular, a imagem do topo não aparece

### Task 10: 404 (spec §6.10)
**Files:** `src/app/(frontend)/not-found.tsx`.

**Conteúdo:**
- mensagem "Não encontramos esta página"
- busca (`form` GET `/busca/`)
- categorias públicas
- "Conteúdos populares": os destaques da home (Melhores e comparativos); sem analytics na v1, decisão registrada
- link para a home

O status continua 404.

**Testes e2e:** `/produtos/nao-existe/` mostra a mensagem e a busca, com status 404.

### Task 11: Pendências da revisão da 2A
**Files:** `src/app/(frontend)/melhores/[slug]/page.tsx`, `src/app/(frontend)/comparar/[slug]/page.tsx`, `src/content/view-models.ts`, `src/components/site/{PriceRange,MobileDecisionBar,RichContent}.tsx`, `src/seed/demo.ts`.

**Melhores:**
- o ano do título vem de `reviewedAt` (ou de `publishAt`, se não houver), no fuso `America/Sao_Paulo`
- `pick.variant` escolhe a variante usada no preço e nos botões
- a tabela não aparece sem escolhas públicas
- o aviso de comissão só aparece se alguma escolha tiver oferta

**Comparativo:**
- segundo `AdSlot` depois da seção 5
- "Análise detalhada" em seções `details` expansíveis
- cabeçalho da tabela sem `sticky` dentro do `overflow`

**Outros ajustes:**
- **`VariantOffers`:** expõe `valuesText` e `verifiedText` separados. Os componentes deixam de cortar `priceText` em `' · '`.
- **Links internos do Lexical:** `internalDocToHref` monta o caminho do documento (produto ou conteúdo). Um link para documento não público é renderizado só como texto.
- **Seed de demonstração:** idempotente por slug em cada item, não só pela existência da Alfa.

**Testes:**
- **unit/componente:**
  - ano a partir de `reviewedAt` no fuso de São Paulo (31/12 às 23h em São Paulo continua no mesmo ano)
  - `PriceRange` com os campos separados
  - link interno para um produto gera `/produtos/{slug}/`; para um rascunho, só texto
- **int:** apagar um conteúdo de demonstração e rodar o seed de novo o recria

### Task 12: Verificação, revisão e publicação
1. Suíte completa e simulação do CI, com o seed de demonstração no CI.
2. Revisão independente e uma passada de correções com TDD.
3. Merge e push. Acompanhar o deploy pelo site: o CLI do GitHub não está instalado, então o resultado do CI fica para o responsável conferir na aba Actions.
4. **Conferir na produção (sem dados de demonstração):**
   - a migração `busca` aplicada (a busca responde sem erro)
   - a home abre com as categorias públicas (nenhuma, se não houver conteúdo)
   - `/categorias/`, os índices e `/busca/?q=tv` respondem 200
   - `/produtos/nao-existe/` mostra o novo 404
