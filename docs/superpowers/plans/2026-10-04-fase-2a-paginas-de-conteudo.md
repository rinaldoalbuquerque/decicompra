# DeciCompra · Fase 2A (Páginas de produto e de conteúdo): Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Formato enxuto, a pedido do responsável: decisões, interfaces e testes. O código é escrito na execução, sempre com TDD.
>
> **Divisão da Fase 2:**
> - **2A (este plano):** fundamentos e as páginas de produto, comparativo, melhores, guia e entenda
> - **2B:** home completa, categoria/subcategoria, marca, autor, índices, busca e 404

**Goal:** O site passa a mostrar o que é cadastrado no painel. As páginas `/produtos/{slug}/`, `/comparar/{slug}/`, `/melhores/{slug}/`, `/guias/{slug}/` e `/entenda/{slug}/` seguem os layouts aprovados (spec §6.4–6.7) e se atualizam sozinhas quando algo é salvo no painel (spec §5.6).

**Architecture:**
- **Renderização:** páginas de servidor, geradas sob demanda e guardadas em cache:
  - `generateStaticParams` devolve `[]` e `dynamicParams` fica ligado
  - `revalidate = 3600` como rede de segurança: cobre agendamentos e o envelhecimento de preços
  - `revalidatePath` nos hooks atualiza as páginas na hora
  - Decidido a partir de `node_modules/next/dist/docs` (modelo sem Cache Components)
- **Dados:**
  - lidos pelo Local API do Payload com `overrideAccess: false` (só o que é público)
  - funções de carga em `src/lib/data/`
  - conversões puras em `src/content/view-models.ts`
- **Texto rico:** `RichText` de `@payloadcms/richtext-lexical/react`, com conversores próprios para cada bloco. Os produtos citados são carregados numa única consulta e passados aos conversores.
- **Imagens:** `<img>` com `srcset` das versões WebP (320/640/1280) servidas pelo R2, sem o otimizador da Vercel (spec §12.1).

**Spec:** [docs/superpowers/specs/2026-10-03-decicompra-design.md](../specs/2026-10-03-decicompra-design.md): §5.2, §5.3 (botões), §5.4, §5.6, §6 (princípios comuns e 6.4–6.7), §7.

## Global Constraints
- **Herdadas** das fases anteriores.
- **Botões de loja:**
  - texto sempre "Ver na {loja}", nunca "Comprar"
  - `href="/ir/{id}"`, com `rel="sponsored nofollow noopener"` e `target="_blank"`
  - aviso "Podemos receber comissão" ao lado
- **Linha de transparência** no topo das páginas com ofertas: "Revisado em {data} · {autor} · Podemos receber comissão (saiba mais → /divulgacao-de-afiliados/)".
- **Faixa de preço:** formatação de `formatPriceRange` (spec §5.2). Se estiver desatualizada, aparecem só os botões "Ver preço na {loja}".
- **Nota:** uma casa decimal com vírgula ("8,7"), mais a faixa (Excepcional…).
- **Indexação:**
  - produto em `ficha` recebe `noindex`
  - produto em `rascunho`, ou conteúdo não público, dá 404
  - o `noindex` global continua até o lançamento
- **Comparativo:** o slug é ordenado por ponto de código, e não por `localeCompare`. Fecha o ponto menor adiado da 1B.
- **Anúncios:** componente `AdSlot` presente nas posições da spec, sem renderizar nada enquanto `adsEnabled = false`. Os scripts são da Fase 3.
- **Dados de demonstração:** `pnpm seed:demo` só roda com `DEMO_SEED=1` e recusa o banco de `.env.producao.local`. O CI usa os mesmos dados nos testes de navegador.

## Review Focus
1. **Produto sem oferta ativa, sem imagem ou sem nota:** a página abre sem erro e mostra "Indisponível no momento" ou a ausência de forma limpa.
2. **Conteúdo que cita um produto em rascunho:** o card e o botão desse produto não aparecem (nada de link para página inexistente).
3. **Oferta com preço verificado há mais de 60 dias:** a faixa some e os botões continuam.
4. **Salvar uma oferta no painel:** a página do produto e os conteúdos que o citam são atualizados (`revalidatePath` chamado com os caminhos certos).
5. **Endereço inexistente** (`/produtos/nao-existe/`): mostra o 404 padrão, sem erro 500.

---

### Task 1: Dados de demonstração (dev/CI)
**Files:** `src/seed/demo.ts`, `scripts/seed-demo.ts`, `package.json` (`seed:demo`), `.github/workflows/ci.yml` (roda antes do e2e), teste de integração.

**Dados:**
- marca "Demo Eletrônicos" e lojas "Loja Demo A" e "Loja Demo B"
- na subcategoria `smart-tvs`, criada pelo seed de taxonomia, um modelo de especificações simples (painel, taxa de atualização, tamanho por variante)
- 3 TVs publicadas:
  - "TV Demo Alfa" em análise, com 2 variantes, ofertas nas duas lojas e imagem gerada
  - "TV Demo Beta" em ficha, com 1 oferta
  - "TV Demo Gama" em análise, sem oferta
- conteúdos publicados:
  - um comparativo Alfa × Beta
  - um Melhores com as 3
  - um guia com blocos (card, tabela comparativa, dica, FAQ, lado a lado)
  - um Entenda

Tudo idempotente por slug (`demo-…`).

**Proteções:**
- exige `DEMO_SEED=1`
- recusa se `DATABASE_URL` for igual ao de `.env.producao.local` (quando o arquivo existir)
- recusa se `VERCEL_ENV=production`

**Testes:** int — roda duas vezes sem duplicar e recusa sem `DEMO_SEED`.

### Task 2: Conversões puras (view models) e carga de dados
**Files:** `src/content/view-models.ts`, `src/lib/data/products.ts`, `src/lib/data/contents.ts`, testes.

**Interfaces:**
- `formatScore(n)` → "8,7"
- `toImageSet(media)` → `{ src, srcSet, alt, width, height } | null`, a partir das versões thumb/card/large
- `toProductSummary(product, variants, offers, now)` → `ProductSummary`:
  - `{ id, slug, name, brand, finalScore, band, image, referenceVariantId, priceText, stale, unavailable, offers: OfferLink[] }`
  - `OfferLink` = `{ id, storeName, href: /ir/{id} }`
- `variantOffers(...)` → por variante: `{ label, priceText, stale, unavailable, offers }`
- **Carga:**
  - `getPublicProduct(slug)` → produto + variantes + ofertas, ou `null` se rascunho ou inexistente
  - `getProductSummaries(ids)` → `Map<id, ProductSummary>` só com produtos públicos
  - `getPublicContent(type, slug)`
  - `getRelatedForProduct(id)` → comparativos e listas públicas que o citam

**Testes:**
- unit: nota; conjunto de imagens (sem imagem → `null`); resumo com faixa válida, desatualizada e indisponível; ofertas só de lojas ativas
- int (com os dados de demonstração):
  - o produto em rascunho não carrega
  - os resumos ignoram produtos em rascunho

### Task 3: Atualização automática das páginas (spec §5.6)
**Files:** `src/content/revalidation.ts` (puro), `src/lib/revalidate.ts` (chama `revalidatePath` com `try/catch`), hooks `afterChange`/`afterDelete` em products, variants, offers, contents, categories, brands, stores.

**Interfaces:**
- `pathsForProduct(product, subcategoryPath, brandPath, contentPaths)`
- `pathsForContent(content, previous?)`
- `pathsForCategory(...)`
- `pathsForBrand(...)`

Todos retornam caminhos únicos e sempre incluem `/` (home).

**Testes:**
- unit: cada mapeamento, incluindo o caminho antigo quando o slug muda
- int: salvar uma oferta chama o revalidador com a página do produto e os conteúdos que o citam (revalidador injetável, verificado com um espião)

### Task 4: Componentes de interface
**Files:** `src/components/site/*`:
- `ScoreBadge`, `Breadcrumbs`, `TransparencyLine`, `StoreButtons`, `PriceRange`
- `DecisionBox` (lateral fixa no desktop)
- `MobileDecisionBar` (barra fixa com âncora, sem JavaScript)
- `ProductCard`, `ProsCons`, `QuickSummary`, `FaqList`, `SourcesList`, `AdSlot`, `ContentHeader`

Testes de componente.

**Testes:**
- botões: texto "Ver na {loja}", `href` `/ir/{id}`, `rel` e `target` corretos
- nota com vírgula e faixa
- `PriceRange` nos três estados
- breadcrumbs com `nav` "Trilha"
- `AdSlot` não renderiza com anúncios desligados
- `ProductCard` sem imagem

### Task 5: Texto rico com blocos
**Files:** `src/components/site/RichContent.tsx` (conversores), testes de componente.

**Blocos:**
- **productCard:** usa `ProductCard`; produto ausente do mapa não renderiza nada
- **offerButton:** usa `StoreButtons`, filtrando pela loja quando houver
- **comparisonTable:** tabela de especificações dos produtos, com o vencedor destacado por `specWinners`
- **sideBySide**, **tip**, **faq**, **contentImage** e **simpleTable**

**Testes:** renderizar um JSON Lexical com todos os blocos; produto ausente some; tabela marca o vencedor.

### Task 6: Página de produto (spec §6.4)
**Files:** `src/app/(frontend)/produtos/[slug]/page.tsx`.

**Estrutura:**
- resumo rápido
- índice
- notas por critério com justificativa
- especificações agrupadas, com seletor de variante via âncoras/`details`, sem JavaScript
- análise completa
- alternativas e comparativos
- FAQ e fontes
- caixa "Onde comprar" fixa no desktop e barra no celular
- `generateMetadata` com título, descrição e `robots` (`noindex` em ficha)

**Testes e2e:**
- Alfa mostra nota, faixa, botões com `/ir/` e "Podemos receber comissão"
- Gama mostra "Indisponível no momento"
- Beta tem meta `noindex`
- `/produtos/nao-existe/` dá 404

### Task 7: Página de comparativo (spec §6.5)
**Files:** `src/app/(frontend)/comparar/[slug]/page.tsx`, `src/content/comparison.ts` (ordenação por ponto de código).

**Estrutura:**
- veredito rápido lado a lado
- "Escolha qual se…"
- placar por critério (`criterionWinners`)
- especificações com vencedor (`specWinners` + ajustes)
- análise, conclusão com lojas, relacionados e FAQ
- barra de lojas no celular

**Testes:**
- unit: ordenação por ponto de código
- e2e: o comparativo de demonstração mostra o placar e as lojas

### Task 8: Páginas de Melhores, Guia e Entenda (spec §6.6–6.7)
**Files:**
- `src/app/(frontend)/melhores/[slug]/page.tsx`
- `src/app/(frontend)/guias/[slug]/page.tsx`
- `src/app/(frontend)/entenda/[slug]/page.tsx`
- `src/components/site/ContentArticle.tsx`

**Melhores:**
- título com "N modelos analisados · M selecionados · Como avaliamos"
- escolhas em resumo
- tabela rápida
- escolhas em detalhe
- também consideramos
- como escolher
- como escolhemos (critérios e pesos)
- FAQ

**Guia/Entenda:** linha de transparência, resumo rápido, índice dos títulos, corpo com blocos, fontes e relacionados.

**Testes e2e:** as páginas de demonstração abrem com os elementos principais. O guia renderiza os blocos.

### Task 9: Verificação, revisão e publicação
1. Suíte completa e simulação do CI, com o seed de demonstração no CI.
2. Revisão independente e uma passada de correções com TDD.
3. Merge e push; acompanhar o deploy.
4. Conferir que as páginas respondem 404 na produção (sem dados de demonstração lá) e que nada quebrou.
