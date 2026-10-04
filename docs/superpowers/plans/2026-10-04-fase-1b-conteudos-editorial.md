# DeciCompra · Fase 1B (Conteúdos e fluxo editorial): Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.
>
> **Formato enxuto (decisão do responsável, 04/10/2026):** o responsável pediu execução direta, sem pausas. Por isso este plano traz as decisões, as interfaces e os casos de teste de cada tarefa, mas não o código completo de cada arquivo. O executor escreve primeiro os testes listados, vê cada um falhar, implementa e vê passar (TDD). Convenções, padrões de hook e utilitários são os da Fase 1A.

**Goal:** Ter no painel o cadastro de conteúdos (Melhores, Comparativo, Guia, Entenda), com:
- blocos que referenciam produtos
- checklist de publicação e fluxo rascunho → em revisão → publicado/agendado
- histórico de versões
- autores
- redirecionamentos automáticos quando um endereço muda
- configurações globais da home e do site (menu e rodapé editáveis)
- itens "a revisar" no painel de manutenção

Também entram os pontos menores adiados da 1A.

**Architecture:**
- **Mesmo padrão da 1A:** regras puras em `src/catalog/` e `src/content/`; coleções finas com hooks.
- **Hooks:** todas as chamadas internas passam `req`. Marcas de contexto usam `withContext`. Edições são detectadas por `operation === 'update'`.
- **Visibilidade pública de conteúdo:** calculada na consulta, com `status` publicado/agendado **e** `publishAt <= agora`. Assim o agendamento funciona sem fila de tarefas.

**Spec:** [docs/superpowers/specs/2026-10-03-decicompra-design.md](../specs/2026-10-03-decicompra-design.md). Cobre §3.2 (URL canônica de comparativo, redirecionamento 301 na mudança de slug), §4.8–4.11, §5.4 (lógica de vencedores), §5.5 (regra de indexação de marcas e taxonomia), §5.6 (`produtosReferenciados`), §5.7 (conteúdos), §5.8, §8.1–8.4 e §10.4 (regra de patrocínio).

## Global Constraints
- **Herdadas:** todas as restrições globais das Fases 0 e 1A (versões, migrações, idioma, mensagens em português, commits com co-autoria).
- **Slugs de coleção novos:** `contents`, `authors`, `redirects`. **Globais:** `home-page`, `site-settings`.
- **Tipos de conteúdo:** `melhores`, `comparativo`, `guia`, `entenda`. Prefixos de URL:
  - melhores → `/melhores/`
  - comparativo → `/comparar/`
  - guia → `/guias/`
  - entenda → `/entenda/`
- **Status de conteúdo:** `rascunho` · `em_revisao` · `publicado` · `agendado`.
  - Redator só usa `rascunho` e `em_revisao`.
  - `agendado` exige `publishAt` no futuro.
  - `publicado` sem `publishAt` recebe a data de agora.
- **Comparativo:**
  - 2 ou 3 produtos da mesma subcategoria, e a subcategoria principal é a dos produtos
  - slug canônico: slugs dos produtos em ordem alfabética, unidos por `-vs-`
  - conjunto de produtos único (`productSetKey`)
- **Patrocínio:** permitido só em Guia e Entenda. Na v1 o campo é somente leitura no painel, e a API recusa `sponsored = true` em Melhores e Comparativo.
- **Checklist de publicação de conteúdo** (para `publicado`/`agendado`):
  - resumo rápido
  - meta descrição efetiva (a meta descrição ou, vazia, o resumo) com 70–160 caracteres
  - pelo menos 1 fonte
  - data de revisão
  - Melhores com 3–10 escolhas
  - Comparativo com 2–3 produtos
- **Redirecionamentos:**
  - criados só quando muda o slug de um documento **público**: produto fora de rascunho, conteúdo publicado/agendado, categoria ativa ou marca
  - sem cadeias: redirecionamentos que apontavam para o endereço antigo passam a apontar para o novo
  - voltar ao slug antigo apaga o redirecionamento que ficaria em loop
- **Versões:** histórico de versões (até 30 por documento) em `contents` e `products`. O salvamento automático e a pré-visualização dependem das páginas públicas e ficam para a Fase 2 (decisão registrada).

## Review Focus
1. **Mudar o slug de um conteúdo publicado duas vezes (A → B → C):** o endereço A deve levar direto a C, sem cadeia. Voltar de C para A não pode criar loop. Coberto na Tarefa 3.
2. **Conteúdo agendado para o futuro:** não aparece na leitura pública antes da hora e aparece depois. Coberto na Tarefa 6.
3. **Comparativo criado com os produtos em outra ordem, ou repetido:** gera o mesmo slug canônico e o repetido é recusado. Coberto na Tarefa 6.
4. **Apagar um produto usado num conteúdo:** os blocos e escolhas que apontam para ele não podem deixar o conteúdo impossível de salvar. As referências some limpas e `referencedProducts` é atualizado. Coberto na Tarefa 6.
5. **Menu e rodapé vazios ou ainda não configurados:** o site continua mostrando o menu padrão. Coberto na Tarefa 7.

---

### Task 1: Pendências menores da 1A
**Files:** `src/app/(frontend)/ir/[id]/route.ts`, `src/catalog/outbound.ts`, `src/catalog/spec-template.ts`, `src/catalog/product-status.ts`, `src/collections/Products.ts`, `src/collections/products/hooks.ts`, `src/collections/variants/hooks.ts`, `src/collections/Brands.ts`, `src/collections/Stores.ts` (+ `brands/hooks.ts`, `stores/hooks.ts`), `scripts/with-env.mjs`, testes unitários e de integração.

**Interfaces:**
- `normalizeSpecValue(attr, value): string | null`
  - número: vírgula vira ponto, sem espaços
  - sim/não: `sim` ou `não`
  - opção e texto: aparados
- `resolveOutbound` recebe `product: { slug, status } | null`. Produto em `rascunho` leva para `/`.
- `checkProductPublication` recebe `criteriaCount`. Com 0 critérios, a mensagem passa a ser "A subcategoria ainda não tem critérios de nota; cadastre-os antes de publicar."

**Testes (escrever primeiro):**
- unit `normalizeSpecValue`:
  - `'4,5'` → `'4.5'`
  - `' Sim '` → `'sim'`
  - `'nao'` → `'não'`
  - opção `' OLED '` → `'OLED'`
  - vazio → `null`
- unit `resolveOutbound`: produto em rascunho com oferta indisponível → `/`
- unit `checkProductPublication`: `criteriaCount: 0` traz a mensagem nova, e não "Preencha a nota…"
- int produto:
  - spec `'4,5'` é salva como `'4.5'`
  - nota `7.25` é recusada com "uma casa decimal"
- int `/ir/`:
  - `/ir/99999999999` → 302 `/`, sem erro
  - `/ir/00012abc` → `/`
- int marca/loja: apagar a que está em uso → `APIError` 409 com mensagem em português
- `with-env.mjs`: unit sobre a função exportada `splitCommand`, que mantém argumentos com espaço intactos

---

### Task 2: Caminhos públicos e plano de redirecionamento (puros)
**Files:** `src/content/paths.ts`, `src/content/redirects.ts`, testes unitários.

**Interfaces:**
- `productPath(slug)` → `/produtos/{slug}/`
- `contentPath(type, slug)` → prefixo do tipo + `{slug}/`
- `categoryPath(slug, parentSlug?)` → `/{slug}/` ou `/{pai}/{slug}/`
- `brandPath(slug)` → `/marcas/{slug}/`
- `planRedirect(existing: {id, from, to}[], from, to): { create?: {from, to}; retarget: {id, to}[]; remove: id[] }`
  - não faz nada se `from === to`
  - redireciona para `to` todos os existentes cujo `to === from`
  - remove qualquer existente cujo `from === to` (que geraria loop)
  - cria `from → to` se ainda não existe

**Testes:**
- cada função de caminho
- `planRedirect`:
  - simples
  - em cadeia (A → B existente; muda B → C ⇒ retarget A → C e create B → C)
  - volta ao anterior (A → B existente; muda B → A ⇒ remove A → B e cria B → A)
  - mesmo caminho

---

### Task 3: Coleção de redirecionamentos e hooks de slug
**Files:** `src/collections/Redirects.ts`, `src/collections/redirects/apply.ts` (`applySlugRedirect(req, from, to)`), hooks `afterChange` em products/brands/categories, migração `redirects`, teste de integração.

**Campos:**
- `from` (texto, único, começa e termina com `/`)
- `to` (texto)
- `type` (select `301`)
- `auto` (checkbox, somente leitura)

**Acesso:** leitura pública; escrita por admin e editor.

**Regras de disparo:**
- produto: slug mudou e o produto estava fora de rascunho antes
- marca: sempre que o slug mudou
- categoria ativa: slug mudou. A subcategoria usa o caminho `/{pai}/{sub}/`. Se mudar o slug de uma categoria de 1º nível, cria também o redirecionamento de cada subcategoria filha.

**Testes de integração:**
- produto publicado A → B cria `/produtos/A/` → `/produtos/B/`
- B → C faz `/produtos/A/` apontar para C
- voltar C → A não deixa nenhum redirecionamento com `from = /produtos/A/`
- produto em rascunho não cria redirecionamento
- categoria de 1º nível renomeada redireciona os caminhos das subcategorias

---

### Task 4: Autores
**Files:** `src/collections/Authors.ts`, migração `authors`, seed `src/seed/authors.ts` + inclusão no `seed:taxonomia` (renomeado para `seed` com alias), teste de integração.

**Campos:** `name`, `slug`, `bio` (textarea), `image` (mídia).

**Acesso:** leitura pública; escrita por admin e editor.

**Seed:** "Equipe DeciCompra" (`equipe-decicompra`), idempotente.

**Teste:** o seed cria uma vez só; o slug é gerado.

---

### Task 5: Regras de conteúdo (puras)
**Files:** `src/content/rules.ts`, `src/content/comparison.ts`, testes unitários.

**Interfaces:**
- `extractProductIds(input: { body?: unknown; picks?; alsoConsidered?; comparedProducts?; badges?; chooseIf?; specOverrides? }): number[]`
  - percorre o JSON do Lexical procurando nós `type: 'block'` com `fields.product` ou `fields.products`
  - inclui os campos por tipo
  - retorna números únicos, ordenados
- `comparisonSlug(productSlugs: string[])`: em ordem alfabética, unidos por `-vs-`
- `productSetKey(ids: number[])`: ids ordenados, unidos por `-`
- `effectiveMetaDescription(meta, summary)`: o primeiro não vazio, aparado
- `checkContentPublication(input): string[]`: regras do checklist das Global Constraints. Rascunho e em revisão ⇒ sem requisitos.
- `isPubliclyVisible(status, publishAt, now)`
- `criterionWinners(products: {id, scores: {key, score}[]}[], criteria): {key, winnerIds: number[]}[]`: empate devolve todos os empatados
- `specWinners(template, rows by product, overrides)`: usa `direction` (higher/lower; neutral = sem vencedor) e aplica o override `{key, winner: productId | 'none'}`. Números aceitam vírgula. Valores não numéricos não têm vencedor.

**Testes:**
- extração em JSON aninhado, com blocos, escolhas e itens repetidos
- slug em ordem trocada
- meta descrição efetiva
- cada item do checklist
- visibilidade (agendado antes e depois)
- vencedores com empate
- `direction` lower
- override "sem vencedor"

---

### Task 6: Coleção de conteúdos
**Files:** `src/collections/Contents.ts`, `src/collections/contents/blocks.ts`, `src/collections/contents/hooks.ts`, acesso em `src/access/index.ts`, versões em `Products.ts`, migração `contents`, teste de integração `contents.int.spec.ts`.

**Campos comuns:**
- `title`, `slug`, `type`
- `primarySubcategory` (subcategoria) e `relatedSubcategories`
- `summary` (textarea)
- `body` (richText com os blocos abaixo)
- `sources[{title, url}]`
- `author` (padrão "Equipe DeciCompra")
- `publishAt`, `reviewedAt`
- `seo{metaTitle, metaDescription, ogImage}`
- `status`
- `sponsored` (somente leitura, só aparece em guia/entenda)
- `referencedProducts` (relacionamento múltiplo, somente leitura)
- `productSetKey` (oculto, único)

**Campos por tipo:**
- **melhores:**
  - `picks[{product, variant?, profileLabel, position, why}]`
  - `alsoConsidered[{product, reason}]`
  - `modelsAnalyzed`
- **comparativo:**
  - `comparedProducts` (relacionamento múltiplo)
  - `badges[{product, label}]`
  - `chooseIf[{product, text}]`
  - `specOverrides[{attributeKey, winner (produto, opcional), noWinner (checkbox), justification (obrigatória)}]`
  - `conclusion`

**Blocos do texto rico:**
- `productCard{product}`
- `offerButton{product, store?}`
- `comparisonTable{products (2–5), attributes (texto múltiplo)}`
- `sideBySide{leftTitle, leftText, rightTitle, rightText}`
- `tip{kind: dica/aviso, text}`
- `faq{items[{question, answer}]}`
- `image{image}`
- `simpleTable{header, rows[{cells}]}`

**Hook `prepareContent` (beforeChange):**
1. Comparativo:
   - carrega os produtos
   - exige 2–3 da mesma subcategoria e define `primarySubcategory`
   - gera o slug canônico e o `productSetKey`
   - se o conjunto de produtos já existir, recusa com "Já existe um comparativo com estes produtos."
2. Calcula `referencedProducts` com `extractProductIds`.
3. Recusa `sponsored` fora de guia/entenda.
4. Redator só pode usar rascunho ou em revisão.
5. Publicado sem `publishAt` recebe agora. Agendado exige data futura.
6. Publicado ou agendado rodam `checkContentPublication`.
7. Autor vazio recebe "Equipe DeciCompra", se existir.

**Outros hooks:**
- **afterChange:** cria o redirecionamento quando o slug muda num conteúdo que já era público.
- **Produto (beforeDelete):** remove o produto dos conteúdos que o referenciam:
  - escolhas, também considerados, produtos comparados, selos, "escolha se" e overrides
  - blocos que só apontam para ele saem do texto
  - essas atualizações usam `withContext({ skipPublicationCheck })`

**Acesso:**
- leitura: logado vê tudo; anônimo vê `status in (publicado, agendado)` e `publishAt <= agora`
- criação por qualquer usuário logado
- edição: redator só em rascunho/em revisão
- exclusão por admin e editor

**Testes de integração:**
- slug canônico com produtos em ordem trocada
- comparativo repetido é recusado
- produtos de subcategorias diferentes são recusados
- melhores com 2 escolhas não publica; com 3 publica
- `referencedProducts` inclui produtos de blocos e de escolhas
- redator não publica
- agendado no futuro não aparece para anônimo; com `publishAt` no passado aparece
- `sponsored` em Melhores é recusado
- apagar um produto referenciado limpa o conteúdo e o deixa salvável
- mudar o slug de um conteúdo publicado cria o redirecionamento `/guias/a/` → `/guias/b/`

---

### Task 7: Configurações globais e menu/rodapé editáveis
**Files:** `src/globals/HomePage.ts`, `src/globals/SiteSettings.ts`, `src/config/navigation.ts` (`resolveNavigation`), `src/app/(frontend)/layout.tsx`, `SiteHeader`/`SiteFooter`/`MobileMenu` (recebem os links por props), migração `globals`, testes.

**`home-page`:**
- `searchChips[{label, href}]`
- `subcategoryCards` (subcategorias, até 12)
- `featuredComparisons` (conteúdos do tipo comparativo, até 6)
- `featuredBest` (melhores, até 8)
- `featuredGuides` (até 6)
- `featuredExplainers` (até 6)

**`site-settings`:**
- `mainNav[{label, href}]`
- `footerColumns[{title, links[{label, href}]}]`
- `affiliateNotice` (padrão "Podemos receber comissão pelas compras feitas a partir dos links.")
- `adsEnabled` (padrão false), `adsenseClientId`, `adSlots[{placement, slotId}]`
- `ga4Id`, `adsTxt`, `contactEmail`

**Acesso:** leitura pública; edição só por admin.

**`resolveNavigation(settings)`:** usa os links configurados, ou os padrões de `config/navigation.ts` quando vierem vazios.

**Componentes:**
- `SiteHeader` recebe `links`
- `SiteFooter` recebe `columns`
- o layout busca as configurações (com fallback em caso de erro de banco)

**Testes:**
- unit `resolveNavigation` com vazio, parcial e completo
- os testes de componente passam os links por props
- int: o global é lido e editado só por admin
- e2e: o atual continua passando, porque sem configuração o menu é o padrão

---

### Task 8: Manutenção: itens a revisar
**Files:** `src/catalog/maintenance.ts`, `MaintenancePanel.tsx`, testes.

**Interfaces:**
- `REVIEW_AFTER_MONTHS = 6`
- `contentsToReviewWhere(now)`: publicados/agendados com `reviewedAt` há mais de 6 meses
- `productsToReviewWhere(now)`: fora de rascunho com `reviewedAt` há mais de 6 meses

**Painel:** passa a ter 4 linhas: ofertas desatualizadas, produtos sem oferta, produtos a revisar e conteúdos a revisar.

**Testes:** unitários das consultas e o componente com 4 contagens.

---

### Task 9: Verificação, revisão, publicação
1. Suíte completa e simulação do CI.
2. Revisão final independente e passada única de correções, cada uma com teste.
3. Merge com fast-forward e push.
4. Acompanhar o deploy até a API de `contents` responder.
5. Seed do autor e das categorias na produção, pelo `with-env`, conferindo o host.
6. Conferir pela API pública.
