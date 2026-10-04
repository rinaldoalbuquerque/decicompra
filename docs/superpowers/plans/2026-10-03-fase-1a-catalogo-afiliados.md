# DeciCompra · Fase 1A (Catálogo e afiliados): Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Divisão da Fase 1:** a Fase 1 da spec (§14) foi dividida em dois planos:
> - **1A (este):** catálogo e afiliados
> - **1B:** conteúdos e fluxo editorial (Melhores/Comparativo/Guia/Entenda, blocos, checklist de conteúdos, redirecionamentos automáticos, Autores, configurações globais da home/menu, tela "conteúdos a revisar")
>
> As Tarefas 13 e 14 têm passos **com o responsável**, porque gravam dados na produção e publicam o código. O agente para e pede confirmação nesses passos.

**Goal:** No painel, o responsável cadastra:
- categorias e subcategorias, com modelo de especificações e critérios de nota com pesos
- marcas e lojas
- produtos, com variantes, especificações validadas e nota DeciCompra calculada
- ofertas de afiliado

Os níveis de acesso são Administrador, Editor e Redator. O link `/ir/{id}` redireciona para a loja, e um painel de manutenção mostra ofertas desatualizadas e produtos sem oferta.

**Architecture:**
- **Regras de negócio** (especificações, nota, faixa de preço, publicação, redirecionamento, consultas de manutenção) ficam em módulos TypeScript puros em `src/catalog/`, com testes unitários.
- **Coleções do Payload** são finas: os hooks carregam os dados relacionados, chamam essas funções e gravam o resultado. Os hooks que gravam outros documentos passam `req`, para tudo ficar na mesma transação.
- **Especificações e notas** são linhas (`array`) sincronizadas automaticamente com o modelo e os critérios da subcategoria.
- **Variantes** são uma coleção própria, ligada ao produto e exibida dentro dele por um campo `join`.

**Tech Stack:** Payload 3.90.2 (coleções, hooks, controle de acesso, campo `join`, componentes de painel no servidor) · Next.js 16 (route handler) · PostgreSQL (Neon) · Vitest · Testing Library.

**Spec:** [docs/superpowers/specs/2026-10-03-decicompra-design.md](../specs/2026-10-03-decicompra-design.md). Este plano cobre §4.1–4.7, §4.10 (Usuário com papel), §5.1, §5.2, §5.3 (exceto o evento de analytics, que é da Fase 3), §5.7 (parte dos produtos), §8.1–8.2 e §8.4 (ofertas e produtos).

**Plano anterior (convenções já em uso):** [2026-10-03-fase-0-fundacao.md](2026-10-03-fase-0-fundacao.md)

## Global Constraints

- Todas as restrições globais da Fase 0 continuam valendo: versões, pnpm, TypeScript strict, migrações com `push: false`, segredos só no `.env`, tokens, acessibilidade, commits com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Idioma:** identificadores de código, slugs de coleção e nomes de campo em **inglês**. Rótulos do painel e mensagens de erro em **português**.
- **Slugs de coleção (fixos, usados por fases seguintes):** `categories`, `brands`, `stores`, `products`, `variants`, `offers`, `users`, `media`.
- **Slugs de documento:** minúsculos, sem acento, separados por hífen, padrão `^[a-z0-9]+(-[a-z0-9]+)*$` (spec §3.2).
- **Chaves de atributo e critério:** padrão `^[a-z0-9]+(_[a-z0-9]+)*$`, estáveis.
- **Mudança de esquema:** toda mudança de coleção segue `pnpm generate:types` → `pnpm payload migrate:create <nome>` → `pnpm payload migrate` (banco dev) → commit da migração.
- **Hooks:** todo hook que lê ou grava outros documentos passa `req` (mesma transação). Erros de validação usam `ValidationError` (campo + mensagem em português). Bloqueios usam `APIError(mensagem, status, undefined, true)`.
- **Nota DeciCompra (spec §5.1):**
  - escala 0–10 com uma casa decimal
  - média ponderada pelos pesos da subcategoria, que somam exatamente 100
  - fica vazia enquanto faltar nota em algum critério
- **Faixas de nota:**
  - 9–10 Excepcional
  - 8–8,9 Muito bom
  - 7–7,9 Bom
  - 6–6,9 Regular
  - abaixo de 6 Não recomendado
- **Faixa de preço (spec §5.2):**
  - considera só as ofertas ativas
  - oculta quando a verificação mais antiga passar de 60 dias
  - formato "R$ 4.300 – R$ 5.100 · verificado em 03/10/2026"
- **`/ir/{id}` (spec §5.3):**
  - oferta ativa de loja ativa → 302 para `urlAfiliado`, com `X-Robots-Tag: noindex, nofollow`
  - qualquer outro caso → 302 para `/produtos/{slug}/` (ou `/`, se o produto não existir)
  - nunca usa cache
- **Status do produto (spec §4.5):** `rascunho` · `ficha` · `analise`.
- **Níveis de acesso (spec §8.2):** Administrador, Editor, Redator. O primeiro usuário do sistema é sempre Administrador.
- **Fora deste plano:** revalidação de páginas (spec §5.6, Fase 2), páginas públicas (Fase 2), analytics (Fase 3), coleção Conteúdos (Fase 1B).

## Review Focus

1. **Editor muda os pesos dos critérios de uma subcategoria que já tem produtos publicados:**
   - as notas de todos os produtos dela são recalculadas
   - salvar a subcategoria não falha por causa de algum produto

   Coberto na Tarefa 10.
2. **Editor troca a URL de afiliado de uma oferta:** o próximo clique em `/ir/{id}` já vai para a URL nova, sem cache. Coberto na Tarefa 11.
3. **Especificação numérica digitada com vírgula decimal** ("4,5", padrão brasileiro): é aceita como número. Coberto na Tarefa 4.
4. **Variantes:**
   - apagar a variante de referência promove outra
   - apagar a única variante de um produto publicado é bloqueado com mensagem clara

   Coberto na Tarefa 8.
5. **Redator tenta publicar um produto** (status ficha/análise) ou editar um produto já publicado: é bloqueado. Coberto na Tarefa 8.

---

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/slug.ts` | `slugify`, `SLUG_PATTERN` |
| `src/lib/url.ts` | `isHttpsUrl`, validador `httpsUrl` |
| `src/lib/relations.ts` | `relId`, `pick` (leitura de dados nos hooks) |
| `src/fields/slug.ts` | Campo `slug` reutilizável (gera a partir do nome) |
| `src/access/index.ts` | Papéis e funções de acesso |
| `src/catalog/spec-template.ts` | Atributos de especificação: sincronizar linhas, validar valores e modelo |
| `src/catalog/score.ts` | Critérios: sincronizar linhas, nota final, validar pesos, faixas |
| `src/catalog/product-status.ts` | Requisitos para sair de rascunho / publicar análise |
| `src/catalog/price-range.ts` | Faixa de preço exibida + validação de preços |
| `src/catalog/outbound.ts` | Destino de `/ir/{id}` |
| `src/catalog/maintenance.ts` | Consultas e URLs das telas de manutenção |
| `src/collections/catalog-rules.ts` | `loadSubcategoryRules` (carrega modelo e critérios da subcategoria) |
| `src/collections/Users.ts` | + papel, primeiro usuário admin, acesso |
| `src/collections/Media.ts` + `media-rules.ts` | + acesso, validação do crédito |
| `src/collections/Categories.ts` + `categories/hooks.ts` | Categorias e subcategorias |
| `src/collections/Brands.ts`, `src/collections/Stores.ts` | Marcas e lojas |
| `src/collections/Products.ts` + `products/hooks.ts` | Produtos |
| `src/collections/Variants.ts` + `variants/hooks.ts` | Variantes |
| `src/collections/Offers.ts` + `offers/hooks.ts` | Ofertas |
| `src/app/(frontend)/ir/[id]/route.ts` | Redirecionamento de afiliado |
| `src/components/admin/MaintenancePanel.tsx` | Painel "Manutenção" no início do admin |
| `src/seed/taxonomy.ts` + `scripts/seed-taxonomy.ts` | Categorias iniciais (spec §3.1, §9.4) |
| `scripts/with-env.mjs` | Roda um comando com as variáveis de outro arquivo `.env` |
| `tests/int/helpers/fixtures.ts` | Fábricas de dados de teste + limpeza |

---

### Task 1: Pendências menores da Fase 0

**Files:**
- Modify: `src/lib/env.ts`, `tests/unit/env.test.ts`, `src/collections/media-rules.ts`, `src/collections/Media.ts`, `tests/unit/media-rules.test.ts`, `tests/int/setup.ts`, `package.json`

**Interfaces:**
- Consumes: `readEnv` (Fase 0), `validateAlt` (Fase 0)
- Produces:
  - `requiredText(message: string): TextFieldSingleValidation`
  - `validateCredit`
  - `readEnv` passa a recusar `R2_ENDPOINT`/`R2_PUBLIC_URL` que não sejam URLs `https://` completas

- [ ] **Step 1: Testes que devem falhar**

  Acrescente ao final de `tests/unit/env.test.ts`, dentro do `describe('readEnv', …)`, antes do `})` final:
  ```ts
  it.each(['R2_PUBLIC_URL', 'R2_ENDPOINT'])('recusa %s sem https://', (key) => {
    expect(() => readEnv({ ...base, ...r2, [key]: 'pub-123.r2.dev' })).toThrow(`${key} precisa ser uma URL https:// completa`)
  })
  ```

  Acrescente ao final de `tests/unit/media-rules.test.ts`:
  ```ts
  describe('validateCredit', () => {
    const call = (value: string | null | undefined) =>
      (validateCredit as (v: typeof value) => true | string)(value)

    it('aceita crédito preenchido', () => {
      expect(call('Divulgação LG')).toBe(true)
    })

    it.each([undefined, null, '', '   '])('recusa %j', (value) => {
      expect(call(value)).toBe('Informe o crédito ou a fonte da imagem.')
    })
  })
  ```
  E troque o import da primeira linha de `@/collections/media-rules` por:
  ```ts
  import { assertImageType, assertUploadSize, MAX_UPLOAD_BYTES, validateAlt, validateCredit } from '@/collections/media-rules'
  ```

- [ ] **Step 2: Rodar e ver falhar**

  Run: `pnpm test:unit`
  Expected: FAIL. Os 2 casos de `env` não lançam erro, e `validateCredit` não é exportado.

- [ ] **Step 3: Implementar**

  Em `src/lib/env.ts`, substitua a última linha de `readR2` (`return { ...config, publicUrl: … }`) por:
  ```ts
    for (const field of ['endpoint', 'publicUrl'] as const) {
      if (!isHttpsUrl(config[field])) {
        throw new Error(`${R2_KEYS[field]} precisa ser uma URL https:// completa (ex.: https://exemplo.com).`)
      }
    }
    return { ...config, publicUrl: config.publicUrl.replace(/\/+$/, '') }
  ```
  E acrescente no fim do arquivo:
  ```ts
  function isHttpsUrl(value: string): boolean {
    try {
      return new URL(value).protocol === 'https:'
    } catch {
      return false
    }
  }
  ```

  Em `src/collections/media-rules.ts`, substitua a definição de `validateAlt` por:
  ```ts
  export function requiredText(message: string): TextFieldSingleValidation {
    return (value) => (typeof value === 'string' && value.trim().length > 0 ? true : message)
  }

  export const validateAlt = requiredText('Descreva a imagem: o texto alternativo é obrigatório.')

  export const validateCredit = requiredText('Informe o crédito ou a fonte da imagem.')
  ```

  Em `src/collections/Media.ts`, troque o import por:
  ```ts
  import { ALLOWED_IMAGE_TYPES, rejectInvalidUpload, validateAlt, validateCredit } from './media-rules'
  ```
  E no campo `credit` acrescente `validate: validateCredit,` logo após `required: true,`.

- [ ] **Step 4: Rodar e ver passar**

  Run: `pnpm test:unit`
  Expected: PASS.

- [ ] **Step 5: Fixar o Node e proteger o banco de teste**

  Em `package.json`, troque `"node": "^18.20.2 || >=20.9.0"` por `"node": "24.x"`.

  Em `tests/int/setup.ts`, logo depois do primeiro `if (!process.env.TEST_DATABASE_URL) { … }`, acrescente:
  ```ts
  if (process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL não pode ser igual a DATABASE_URL: os testes apagam dados.')
  }
  ```
  No CI as duas variáveis apontam para o mesmo Postgres descartável. Por isso, em `.github/workflows/ci.yml`, troque a linha `DATABASE_URL: postgres://decicompra:decicompra@localhost:5432/decicompra_test` por:
  ```yaml
        DATABASE_URL: postgres://decicompra:decicompra@localhost:5432/decicompra_test?application_name=app
  ```

- [ ] **Step 6: Verificar e fazer o commit**

  Run: `pnpm test:unit && pnpm test:int && pnpm typecheck`
  Expected: tudo PASS.

  ```bash
  git add -A
  git commit -m "fix: valida URLs do R2, crédito não vazio, Node 24 fixo e proteção do banco de teste" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 2: Slugs e utilitários de relação e URL

**Files:**
- Create: `src/lib/slug.ts`, `src/lib/url.ts`, `src/lib/relations.ts`, `src/fields/slug.ts`, `tests/unit/slug.test.ts`, `tests/unit/url-relations.test.ts`

**Interfaces:**
- Consumes: nada
- Produces:
  - `slugify(text: string): string`
  - `SLUG_PATTERN: RegExp`
  - `isHttpsUrl(value: unknown): boolean`
  - `httpsUrl(options?: { optional?: boolean }): TextFieldSingleValidation`
  - `relId(value: unknown): number | string | null`
  - `pick<T>(data, original, key): T | undefined`
  - `slugField(source?: string): TextField`

- [ ] **Step 1: Testes**

  `tests/unit/slug.test.ts`:
  ```ts
  import { describe, expect, it } from 'vitest'

  import { slugField } from '@/fields/slug'
  import { SLUG_PATTERN, slugify } from '@/lib/slug'

  describe('slugify', () => {
    it.each([
      ['TVs & Entretenimento', 'tvs-e-entretenimento'],
      ['Casa & Eletrodomésticos', 'casa-e-eletrodomesticos'],
      ['Air Fryers', 'air-fryers'],
      ['LG C4 OLED 55"', 'lg-c4-oled-55'],
      ['  --Olá, Mundo!--  ', 'ola-mundo'],
      ['Ar-condicionado', 'ar-condicionado'],
    ])('%s → %s', (input, expected) => {
      expect(slugify(input)).toBe(expected)
      expect(SLUG_PATTERN.test(expected)).toBe(true)
    })
  })

  describe('slugField', () => {
    const field = slugField('name')
    const hook = field.hooks!.beforeValidate![0] as (args: Record<string, unknown>) => unknown
    const validate = field.validate as (value: unknown) => true | string

    it('gera o slug a partir do nome quando vazio', () => {
      expect(hook({ value: '', siblingData: { name: 'Air Fryers' } })).toBe('air-fryers')
    })

    it('normaliza o slug digitado', () => {
      expect(hook({ value: 'Minha Slug Ç', siblingData: { name: 'x' } })).toBe('minha-slug-c')
    })

    it('valida o formato', () => {
      expect(validate('air-fryers')).toBe(true)
      expect(validate('Air Fryers')).toBe('Slug inválido: use letras minúsculas, números e hífens.')
      expect(validate('')).toBe('Slug inválido: use letras minúsculas, números e hífens.')
    })
  })
  ```

  `tests/unit/url-relations.test.ts`:
  ```ts
  import { describe, expect, it } from 'vitest'

  import { pick, relId } from '@/lib/relations'
  import { httpsUrl, isHttpsUrl } from '@/lib/url'

  describe('isHttpsUrl / httpsUrl', () => {
    it('aceita só https completo', () => {
      expect(isHttpsUrl('https://www.amazon.com.br/dp/X')).toBe(true)
      expect(isHttpsUrl('http://www.amazon.com.br')).toBe(false)
      expect(isHttpsUrl('www.amazon.com.br')).toBe(false)
      expect(isHttpsUrl(undefined)).toBe(false)
    })

    it('validador obrigatório e opcional', () => {
      const required = httpsUrl() as (v: unknown) => true | string
      const optional = httpsUrl({ optional: true }) as (v: unknown) => true | string
      expect(required('https://a.com')).toBe(true)
      expect(required('')).toBe('Informe uma URL completa começando com https://')
      expect(optional('')).toBe(true)
      expect(optional('ftp://a.com')).toBe('Informe uma URL completa começando com https://')
    })
  })

  describe('relId', () => {
    it.each([
      [5, 5],
      ['7', '7'],
      [{ id: 9, name: 'x' }, 9],
      [null, null],
      [undefined, null],
      ['', null],
    ])('%j → %j', (input, expected) => {
      expect(relId(input)).toBe(expected)
    })
  })

  describe('pick', () => {
    it('prefere o dado novo, inclusive null, e cai no original quando a chave não veio', () => {
      expect(pick({ a: 1 }, { a: 2 }, 'a')).toBe(1)
      expect(pick({ a: null }, { a: 2 }, 'a')).toBeNull()
      expect(pick({}, { a: 2 }, 'a')).toBe(2)
      expect(pick(undefined, undefined, 'a')).toBeUndefined()
    })
  })
  ```

- [ ] **Step 2: Rodar e ver falhar**

  Run: `pnpm test:unit`
  Expected: FAIL. Os módulos `@/lib/slug`, `@/fields/slug`, `@/lib/url` e `@/lib/relations` não existem.

- [ ] **Step 3: Implementar**

  `src/lib/slug.ts`:
  ```ts
  export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

  // "TVs & Entretenimento" → "tvs-e-entretenimento"
  export function slugify(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/&/g, ' e ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  ```

  `src/lib/url.ts`:
  ```ts
  import type { TextFieldSingleValidation } from 'payload'

  const MESSAGE = 'Informe uma URL completa começando com https://'

  export function isHttpsUrl(value: unknown): boolean {
    if (typeof value !== 'string') return false
    try {
      return new URL(value).protocol === 'https:'
    } catch {
      return false
    }
  }

  export function httpsUrl(options: { optional?: boolean } = {}): TextFieldSingleValidation {
    return (value) => {
      if (options.optional && (value === null || value === undefined || String(value).trim() === '')) return true
      return isHttpsUrl(value) ? true : MESSAGE
    }
  }
  ```

  `src/lib/relations.ts`:
  ```ts
  // ID de um relacionamento, venha ele como número, texto ou documento populado
  export function relId(value: unknown): number | string | null {
    if (value === null || value === undefined || value === '') return null
    if (typeof value === 'number' || typeof value === 'string') return value
    if (typeof value === 'object' && 'id' in value) return relId((value as { id: unknown }).id)
    return null
  }

  // Valor de um campo durante um hook: o dado novo quando a chave veio; senão, o do documento original
  export function pick<T = unknown>(
    data: Record<string, unknown> | undefined,
    original: Record<string, unknown> | undefined,
    key: string,
  ): T | undefined {
    if (data && key in data) return data[key] as T
    return original?.[key] as T | undefined
  }
  ```

  `src/fields/slug.ts`:
  ```ts
  import type { TextField, TextFieldSingleValidation } from 'payload'

  import { SLUG_PATTERN, slugify } from '../lib/slug'

  const validateSlug: TextFieldSingleValidation = (value) =>
    typeof value === 'string' && SLUG_PATTERN.test(value)
      ? true
      : 'Slug inválido: use letras minúsculas, números e hífens.'

  export function slugField(source = 'name'): TextField {
    return {
      name: 'slug',
      label: 'Slug (endereço)',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validateSlug,
      admin: {
        position: 'sidebar',
        description: 'Gerado a partir do nome se ficar vazio. Só letras minúsculas, números e hífens.',
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData, data }) => {
            const typed = typeof value === 'string' ? value.trim() : ''
            if (typed) return slugify(typed)
            const sourceValue = (siblingData?.[source] ?? data?.[source]) as unknown
            return typeof sourceValue === 'string' ? slugify(sourceValue) : value
          },
        ],
      },
    }
  }
  ```

  Em `src/lib/env.ts`, apague a função local `isHttpsUrl` criada na Tarefa 1 e importe a compartilhada, junto aos imports do topo:
  ```ts
  import { isHttpsUrl } from './url'
  ```

- [ ] **Step 4: Rodar e ver passar**

  Run: `pnpm test:unit`
  Expected: PASS (incluindo os testes de `env` da Tarefa 1).

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat: slugify, campo slug, validador de URL https e utilitários de relação" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 3: Papéis e controle de acesso

**Files:**
- Create: `src/access/index.ts`, `tests/unit/access.test.ts`, `tests/int/helpers/users.ts`, `tests/int/users.int.spec.ts`
- Modify: `src/collections/Users.ts`, `src/collections/Media.ts`, `src/migrations/*` (nova migração `roles`)

**Interfaces:**
- Consumes: nada
- Produces (em `src/access/index.ts`):
  - `type Role = 'admin' | 'editor' | 'redator'`
  - `ROLES`
  - `roleOf(user: unknown): Role | null`
  - `roleForNewUser(requested: Role | null | undefined, existingUsers: number): Role`
  - Funções `Access`:
    - `anyone`
    - `loggedIn`
    - `adminOnly`
    - `adminOrEditor`
    - `adminOrSelf`
    - `readPublishedProducts` (logado → tudo; anônimo → `status != rascunho`)
    - `updateProducts` (admin/editor → tudo; redator → só `status = rascunho`)
  - `adminFieldAccess: FieldAccess` (só admin)
  - Em `tests/int/helpers/users.ts`: `getTestUsers(payload): Promise<Record<Role, User>>`. Cria, nesta ordem, admin, editor e redator com e-mails `<papel>@teste.decicompra.local`, ou reaproveita os que já existem.

- [ ] **Step 1: Testes unitários**

  `tests/unit/access.test.ts`:
  ```ts
  import { describe, expect, it } from 'vitest'

  import {
    adminOnly,
    adminOrEditor,
    adminOrSelf,
    loggedIn,
    readPublishedProducts,
    roleForNewUser,
    roleOf,
    updateProducts,
  } from '@/access'

  const req = (user: unknown) => ({ req: { user } }) as never

  describe('roleOf', () => {
    it('lê o papel válido e ignora o resto', () => {
      expect(roleOf({ role: 'editor' })).toBe('editor')
      expect(roleOf({ role: 'chefe' })).toBeNull()
      expect(roleOf(null)).toBeNull()
    })
  })

  describe('roleForNewUser', () => {
    it('o primeiro usuário é sempre administrador', () => {
      expect(roleForNewUser('redator', 0)).toBe('admin')
      expect(roleForNewUser(undefined, 0)).toBe('admin')
    })

    it('depois, usa o papel pedido ou redator', () => {
      expect(roleForNewUser('editor', 3)).toBe('editor')
      expect(roleForNewUser(undefined, 3)).toBe('redator')
    })
  })

  describe('funções de acesso', () => {
    it('adminOnly, adminOrEditor e loggedIn', () => {
      expect(adminOnly(req({ role: 'admin' }))).toBe(true)
      expect(adminOnly(req({ role: 'editor' }))).toBe(false)
      expect(adminOrEditor(req({ role: 'editor' }))).toBe(true)
      expect(adminOrEditor(req({ role: 'redator' }))).toBe(false)
      expect(loggedIn(req({ role: 'redator' }))).toBe(true)
      expect(loggedIn(req(null))).toBe(false)
    })

    it('adminOrSelf limita o não-admin ao próprio usuário', () => {
      expect(adminOrSelf(req({ id: 1, role: 'admin' }))).toBe(true)
      expect(adminOrSelf(req({ id: 7, role: 'redator' }))).toEqual({ id: { equals: 7 } })
      expect(adminOrSelf(req(null))).toBe(false)
    })

    it('anônimo só lê produtos fora de rascunho', () => {
      expect(readPublishedProducts(req(null))).toEqual({ status: { not_equals: 'rascunho' } })
      expect(readPublishedProducts(req({ role: 'redator' }))).toBe(true)
    })

    it('redator só edita produtos em rascunho', () => {
      expect(updateProducts(req({ role: 'editor' }))).toBe(true)
      expect(updateProducts(req({ role: 'redator' }))).toEqual({ status: { equals: 'rascunho' } })
      expect(updateProducts(req(null))).toBe(false)
    })
  })
  ```

- [ ] **Step 2: Rodar e ver falhar**

  Run: `pnpm test:unit`
  Expected: FAIL. `@/access` não existe.

- [ ] **Step 3: Implementar `src/access/index.ts`**

  ```ts
  import type { Access, FieldAccess } from 'payload'

  export type Role = 'admin' | 'editor' | 'redator'

  export const ROLES: Role[] = ['admin', 'editor', 'redator']

  export function roleOf(user: unknown): Role | null {
    const role = (user as { role?: unknown } | null | undefined)?.role
    return ROLES.includes(role as Role) ? (role as Role) : null
  }

  // O primeiro usuário do sistema é sempre administrador
  export function roleForNewUser(requested: Role | null | undefined, existingUsers: number): Role {
    if (existingUsers === 0) return 'admin'
    return requested ?? 'redator'
  }

  export const anyone: Access = () => true

  export const loggedIn: Access = ({ req }) => Boolean(req.user)

  export const adminOnly: Access = ({ req }) => roleOf(req.user) === 'admin'

  export const adminOrEditor: Access = ({ req }) => {
    const role = roleOf(req.user)
    return role === 'admin' || role === 'editor'
  }

  export const adminOrSelf: Access = ({ req }) => {
    if (roleOf(req.user) === 'admin') return true
    return req.user ? { id: { equals: req.user.id } } : false
  }

  export const readPublishedProducts: Access = ({ req }) =>
    req.user ? true : { status: { not_equals: 'rascunho' } }

  export const updateProducts: Access = ({ req }) => {
    const role = roleOf(req.user)
    if (role === 'admin' || role === 'editor') return true
    if (role === 'redator') return { status: { equals: 'rascunho' } }
    return false
  }

  export const adminFieldAccess: FieldAccess = ({ req }) => roleOf(req.user) === 'admin'
  ```

- [ ] **Step 4: Rodar e ver passar**

  Run: `pnpm test:unit`
  Expected: PASS.

- [ ] **Step 5: Papel nos usuários e acesso na mídia**

  `src/collections/Users.ts`:
  ```ts
  import type { CollectionConfig } from 'payload'

  import { adminFieldAccess, adminOnly, adminOrSelf, loggedIn, roleForNewUser, type Role } from '../access'

  export const Users: CollectionConfig = {
    slug: 'users',
    labels: { singular: 'Usuário', plural: 'Usuários' },
    admin: { useAsTitle: 'name', defaultColumns: ['name', 'email', 'role'], group: 'Sistema' },
    auth: { maxLoginAttempts: 5, lockTime: 15 * 60 * 1000 },
    access: { read: loggedIn, create: adminOnly, update: adminOrSelf, delete: adminOnly },
    hooks: {
      beforeChange: [
        async ({ data, operation, req }) => {
          if (operation === 'create') {
            const { totalDocs } = await req.payload.count({ collection: 'users', req, overrideAccess: true })
            data.role = roleForNewUser(data.role as Role | undefined, totalDocs)
          }
          return data
        },
      ],
    },
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      {
        name: 'role',
        label: 'Papel',
        type: 'select',
        required: true,
        defaultValue: 'redator',
        saveToJWT: true,
        access: { create: adminFieldAccess, update: adminFieldAccess },
        admin: {
          position: 'sidebar',
          description: 'Administrador: tudo. Editor: publica e cuida de ofertas. Redator: só rascunhos.',
        },
        options: [
          { label: 'Administrador', value: 'admin' },
          { label: 'Editor', value: 'editor' },
          { label: 'Redator', value: 'redator' },
        ],
      },
    ],
  }
  ```

  Em `src/collections/Media.ts`, acrescente o import:
  ```ts
  import { adminOrEditor, anyone, loggedIn } from '../access'
  ```
  E substitua `access: { read: () => true },` por:
  ```ts
    access: { read: anyone, create: loggedIn, update: loggedIn, delete: adminOrEditor },
  ```
  E acrescente `group: 'Sistema',` dentro de `admin: { … }` da Mídia.

- [ ] **Step 6: Migração (usuários existentes viram administradores)**

  ```bash
  pnpm generate:types
  pnpm payload migrate:create roles
  ```
  Abra o arquivo novo `src/migrations/<data>_roles.ts`. No fim da função `up`, depois do `await db.execute(sql\`…\`)` gerado, acrescente:
  ```ts
    // Usuários criados antes dos papéis são os administradores atuais
    await db.execute(sql`UPDATE "users" SET "role" = 'admin';`)
  ```
  Depois:
  ```bash
  pnpm payload migrate
  ```
  Expected: "Migrated: <data>_roles".

- [ ] **Step 7: Helper de usuários de teste e testes de integração**

  `tests/int/helpers/users.ts`:
  ```ts
  import type { Payload } from 'payload'

  import type { Role } from '@/access'
  import type { User } from '@/payload-types'

  const PASSWORD = 'senha-de-teste-123'

  // Admin primeiro: se a tabela estiver vazia, o primeiro usuário vira admin de qualquer forma
  export async function getTestUsers(payload: Payload): Promise<Record<Role, User>> {
    const result = {} as Record<Role, User>
    for (const role of ['admin', 'editor', 'redator'] as const) {
      const email = `${role}@teste.decicompra.local`
      const found = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
      result[role] =
        found.docs[0] ??
        (await payload.create({ collection: 'users', data: { name: `Teste ${role}`, email, password: PASSWORD, role } }))
    }
    return result
  }
  ```

  `tests/int/users.int.spec.ts`:
  ```ts
  import { describe, expect, it } from 'vitest'

  import { getTestPayload } from './helpers/getTestPayload'
  import { getTestUsers } from './helpers/users'

  describe('Usuários e papéis', () => {
    it('os usuários de teste têm os papéis pedidos', async () => {
      const payload = await getTestPayload()
      const users = await getTestUsers(payload)
      expect(users.admin.role).toBe('admin')
      expect(users.editor.role).toBe('editor')
      expect(users.redator.role).toBe('redator')
    })

    it('redator não cria usuários', async () => {
      const payload = await getTestPayload()
      const { redator } = await getTestUsers(payload)
      await expect(
        payload.create({
          collection: 'users',
          data: { name: 'Intruso', email: 'intruso@teste.decicompra.local', password: 'x-123456789', role: 'admin' },
          user: redator,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })

    it('redator não muda o próprio papel', async () => {
      const payload = await getTestPayload()
      const { redator } = await getTestUsers(payload)
      const updated = await payload.update({
        collection: 'users',
        id: redator.id,
        data: { role: 'admin' },
        user: redator,
        overrideAccess: false,
      })
      expect(updated.role).toBe('redator')
    })

    it('redator não edita outro usuário', async () => {
      const payload = await getTestPayload()
      const { redator, editor } = await getTestUsers(payload)
      await expect(
        payload.update({ collection: 'users', id: editor.id, data: { name: 'Hack' }, user: redator, overrideAccess: false }),
      ).rejects.toThrow()
    })
  })
  ```

- [ ] **Step 8: Rodar os testes**

  Run: `pnpm test:unit && pnpm test:int`
  Expected: PASS (incluindo os 4 testes de `users.int.spec.ts`).

- [ ] **Step 9: Conferir no painel**

  Run: `pnpm dev` → http://localhost:3000/admin.

  Esperado:
  - o seu usuário aparece com **Papel: Administrador**
  - o menu lateral mostra o grupo **Sistema** (Usuários, Mídia)

  Pare o servidor.

- [ ] **Step 10: Commit**

  ```bash
  git add -A
  git commit -m "feat: papéis Administrador/Editor/Redator e controle de acesso" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 4: Regras de especificações e de nota (módulos puros)

**Files:**
- Create: `src/catalog/spec-template.ts`, `src/catalog/score.ts`, `tests/unit/spec-template.test.ts`, `tests/unit/score.test.ts`

**Interfaces:**
- Consumes: nada
- Produces, em `src/catalog/spec-template.ts`:
  - `type SpecType = 'number' | 'text' | 'boolean' | 'option'`
  - `type SpecDirection = 'higher' | 'lower' | 'neutral'`
  - `type SpecAttribute = { key; label; type; unit?; options?; group?; direction?; highlight?; comparable?; required?; perVariant? }`
  - `type SpecRow = { id?: string | null; key: string; label?: string | null; value?: string | null }`
  - `type SpecScope = 'product' | 'variant'`
  - `KEY_PATTERN`
  - `syncSpecRows(template, rows, scope): SpecRow[]`
  - `validateSpecValue(attr, value): string | null`
  - `specValueErrors(template, rows): string[]`
  - `missingRequiredSpecs(template, rows, scope): string[]` (rótulos)
  - `validateSpecTemplate(template): string[]`
- Produces, em `src/catalog/score.ts`:
  - `type Criterion = { key: string; name: string; weight: number; description?: string | null }`
  - `type ScoreRow = { id?: string | null; key: string; label?: string | null; score?: number | null; justification?: string | null }`
  - `syncScoreRows(criteria, rows): ScoreRow[]`
  - `computeFinalScore(criteria, rows): number | null`
  - `validateCriteria(criteria): string[]`
  - `scoreBand(score: number): string`

- [ ] **Step 1: Testes**

  `tests/unit/spec-template.test.ts`:
  ```ts
  import { describe, expect, it } from 'vitest'

  import {
    missingRequiredSpecs,
    specValueErrors,
    syncSpecRows,
    validateSpecTemplate,
    validateSpecValue,
    type SpecAttribute,
  } from '@/catalog/spec-template'

  const template: SpecAttribute[] = [
    { key: 'painel', label: 'Painel', type: 'option', options: ['OLED', 'QLED', 'LED'], required: true },
    { key: 'taxa_atualizacao', label: 'Taxa de atualização', type: 'number', unit: 'Hz' },
    { key: 'tamanho', label: 'Tamanho', type: 'number', unit: '"', perVariant: true, required: true },
    { key: 'dolby_vision', label: 'Dolby Vision', type: 'boolean' },
  ]

  describe('syncSpecRows', () => {
    it('cria uma linha por atributo do escopo, na ordem do modelo, com rótulo e unidade', () => {
      expect(syncSpecRows(template, [], 'product')).toEqual([
        { key: 'painel', label: 'Painel', value: null },
        { key: 'taxa_atualizacao', label: 'Taxa de atualização (Hz)', value: null },
        { key: 'dolby_vision', label: 'Dolby Vision', value: null },
      ])
      expect(syncSpecRows(template, null, 'variant')).toEqual([{ key: 'tamanho', label: 'Tamanho (")', value: null }])
    })

    it('preserva valores e ids existentes e descarta chaves que saíram do modelo', () => {
      const rows = [
        { id: 'r1', key: 'dolby_vision', value: 'sim' },
        { id: 'r2', key: 'antigo', value: 'x' },
      ]
      const synced = syncSpecRows(template, rows, 'product')
      expect(synced.map((r) => r.key)).toEqual(['painel', 'taxa_atualizacao', 'dolby_vision'])
      expect(synced[2]).toEqual({ id: 'r1', key: 'dolby_vision', label: 'Dolby Vision', value: 'sim' })
    })
  })

  describe('validateSpecValue', () => {
    const [painel, taxa, , dolby] = template

    it('aceita vazio (obrigatoriedade é checada só na publicação)', () => {
      expect(validateSpecValue(taxa, '')).toBeNull()
      expect(validateSpecValue(taxa, null)).toBeNull()
    })

    it.each(['120', '4,5', '4.5', '-2'])('número aceita %s (vírgula decimal inclusive)', (v) => {
      expect(validateSpecValue(taxa, v)).toBeNull()
    })

    it('número recusa texto', () => {
      expect(validateSpecValue(taxa, '120Hz')).toBe('"Taxa de atualização" precisa ser um número.')
    })

    it('sim/não', () => {
      expect(validateSpecValue(dolby, 'Sim')).toBeNull()
      expect(validateSpecValue(dolby, 'nao')).toBeNull()
      expect(validateSpecValue(dolby, 'talvez')).toBe('"Dolby Vision" precisa ser "sim" ou "não".')
    })

    it('opção', () => {
      expect(validateSpecValue(painel, 'OLED')).toBeNull()
      expect(validateSpecValue(painel, 'Plasma')).toBe('"Painel" precisa ser uma das opções: OLED, QLED, LED.')
    })
  })

  describe('specValueErrors e missingRequiredSpecs', () => {
    it('lista erros de tipo e obrigatórios vazios do escopo', () => {
      const rows = [
        { key: 'painel', value: '' },
        { key: 'taxa_atualizacao', value: 'rápida' },
      ]
      expect(specValueErrors(template, rows)).toEqual(['"Taxa de atualização" precisa ser um número.'])
      expect(missingRequiredSpecs(template, rows, 'product')).toEqual(['Painel'])
      expect(missingRequiredSpecs(template, [], 'variant')).toEqual(['Tamanho'])
    })
  })

  describe('validateSpecTemplate', () => {
    it('aceita um modelo válido', () => {
      expect(validateSpecTemplate(template)).toEqual([])
    })

    it('recusa chave repetida, chave fora do padrão e opção sem lista', () => {
      expect(
        validateSpecTemplate([
          { key: 'painel', label: 'A', type: 'text' },
          { key: 'painel', label: 'B', type: 'text' },
          { key: 'Taxa Hz', label: 'C', type: 'number' },
          { key: 'cor', label: 'Cor', type: 'option', options: [] },
        ]),
      ).toEqual([
        'A chave "painel" está repetida.',
        'A chave "Taxa Hz" é inválida: use letras minúsculas, números e _ (ex.: taxa_atualizacao).',
        'O atributo "Cor" é do tipo opção e precisa de pelo menos uma opção.',
      ])
    })
  })
  ```

  `tests/unit/score.test.ts`:
  ```ts
  import { describe, expect, it } from 'vitest'

  import { computeFinalScore, scoreBand, syncScoreRows, validateCriteria, type Criterion } from '@/catalog/score'

  const criteria: Criterion[] = [
    { key: 'imagem', name: 'Imagem', weight: 60 },
    { key: 'custo_beneficio', name: 'Custo-benefício', weight: 40 },
  ]

  describe('syncScoreRows', () => {
    it('uma linha por critério, com rótulo "Nome (peso%)", preservando notas', () => {
      expect(syncScoreRows(criteria, [{ id: 'x', key: 'custo_beneficio', score: 7 }, { key: 'velho', score: 1 }])).toEqual([
        { key: 'imagem', label: 'Imagem (60%)', score: null },
        { id: 'x', key: 'custo_beneficio', label: 'Custo-benefício (40%)', score: 7 },
      ])
    })
  })

  describe('computeFinalScore', () => {
    it('média ponderada com uma casa decimal', () => {
      expect(computeFinalScore(criteria, [{ key: 'imagem', score: 9 }, { key: 'custo_beneficio', score: 7.5 }])).toBe(8.4)
      expect(computeFinalScore(criteria, [{ key: 'imagem', score: 8.3 }, { key: 'custo_beneficio', score: 7.1 }])).toBe(7.8)
    })

    it('vazia quando falta nota ou não há critérios', () => {
      expect(computeFinalScore(criteria, [{ key: 'imagem', score: 9 }])).toBeNull()
      expect(computeFinalScore(criteria, [{ key: 'imagem', score: 9 }, { key: 'custo_beneficio', score: null }])).toBeNull()
      expect(computeFinalScore([], [])).toBeNull()
    })
  })

  describe('validateCriteria', () => {
    it('aceita pesos que somam 100 e lista vazia', () => {
      expect(validateCriteria(criteria)).toEqual([])
      expect(validateCriteria([])).toEqual([])
    })

    it('recusa soma diferente de 100, peso não positivo e chave repetida', () => {
      expect(
        validateCriteria([
          { key: 'imagem', name: 'Imagem', weight: 70 },
          { key: 'imagem', name: 'Imagem 2', weight: 0 },
        ]),
      ).toEqual([
        'A chave "imagem" está repetida.',
        'O peso de "Imagem 2" precisa ser maior que zero.',
        'A soma dos pesos precisa ser exatamente 100 (atual: 70).',
      ])
    })
  })

  describe('scoreBand', () => {
    it.each([
      [9.5, 'Excepcional'],
      [9, 'Excepcional'],
      [8.9, 'Muito bom'],
      [8, 'Muito bom'],
      [7.2, 'Bom'],
      [6, 'Regular'],
      [5.9, 'Não recomendado'],
    ])('%s → %s', (score, band) => {
      expect(scoreBand(score)).toBe(band)
    })
  })
  ```

- [ ] **Step 2: Rodar e ver falhar**

  Run: `pnpm test:unit`
  Expected: FAIL. Os módulos `@/catalog/spec-template` e `@/catalog/score` não existem.

- [ ] **Step 3: Implementar `src/catalog/spec-template.ts`**

  ```ts
  export type SpecType = 'number' | 'text' | 'boolean' | 'option'
  export type SpecDirection = 'higher' | 'lower' | 'neutral'

  export type SpecAttribute = {
    key: string
    label: string
    type: SpecType
    unit?: string | null
    options?: string[] | null
    group?: string | null
    direction?: SpecDirection | null
    highlight?: boolean | null
    comparable?: boolean | null
    required?: boolean | null
    perVariant?: boolean | null
  }

  export type SpecRow = { id?: string | null; key: string; label?: string | null; value?: string | null }

  export type SpecScope = 'product' | 'variant'

  export const KEY_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/

  function inScope(attr: SpecAttribute, scope: SpecScope): boolean {
    return scope === 'variant' ? Boolean(attr.perVariant) : !attr.perVariant
  }

  function rowLabel(attr: SpecAttribute): string {
    return attr.unit ? `${attr.label} (${attr.unit})` : attr.label
  }

  // Uma linha por atributo do escopo, na ordem do modelo; valores existentes são mantidos
  export function syncSpecRows(
    template: SpecAttribute[],
    rows: SpecRow[] | null | undefined,
    scope: SpecScope,
  ): SpecRow[] {
    const byKey = new Map((rows ?? []).map((row) => [row.key, row]))
    return template
      .filter((attr) => inScope(attr, scope))
      .map((attr) => {
        const existing = byKey.get(attr.key)
        return existing
          ? { ...existing, key: attr.key, label: rowLabel(attr) }
          : { key: attr.key, label: rowLabel(attr), value: null }
      })
  }

  export function validateSpecValue(attr: SpecAttribute, value: string | null | undefined): string | null {
    const v = value?.trim()
    if (!v) return null
    switch (attr.type) {
      case 'number':
        return /^-?\d+(?:[.,]\d+)?$/.test(v) ? null : `"${attr.label}" precisa ser um número.`
      case 'boolean':
        return ['sim', 'não', 'nao'].includes(v.toLowerCase()) ? null : `"${attr.label}" precisa ser "sim" ou "não".`
      case 'option': {
        const options = attr.options ?? []
        return options.includes(v) ? null : `"${attr.label}" precisa ser uma das opções: ${options.join(', ')}.`
      }
      default:
        return null
    }
  }

  export function specValueErrors(template: SpecAttribute[], rows: SpecRow[]): string[] {
    const byKey = new Map(template.map((attr) => [attr.key, attr]))
    return rows.flatMap((row) => {
      const attr = byKey.get(row.key)
      const error = attr ? validateSpecValue(attr, row.value) : null
      return error ? [error] : []
    })
  }

  export function missingRequiredSpecs(template: SpecAttribute[], rows: SpecRow[], scope: SpecScope): string[] {
    const values = new Map(rows.map((row) => [row.key, row.value?.trim()]))
    return template.filter((attr) => inScope(attr, scope) && attr.required && !values.get(attr.key)).map((attr) => attr.label)
  }

  export function validateSpecTemplate(template: SpecAttribute[]): string[] {
    const errors: string[] = []
    const seen = new Set<string>()
    for (const attr of template) {
      if (seen.has(attr.key)) errors.push(`A chave "${attr.key}" está repetida.`)
      seen.add(attr.key)
      if (!KEY_PATTERN.test(attr.key)) {
        errors.push(`A chave "${attr.key}" é inválida: use letras minúsculas, números e _ (ex.: taxa_atualizacao).`)
      }
      if (attr.type === 'option' && (attr.options ?? []).length === 0) {
        errors.push(`O atributo "${attr.label}" é do tipo opção e precisa de pelo menos uma opção.`)
      }
    }
    return errors
  }
  ```

- [ ] **Step 4: Implementar `src/catalog/score.ts`**

  ```ts
  import { KEY_PATTERN } from './spec-template'

  export type Criterion = { key: string; name: string; weight: number; description?: string | null }

  export type ScoreRow = {
    id?: string | null
    key: string
    label?: string | null
    score?: number | null
    justification?: string | null
  }

  export function syncScoreRows(criteria: Criterion[], rows: ScoreRow[] | null | undefined): ScoreRow[] {
    const byKey = new Map((rows ?? []).map((row) => [row.key, row]))
    return criteria.map((criterion) => {
      const label = `${criterion.name} (${criterion.weight}%)`
      const existing = byKey.get(criterion.key)
      return existing ? { ...existing, key: criterion.key, label } : { key: criterion.key, label, score: null }
    })
  }

  // Média ponderada (pesos somam 100) com uma casa decimal; vazia se faltar alguma nota
  export function computeFinalScore(criteria: Criterion[], rows: ScoreRow[]): number | null {
    if (criteria.length === 0) return null
    const scores = new Map(rows.map((row) => [row.key, row.score]))
    let total = 0
    for (const criterion of criteria) {
      const score = scores.get(criterion.key)
      if (score === null || score === undefined || Number.isNaN(score)) return null
      total += criterion.weight * score
    }
    return Math.round((total / 100 + Number.EPSILON) * 10) / 10
  }

  export function validateCriteria(criteria: Criterion[]): string[] {
    if (criteria.length === 0) return []
    const errors: string[] = []
    const seen = new Set<string>()
    for (const criterion of criteria) {
      if (seen.has(criterion.key)) errors.push(`A chave "${criterion.key}" está repetida.`)
      seen.add(criterion.key)
      if (!KEY_PATTERN.test(criterion.key)) {
        errors.push(`A chave "${criterion.key}" é inválida: use letras minúsculas, números e _ (ex.: custo_beneficio).`)
      }
      if (!(criterion.weight > 0)) errors.push(`O peso de "${criterion.name}" precisa ser maior que zero.`)
    }
    const sum = criteria.reduce((acc, criterion) => acc + (criterion.weight || 0), 0)
    if (Math.abs(sum - 100) > 1e-9) errors.push(`A soma dos pesos precisa ser exatamente 100 (atual: ${sum}).`)
    return errors
  }

  export function scoreBand(score: number): string {
    if (score >= 9) return 'Excepcional'
    if (score >= 8) return 'Muito bom'
    if (score >= 7) return 'Bom'
    if (score >= 6) return 'Regular'
    return 'Não recomendado'
  }
  ```

- [ ] **Step 5: Rodar e ver passar**

  Run: `pnpm test:unit`
  Expected: PASS.

- [ ] **Step 6: Commit**

  ```bash
  git add -A
  git commit -m "feat: regras de especificações e da nota DeciCompra" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 5: Categorias e subcategorias

**Files:**
- Create: `src/collections/Categories.ts`, `src/collections/categories/hooks.ts`, `src/collections/catalog-rules.ts`, `tests/int/helpers/fixtures.ts`, `tests/int/categories.int.spec.ts`
- Modify: `src/payload.config.ts`, `src/migrations/*` (nova migração `categories`)

**Interfaces:**
- Consumes:
  - `slugField`
  - `relId`, `pick`
  - `adminOrEditor`, `anyone`
  - `validateSpecTemplate`, `validateCriteria`
  - os tipos `SpecAttribute`, `Criterion`
- Produces:
  - **Coleção `categories`**, com os campos:
    - `name`, `slug`, `parent` (só categoria de 1º nível), `description`, `icon`, `order`, `active`
    - só em subcategorias: `isAnchor`, `specTemplate` e `criteria`
      - linhas de `specTemplate`: `key, label, type, unit, options, group, direction, highlight, comparable, required, perVariant`
      - linhas de `criteria`: `key, name, description, weight`
  - **Hooks:**
    - `validateCategory` (beforeChange)
    - `guardCategoryDelete` (beforeDelete). Nesta tarefa ele bloqueia só por subcategorias; a Tarefa 8 acrescenta o bloqueio por produtos.
  - **`loadSubcategoryRules(req, id)`:** devolve `Promise<{ template: SpecAttribute[]; criteria: Criterion[] }>`, ou listas vazias quando `id` é nulo.
  - **Em `tests/int/helpers/fixtures.ts`:**
    - `uid()` e `Tracker` (com `add(collection, id)` e `cleanup()`)
    - `sampleSpecTemplate` e `sampleCriteria`
    - `createCategoryPair(payload, tracker, overrides?)`, que devolve `{ category, subcategory }`

- [ ] **Step 1: Escrever os helpers de teste e os testes**

  `tests/int/helpers/fixtures.ts`:
  ```ts
  import type { CollectionSlug, Payload } from 'payload'

  import type { Criterion } from '@/catalog/score'
  import type { SpecAttribute } from '@/catalog/spec-template'

  export function uid(): string {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
  }

  // Registra o que o teste criou e apaga na ordem inversa
  export class Tracker {
    private items: [CollectionSlug, number | string][] = []

    constructor(private payload: Payload) {}

    add<T extends { id: number | string }>(collection: CollectionSlug, doc: T): T {
      this.items.push([collection, doc.id])
      return doc
    }

    async cleanup(): Promise<void> {
      for (const [collection, id] of this.items.reverse()) {
        await this.payload.delete({ collection, id }).catch(() => undefined)
      }
      this.items = []
    }
  }

  export const sampleSpecTemplate: SpecAttribute[] = [
    { key: 'painel', label: 'Painel', type: 'option', options: ['OLED', 'QLED', 'LED'], required: true, comparable: true, highlight: true },
    { key: 'taxa_atualizacao', label: 'Taxa de atualização', type: 'number', unit: 'Hz', direction: 'higher', comparable: true },
    { key: 'tamanho', label: 'Tamanho', type: 'number', unit: '"', perVariant: true, required: true, comparable: true },
  ]

  export const sampleCriteria: Criterion[] = [
    { key: 'imagem', name: 'Imagem', weight: 60 },
    { key: 'custo_beneficio', name: 'Custo-benefício', weight: 40 },
  ]

  export async function createCategoryPair(
    payload: Payload,
    tracker: Tracker,
    overrides: { specTemplate?: SpecAttribute[]; criteria?: Criterion[] } = {},
  ) {
    const id = uid()
    const category = tracker.add(
      'categories',
      await payload.create({ collection: 'categories', data: { name: `Categoria ${id}`, slug: `cat-${id}` } }),
    )
    const subcategory = tracker.add(
      'categories',
      await payload.create({
        collection: 'categories',
        data: {
          name: `Sub ${id}`,
          slug: `sub-${id}`,
          parent: category.id,
          specTemplate: overrides.specTemplate ?? sampleSpecTemplate,
          criteria: overrides.criteria ?? sampleCriteria,
        },
      }),
    )
    return { category, subcategory }
  }
  ```

  `tests/int/categories.int.spec.ts`:
  ```ts
  import { APIError, ValidationError } from 'payload'
  import { afterAll, describe, expect, it } from 'vitest'

  import { createCategoryPair, Tracker, uid } from './helpers/fixtures'
  import { getTestPayload } from './helpers/getTestPayload'
  import { getTestUsers } from './helpers/users'

  const payloadPromise = getTestPayload()
  let tracker: Tracker

  afterAll(async () => tracker?.cleanup())

  async function setup() {
    const payload = await payloadPromise
    tracker ??= new Tracker(payload)
    return payload
  }

  describe('Categorias', () => {
    it('cria categoria e subcategoria e gera o slug pelo nome', async () => {
      const payload = await setup()
      const id = uid()
      const doc = tracker.add('categories', await payload.create({ collection: 'categories', data: { name: `Casa & Lar ${id}` } }))
      expect(doc.slug).toBe(`casa-e-lar-${id}`)
      const { subcategory } = await createCategoryPair(payload, tracker)
      expect(subcategory.criteria).toHaveLength(2)
    })

    it('categoria de 1º nível não guarda modelo, critérios nem âncora', async () => {
      const payload = await setup()
      const doc = tracker.add(
        'categories',
        await payload.create({
          collection: 'categories',
          data: { name: `Topo ${uid()}`, isAnchor: true, criteria: [{ key: 'x', name: 'X', weight: 100 }] },
        }),
      )
      expect(doc.criteria).toEqual([])
      expect(doc.isAnchor).toBe(false)
    })

    it('recusa pesos que não somam 100', async () => {
      const payload = await setup()
      const error = await createCategoryPair(payload, tracker, {
        criteria: [{ key: 'imagem', name: 'Imagem', weight: 50 }],
      }).catch((e: unknown) => e)
      expect(error).toBeInstanceOf(ValidationError)
      expect(JSON.stringify((error as ValidationError).data)).toContain('soma dos pesos precisa ser exatamente 100')
    })

    it('recusa 3 níveis', async () => {
      const payload = await setup()
      const { subcategory } = await createCategoryPair(payload, tracker)
      const error = await payload
        .create({ collection: 'categories', data: { name: `Neta ${uid()}`, parent: subcategory.id } })
        .catch((e: unknown) => e)
      expect(error).toBeInstanceOf(ValidationError)
      expect(JSON.stringify((error as ValidationError).data)).toContain('só existem 2 níveis')
    })

    it('não apaga categoria que tem subcategorias', async () => {
      const payload = await setup()
      const { category } = await createCategoryPair(payload, tracker)
      const error = await payload.delete({ collection: 'categories', id: category.id }).catch((e: unknown) => e)
      expect(error).toBeInstanceOf(APIError)
      expect((error as APIError).status).toBe(409)
    })

    it('redator não cria categorias; anônimo lê', async () => {
      const payload = await setup()
      const { redator } = await getTestUsers(payload)
      await expect(
        payload.create({ collection: 'categories', data: { name: `X ${uid()}` }, user: redator, overrideAccess: false }),
      ).rejects.toThrow()
      const read = await payload.find({ collection: 'categories', limit: 1, overrideAccess: false })
      expect(read.docs).toBeDefined()
    })
  })
  ```

- [ ] **Step 2: Rodar e ver falhar**

  Run: `pnpm test:int`
  Expected: FAIL. A coleção `categories` não existe ("collection not found" ou erro de tipo).

- [ ] **Step 3: Implementar regras e hooks**

  `src/collections/catalog-rules.ts`:
  ```ts
  import type { PayloadRequest } from 'payload'

  import type { Criterion } from '../catalog/score'
  import type { SpecAttribute } from '../catalog/spec-template'

  // Modelo de especificações e critérios de nota de uma subcategoria
  export async function loadSubcategoryRules(
    req: PayloadRequest,
    subcategoryId: number | string | null,
  ): Promise<{ template: SpecAttribute[]; criteria: Criterion[] }> {
    if (subcategoryId === null) return { template: [], criteria: [] }
    const subcategory = await req.payload.findByID({ collection: 'categories', id: subcategoryId, depth: 0, req })
    return {
      template: (subcategory.specTemplate ?? []) as unknown as SpecAttribute[],
      criteria: (subcategory.criteria ?? []) as unknown as Criterion[],
    }
  }
  ```

  `src/collections/categories/hooks.ts`:
  ```ts
  import { APIError, ValidationError } from 'payload'
  import type { CollectionBeforeChangeHook, CollectionBeforeDeleteHook } from 'payload'

  import { validateCriteria, type Criterion } from '../../catalog/score'
  import { validateSpecTemplate, type SpecAttribute } from '../../catalog/spec-template'
  import { pick, relId } from '../../lib/relations'

  export const validateCategory: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
    const errors: { message: string; path: string }[] = []
    const parentId = relId(pick(data, originalDoc, 'parent'))

    if (parentId === null) {
      // Categoria de 1º nível: modelo, critérios e âncora só existem em subcategorias
      data.specTemplate = []
      data.criteria = []
      data.isAnchor = false
      return data
    }

    if (originalDoc && String(parentId) === String(originalDoc.id)) {
      errors.push({ path: 'parent', message: 'Uma categoria não pode ser mãe de si mesma.' })
    } else {
      const parent = await req.payload.findByID({ collection: 'categories', id: parentId, depth: 0, req })
      if (relId(parent.parent) !== null) {
        errors.push({ path: 'parent', message: 'A categoria-mãe precisa ser de 1º nível (só existem 2 níveis).' })
      }
    }

    if (originalDoc) {
      const children = await req.payload.count({ collection: 'categories', where: { parent: { equals: originalDoc.id } }, req })
      if (children.totalDocs > 0) {
        errors.push({ path: 'parent', message: 'Esta categoria tem subcategorias e não pode virar subcategoria.' })
      }
    }

    const template = (pick<SpecAttribute[]>(data, originalDoc, 'specTemplate') ?? []) as SpecAttribute[]
    const criteria = (pick<Criterion[]>(data, originalDoc, 'criteria') ?? []) as Criterion[]
    errors.push(...validateSpecTemplate(template).map((message) => ({ path: 'specTemplate', message })))
    errors.push(...validateCriteria(criteria).map((message) => ({ path: 'criteria', message })))

    if (errors.length > 0) throw new ValidationError({ collection: 'categories', errors })
    return data
  }

  export const guardCategoryDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
    const children = await req.payload.count({ collection: 'categories', where: { parent: { equals: id } }, req })
    if (children.totalDocs > 0) {
      throw new APIError('Não é possível apagar: esta categoria tem subcategorias.', 409, undefined, true)
    }
  }
  ```

- [ ] **Step 4: Coleção `src/collections/Categories.ts`**

  ```ts
  import type { CollectionConfig, Condition } from 'payload'

  import { adminOrEditor, anyone } from '../access'
  import { slugField } from '../fields/slug'
  import { guardCategoryDelete, validateCategory } from './categories/hooks'

  const isSubcategory: Condition = (_data, siblingData) => Boolean(siblingData?.parent)

  export const Categories: CollectionConfig = {
    slug: 'categories',
    labels: { singular: 'Categoria', plural: 'Categorias' },
    admin: {
      useAsTitle: 'name',
      defaultColumns: ['name', 'parent', 'isAnchor', 'active'],
      group: 'Catálogo',
      description: 'Categorias (1º nível) e subcategorias (2º nível). Especificações e critérios de nota ficam nas subcategorias.',
    },
    access: { read: anyone, create: adminOrEditor, update: adminOrEditor, delete: adminOrEditor },
    hooks: { beforeChange: [validateCategory], beforeDelete: [guardCategoryDelete] },
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      slugField('name'),
      {
        name: 'parent',
        label: 'Categoria-mãe',
        type: 'relationship',
        relationTo: 'categories',
        filterOptions: { parent: { exists: false } },
        admin: { position: 'sidebar', description: 'Vazio = categoria de 1º nível. Preenchido = subcategoria.' },
      },
      { name: 'order', label: 'Ordem', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
      { name: 'active', label: 'Ativa', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
      {
        name: 'isAnchor',
        label: 'Âncora (destaque na home)',
        type: 'checkbox',
        defaultValue: false,
        admin: { position: 'sidebar', condition: isSubcategory },
      },
      { name: 'description', label: 'Descrição (introdução da página)', type: 'textarea' },
      { name: 'icon', label: 'Ícone', type: 'text', admin: { description: 'Um emoji (ex.: 📺) ou nome de ícone.' } },
      {
        name: 'specTemplate',
        label: 'Modelo de especificações',
        type: 'array',
        labels: { singular: 'Atributo', plural: 'Atributos' },
        admin: {
          condition: isSubcategory,
          description: 'Campos que todo produto desta subcategoria terá. A chave não deve mudar depois de criada.',
        },
        fields: [
          {
            type: 'row',
            fields: [
              { name: 'key', label: 'Chave', type: 'text', required: true, admin: { width: '33%', description: 'ex.: taxa_atualizacao' } },
              { name: 'label', label: 'Rótulo', type: 'text', required: true, admin: { width: '33%' } },
              {
                name: 'type',
                label: 'Tipo',
                type: 'select',
                required: true,
                defaultValue: 'text',
                admin: { width: '33%' },
                options: [
                  { label: 'Número', value: 'number' },
                  { label: 'Texto', value: 'text' },
                  { label: 'Sim/Não', value: 'boolean' },
                  { label: 'Opção (lista)', value: 'option' },
                ],
              },
            ],
          },
          {
            type: 'row',
            fields: [
              { name: 'unit', label: 'Unidade', type: 'text', admin: { width: '25%' } },
              { name: 'group', label: 'Grupo', type: 'text', admin: { width: '25%', description: 'ex.: Imagem' } },
              {
                name: 'direction',
                label: 'Direção',
                type: 'select',
                defaultValue: 'neutral',
                admin: { width: '50%' },
                options: [
                  { label: 'Maior é melhor', value: 'higher' },
                  { label: 'Menor é melhor', value: 'lower' },
                  { label: 'Neutro', value: 'neutral' },
                ],
              },
            ],
          },
          {
            name: 'options',
            label: 'Opções',
            type: 'text',
            hasMany: true,
            admin: { condition: (_d, sibling) => sibling?.type === 'option' },
          },
          {
            type: 'row',
            fields: [
              { name: 'highlight', label: 'Destaque', type: 'checkbox', defaultValue: false },
              { name: 'comparable', label: 'Comparável', type: 'checkbox', defaultValue: true },
              { name: 'required', label: 'Obrigatório', type: 'checkbox', defaultValue: false },
              { name: 'perVariant', label: 'Varia por variante', type: 'checkbox', defaultValue: false },
            ],
          },
        ],
      },
      {
        name: 'criteria',
        label: 'Critérios de nota',
        type: 'array',
        labels: { singular: 'Critério', plural: 'Critérios' },
        admin: { condition: isSubcategory, description: 'A soma dos pesos precisa ser exatamente 100.' },
        fields: [
          {
            type: 'row',
            fields: [
              { name: 'key', label: 'Chave', type: 'text', required: true, admin: { width: '30%', description: 'ex.: custo_beneficio' } },
              { name: 'name', label: 'Nome', type: 'text', required: true, admin: { width: '45%' } },
              { name: 'weight', label: 'Peso (%)', type: 'number', required: true, min: 0, max: 100, admin: { width: '25%' } },
            ],
          },
          { name: 'description', label: 'Descrição', type: 'textarea' },
        ],
      },
    ],
  }
  ```

  Em `src/payload.config.ts`, importe `import { Categories } from './collections/Categories'` e troque `collections: [Users, Media],` por:
  ```ts
    collections: [Users, Media, Categories],
  ```

- [ ] **Step 5: Migração**

  ```bash
  pnpm generate:types
  pnpm payload migrate:create categories
  pnpm payload migrate
  ```
  Expected: migração criada e aplicada no dev.

- [ ] **Step 6: Rodar os testes**

  Run: `pnpm test:unit && pnpm test:int`
  Expected: PASS (os 6 de `categories.int.spec.ts`).

- [ ] **Step 7: Commit**

  ```bash
  git add -A
  git commit -m "feat: categorias e subcategorias com modelo de especificações e critérios" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 6: Marcas e lojas

**Files:**
- Create: `src/collections/Brands.ts`, `src/collections/Stores.ts`, `tests/int/brands-stores.int.spec.ts`
- Modify: `src/payload.config.ts`, `tests/int/helpers/fixtures.ts`, `src/migrations/*` (nova migração `brands_stores`)

**Interfaces:**
- Consumes: `slugField`, `httpsUrl`, `adminOnly`, `adminOrEditor`, `anyone`, `Tracker`, `uid`
- Produces:
  - **Coleção `brands`:** `name`, `slug`, `logo` (mídia), `description`, `officialSite` (https, opcional)
  - **Coleção `stores`:** `name`, `slug`, `logo`, `affiliateProgram`, `active`, `notes`
  - **Em `fixtures.ts`:**
    - `createBrand(payload, tracker)`
    - `createStore(payload, tracker, data?: { active?: boolean })`

- [ ] **Step 1: Fábricas e testes**

  Acrescente ao final de `tests/int/helpers/fixtures.ts`:
  ```ts
  export async function createBrand(payload: Payload, tracker: Tracker) {
    const id = uid()
    return tracker.add('brands', await payload.create({ collection: 'brands', data: { name: `Marca ${id}`, slug: `marca-${id}` } }))
  }

  export async function createStore(payload: Payload, tracker: Tracker, data: { active?: boolean } = {}) {
    const id = uid()
    return tracker.add(
      'stores',
      await payload.create({ collection: 'stores', data: { name: `Loja ${id}`, slug: `loja-${id}`, active: data.active ?? true } }),
    )
  }
  ```

  `tests/int/brands-stores.int.spec.ts`:
  ```ts
  import { ValidationError } from 'payload'
  import { afterAll, describe, expect, it } from 'vitest'

  import { createBrand, createStore, Tracker, uid } from './helpers/fixtures'
  import { getTestPayload } from './helpers/getTestPayload'
  import { getTestUsers } from './helpers/users'

  const payloadPromise = getTestPayload()
  let tracker: Tracker

  afterAll(async () => tracker?.cleanup())

  async function setup() {
    const payload = await payloadPromise
    tracker ??= new Tracker(payload)
    return payload
  }

  describe('Marcas e lojas', () => {
    it('cria marca e loja', async () => {
      const payload = await setup()
      const brand = await createBrand(payload, tracker)
      const store = await createStore(payload, tracker)
      expect(brand.slug).toMatch(/^marca-/)
      expect(store.active).toBe(true)
    })

    it('recusa site oficial sem https', async () => {
      const payload = await setup()
      const error = await payload
        .create({ collection: 'brands', data: { name: `M ${uid()}`, officialSite: 'www.lg.com' } })
        .catch((e: unknown) => e)
      expect(error).toBeInstanceOf(ValidationError)
    })

    it('editor cria marca mas não cria loja', async () => {
      const payload = await setup()
      const { editor } = await getTestUsers(payload)
      const brand = await payload.create({
        collection: 'brands',
        data: { name: `M ${uid()}` },
        user: editor,
        overrideAccess: false,
      })
      tracker.add('brands', brand)
      await expect(
        payload.create({ collection: 'stores', data: { name: `L ${uid()}` }, user: editor, overrideAccess: false }),
      ).rejects.toThrow()
    })
  })
  ```

- [ ] **Step 2: Rodar e ver falhar**

  Run: `pnpm test:int`
  Expected: FAIL. As coleções `brands` e `stores` não existem.

- [ ] **Step 3: Coleções**

  `src/collections/Brands.ts`:
  ```ts
  import type { CollectionConfig } from 'payload'

  import { adminOrEditor, anyone } from '../access'
  import { slugField } from '../fields/slug'
  import { httpsUrl } from '../lib/url'

  export const Brands: CollectionConfig = {
    slug: 'brands',
    labels: { singular: 'Marca', plural: 'Marcas' },
    admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug'], group: 'Catálogo' },
    access: { read: anyone, create: adminOrEditor, update: adminOrEditor, delete: adminOrEditor },
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      slugField('name'),
      { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'media' },
      { name: 'description', label: 'Descrição', type: 'textarea' },
      { name: 'officialSite', label: 'Site oficial', type: 'text', validate: httpsUrl({ optional: true }) },
    ],
  }
  ```

  `src/collections/Stores.ts`:
  ```ts
  import type { CollectionConfig } from 'payload'

  import { adminOnly, anyone } from '../access'
  import { slugField } from '../fields/slug'

  export const Stores: CollectionConfig = {
    slug: 'stores',
    labels: { singular: 'Loja', plural: 'Lojas' },
    admin: { useAsTitle: 'name', defaultColumns: ['name', 'active', 'affiliateProgram'], group: 'Afiliados' },
    access: { read: anyone, create: adminOnly, update: adminOnly, delete: adminOnly },
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      slugField('name'),
      { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'media' },
      { name: 'affiliateProgram', label: 'Programa de afiliados', type: 'text' },
      {
        name: 'active',
        label: 'Ativa',
        type: 'checkbox',
        defaultValue: true,
        admin: { position: 'sidebar', description: 'Loja inativa: os links /ir/ dela levam para a página do produto.' },
      },
      {
        name: 'notes',
        label: 'Observações',
        type: 'textarea',
        admin: { description: 'Regras do programa (ex.: "não exibir preço", "não usar imagens").' },
      },
    ],
  }
  ```

  Em `src/payload.config.ts`, importe as duas e troque `collections: [Users, Media, Categories],` por:
  ```ts
    collections: [Users, Media, Categories, Brands, Stores],
  ```

- [ ] **Step 4: Migração**

  ```bash
  pnpm generate:types
  pnpm payload migrate:create brands_stores
  pnpm payload migrate
  ```

- [ ] **Step 5: Rodar os testes**

  Run: `pnpm test:int`
  Expected: PASS.

- [ ] **Step 6: Commit**

  ```bash
  git add -A
  git commit -m "feat: marcas e lojas" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 7: Regras de publicação do produto (módulo puro)

**Files:**
- Create: `src/catalog/product-status.ts`, `tests/unit/product-status.test.ts`

**Interfaces:**
- Consumes: nada
- Produces:
  - `type ProductStatus = 'rascunho' | 'ficha' | 'analise'`
  - `type PublicationInput`
  - `checkProductPublication(input: PublicationInput): string[]`

- [ ] **Step 1: Testes**

  `tests/unit/product-status.test.ts`:
  ```ts
  import { describe, expect, it } from 'vitest'

  import { checkProductPublication, type PublicationInput } from '@/catalog/product-status'

  const VERDICT = 'Uma TV OLED excelente para filmes e games, com contraste perfeito e preço competitivo no Brasil.'

  const ficha: PublicationInput = {
    status: 'ficha',
    finalScore: 8.6,
    imageCount: 1,
    variantCount: 1,
    missingSpecs: [],
    verdict: null,
    prosCount: 0,
    consCount: 0,
    metaDescription: null,
    sourcesCount: 0,
    reviewedAt: null,
  }

  const analise: PublicationInput = {
    ...ficha,
    status: 'analise',
    verdict: VERDICT,
    prosCount: 3,
    consCount: 2,
    sourcesCount: 1,
    reviewedAt: '2026-10-03T00:00:00.000Z',
  }

  describe('checkProductPublication', () => {
    it('rascunho não tem requisitos', () => {
      expect(checkProductPublication({ ...ficha, status: 'rascunho', finalScore: null, imageCount: 0, variantCount: 0 })).toEqual([])
    })

    it('ficha completa passa', () => {
      expect(checkProductPublication(ficha)).toEqual([])
    })

    it('ficha exige nota completa, imagem, variante e especificações obrigatórias', () => {
      expect(
        checkProductPublication({ ...ficha, finalScore: null, imageCount: 0, variantCount: 0, missingSpecs: ['Painel', 'Tamanho (55")'] }),
      ).toEqual([
        'Preencha a nota de todos os critérios.',
        'Adicione pelo menos 1 imagem.',
        'Cadastre pelo menos 1 variante.',
        'Especificações obrigatórias sem valor: Painel, Tamanho (55").',
      ])
    })

    it('análise completa passa (o veredito serve de meta descrição)', () => {
      expect(checkProductPublication(analise)).toEqual([])
    })

    it('análise exige veredito, 3–6 prós, 2–5 contras, fonte e data de revisão', () => {
      expect(
        checkProductPublication({ ...analise, verdict: ' ', prosCount: 7, consCount: 1, sourcesCount: 0, reviewedAt: null }),
      ).toEqual([
        'Escreva o veredito (uma frase).',
        'Liste de 3 a 6 pontos positivos.',
        'Liste de 2 a 5 pontos negativos.',
        'A meta descrição (ou o veredito, se ela estiver vazia) precisa ter de 70 a 160 caracteres.',
        'Cite pelo menos 1 fonte.',
        'Informe a data de revisão.',
      ])
    })

    it('meta descrição preenchida tem prioridade sobre o veredito', () => {
      expect(checkProductPublication({ ...analise, metaDescription: 'curta' })).toEqual([
        'A meta descrição (ou o veredito, se ela estiver vazia) precisa ter de 70 a 160 caracteres.',
      ])
    })
  })
  ```

- [ ] **Step 2: Rodar e ver falhar**

  Run: `pnpm test:unit`
  Expected: FAIL. O módulo `@/catalog/product-status` não existe.

- [ ] **Step 3: Implementar `src/catalog/product-status.ts`**

  ```ts
  export type ProductStatus = 'rascunho' | 'ficha' | 'analise'

  export type PublicationInput = {
    status: ProductStatus
    finalScore: number | null
    imageCount: number
    variantCount: number
    missingSpecs: string[]
    verdict?: string | null
    prosCount: number
    consCount: number
    metaDescription?: string | null
    sourcesCount: number
    reviewedAt?: string | null
  }

  // O que falta para o produto sair de rascunho (ficha) ou virar análise publicada (spec §4.5 e §5.7)
  export function checkProductPublication(input: PublicationInput): string[] {
    if (input.status === 'rascunho') return []
    const errors: string[] = []

    if (input.finalScore === null) errors.push('Preencha a nota de todos os critérios.')
    if (input.imageCount < 1) errors.push('Adicione pelo menos 1 imagem.')
    if (input.variantCount < 1) errors.push('Cadastre pelo menos 1 variante.')
    if (input.missingSpecs.length > 0) {
      errors.push(`Especificações obrigatórias sem valor: ${input.missingSpecs.join(', ')}.`)
    }

    if (input.status === 'analise') {
      const verdict = input.verdict?.trim() ?? ''
      if (!verdict) errors.push('Escreva o veredito (uma frase).')
      if (input.prosCount < 3 || input.prosCount > 6) errors.push('Liste de 3 a 6 pontos positivos.')
      if (input.consCount < 2 || input.consCount > 5) errors.push('Liste de 2 a 5 pontos negativos.')
      const meta = input.metaDescription?.trim() || verdict
      if (meta.length < 70 || meta.length > 160) {
        errors.push('A meta descrição (ou o veredito, se ela estiver vazia) precisa ter de 70 a 160 caracteres.')
      }
      if (input.sourcesCount < 1) errors.push('Cite pelo menos 1 fonte.')
      if (!input.reviewedAt) errors.push('Informe a data de revisão.')
    }

    return errors
  }
  ```

- [ ] **Step 4: Rodar e ver passar**

  Run: `pnpm test:unit`
  Expected: PASS.

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat: regras de publicação do produto (ficha e análise)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 8: Produtos e variantes

**Files:**
- Create: `src/collections/Products.ts`, `src/collections/products/hooks.ts`, `src/collections/Variants.ts`, `src/collections/variants/hooks.ts`, `tests/int/products.int.spec.ts`
- Modify: `src/collections/categories/hooks.ts` (bloqueio por produtos), `src/payload.config.ts`, `tests/int/helpers/fixtures.ts`, `src/migrations/*` (nova migração `products_variants`)

**Interfaces:**
- Consumes:
  - `loadSubcategoryRules`
  - `syncSpecRows`, `specValueErrors`, `missingRequiredSpecs`
  - `syncScoreRows`, `computeFinalScore`
  - `checkProductPublication`
  - `relId`, `pick`, `roleOf`
  - `readPublishedProducts`, `updateProducts`, `loggedIn`, `adminOrEditor`, `anyone`
  - `slugField`, `httpsUrl`
  - as fábricas de `fixtures.ts`
- Produces:
  - **Coleção `products`:** `name`, `slug`, `brand`, `subcategory`, `images`, `variants` (join), `specs[{key,label,value}]`, `scores[{key,label,score,justification}]`, `finalScore`, `verdict`, `pros[{text}]`, `cons[{text}]`, `recommendedFor`, `avoidIf`, `fullReview`, `sources[{title,url}]`, `faq[{question,answer}]`, `publishedAt`, `reviewedAt`, `seo{metaTitle,metaDescription,ogImage}`, `status`, `hasActiveOffer`
  - **Coleção `variants`:** `product`, `label`, `modelCode`, `voltage`, `isReference`, `specs[{key,label,value}]`, `title` (somente leitura: "{produto} — {rótulo}")
  - **Contexto de hooks** (usado pelas Tarefas 9 e 10): `context.skipPublicationCheck` pula a checagem de publicação do produto; `context.cascade` marca exclusões em cascata.
  - **Em `fixtures.ts`:**
    - `createImage(payload, tracker)`
    - `createProduct(payload, tracker, { subcategoryId, brandId })`
    - `makePublishable(payload, product, imageId)`, que deixa um produto de `sampleSpecTemplate`/`sampleCriteria` pronto para `ficha`
    - `ANALYSIS_DATA` (campos mínimos de análise)

- [ ] **Step 1: Fábricas e testes**

  Acrescente ao topo de `tests/int/helpers/fixtures.ts`, junto aos imports:
  ```ts
  import sharp from 'sharp'
  ```
  E ao final do arquivo:
  ```ts
  export async function createImage(payload: Payload, tracker: Tracker) {
    const data = await sharp({ create: { width: 400, height: 300, channels: 3, background: '#2563EB' } }).png().toBuffer()
    return tracker.add(
      'media',
      await payload.create({
        collection: 'media',
        data: { alt: 'Imagem de teste', credit: 'Teste automatizado' },
        file: { data, mimetype: 'image/png', name: `teste-${uid()}.png`, size: data.length },
      }),
    )
  }

  export async function createProduct(
    payload: Payload,
    tracker: Tracker,
    refs: { subcategoryId: number | string; brandId: number | string },
  ) {
    const id = uid()
    return tracker.add(
      'products',
      await payload.create({
        collection: 'products',
        data: { name: `Produto ${id}`, slug: `produto-${id}`, brand: refs.brandId, subcategory: refs.subcategoryId },
      }),
    )
  }

  // Preenche o mínimo para status "ficha" com sampleSpecTemplate e sampleCriteria
  export async function makePublishable(payload: Payload, productId: number | string, imageId: number | string) {
    const { docs } = await payload.find({ collection: 'variants', where: { product: { equals: productId } }, limit: 10 })
    for (const variant of docs) {
      await payload.update({ collection: 'variants', id: variant.id, data: { specs: [{ key: 'tamanho', value: '55' }] } })
    }
    return payload.update({
      collection: 'products',
      id: productId,
      data: {
        images: [imageId],
        specs: [{ key: 'painel', value: 'OLED' }],
        scores: [
          { key: 'imagem', score: 9 },
          { key: 'custo_beneficio', score: 8 },
        ],
        status: 'ficha',
      },
    })
  }

  export const ANALYSIS_DATA = {
    verdict: 'Uma TV OLED excelente para filmes e games, com contraste perfeito e preço competitivo no Brasil.',
    pros: [{ text: 'Contraste perfeito' }, { text: '144 Hz para games' }, { text: 'Bom processamento' }],
    cons: [{ text: 'Brilho limitado em sala clara' }, { text: 'Sem DTS' }],
    sources: [{ title: 'Ficha técnica oficial', url: 'https://www.lg.com/br' }],
    reviewedAt: '2026-10-03T12:00:00.000Z',
  }
  ```

  `tests/int/products.int.spec.ts`:
  ```ts
  import { APIError, ValidationError } from 'payload'
  import { afterAll, describe, expect, it } from 'vitest'

  import {
    ANALYSIS_DATA,
    createBrand,
    createCategoryPair,
    createImage,
    createProduct,
    makePublishable,
    Tracker,
  } from './helpers/fixtures'
  import { getTestPayload } from './helpers/getTestPayload'
  import { getTestUsers } from './helpers/users'

  const payloadPromise = getTestPayload()
  let tracker: Tracker

  afterAll(async () => tracker?.cleanup())

  async function setup() {
    const payload = await payloadPromise
    tracker ??= new Tracker(payload)
    const { subcategory } = await createCategoryPair(payload, tracker)
    const brand = await createBrand(payload, tracker)
    const product = await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id })
    return { payload, subcategory, brand, product }
  }

  async function variantsOf(productId: number | string) {
    const payload = await payloadPromise
    return (await payload.find({ collection: 'variants', where: { product: { equals: productId } }, sort: 'createdAt', limit: 50 })).docs
  }

  function messages(error: unknown): string {
    return JSON.stringify((error as ValidationError).data ?? (error as Error).message)
  }

  describe('Produtos', () => {
    it('cria a variante "Padrão" de referência e sincroniza especificações e notas', async () => {
      const { product } = await setup()
      const variants = await variantsOf(product.id)
      expect(variants).toHaveLength(1)
      expect(variants[0]).toMatchObject({ label: 'Padrão', isReference: true, title: `${product.name} — Padrão` })
      expect(variants[0].specs?.map((r) => r.key)).toEqual(['tamanho'])
      expect(product.specs?.map((r) => [r.key, r.label])).toEqual([
        ['painel', 'Painel'],
        ['taxa_atualizacao', 'Taxa de atualização (Hz)'],
      ])
      expect(product.scores?.map((r) => r.label)).toEqual(['Imagem (60%)', 'Custo-benefício (40%)'])
      expect(product.finalScore).toBeNull()
    })

    it('calcula a nota final quando todos os critérios têm nota', async () => {
      const { payload, product } = await setup()
      const updated = await payload.update({
        collection: 'products',
        id: product.id,
        data: { scores: [{ key: 'imagem', score: 9 }, { key: 'custo_beneficio', score: 8 }] },
      })
      expect(updated.finalScore).toBe(8.6)
    })

    it('recusa valor fora das opções', async () => {
      const { payload, product } = await setup()
      const error = await payload
        .update({ collection: 'products', id: product.id, data: { specs: [{ key: 'painel', value: 'Plasma' }] } })
        .catch((e: unknown) => e)
      expect(error).toBeInstanceOf(ValidationError)
      expect(messages(error)).toContain('uma das opções')
    })

    it('não sai de rascunho sem os requisitos', async () => {
      const { payload, product } = await setup()
      const error = await payload
        .update({ collection: 'products', id: product.id, data: { status: 'ficha' } })
        .catch((e: unknown) => e)
      expect(error).toBeInstanceOf(ValidationError)
      expect(messages(error)).toContain('nota de todos os critérios')
      expect(messages(error)).toContain('Tamanho (Padrão)')
    })

    it('publica como ficha e depois como análise, preenchendo a data de publicação', async () => {
      const { payload, product } = await setup()
      const image = await createImage(payload, tracker)
      const asFicha = await makePublishable(payload, product.id, image.id)
      expect(asFicha.status).toBe('ficha')

      const missing = await payload
        .update({ collection: 'products', id: product.id, data: { status: 'analise' } })
        .catch((e: unknown) => e)
      expect(messages(missing)).toContain('veredito')

      const asAnalise = await payload.update({
        collection: 'products',
        id: product.id,
        data: { ...ANALYSIS_DATA, status: 'analise' },
      })
      expect(asAnalise.status).toBe('analise')
      expect(asAnalise.publishedAt).toBeTruthy()
    })

    it('marcar outra variante como referência desmarca a anterior; apagar a referência promove outra', async () => {
      const { payload, product } = await setup()
      const extra = await payload.create({ collection: 'variants', data: { product: product.id, label: '65"', isReference: true } })
      let variants = await variantsOf(product.id)
      expect(variants.filter((v) => v.isReference).map((v) => v.id)).toEqual([extra.id])

      await payload.delete({ collection: 'variants', id: extra.id })
      variants = await variantsOf(product.id)
      expect(variants).toHaveLength(1)
      expect(variants[0].isReference).toBe(true)
    })

    it('recusa rótulo de variante repetido no mesmo produto', async () => {
      const { payload, product } = await setup()
      const error = await payload
        .create({ collection: 'variants', data: { product: product.id, label: 'Padrão' } })
        .catch((e: unknown) => e)
      expect(error).toBeInstanceOf(ValidationError)
      expect(messages(error)).toContain('Já existe uma variante com este rótulo')
    })

    it('não apaga a única variante de produto publicado', async () => {
      const { payload, product } = await setup()
      const image = await createImage(payload, tracker)
      await makePublishable(payload, product.id, image.id)
      const [only] = await variantsOf(product.id)
      const error = await payload.delete({ collection: 'variants', id: only.id }).catch((e: unknown) => e)
      expect(error).toBeInstanceOf(APIError)
      expect((error as APIError).status).toBe(409)
    })

    it('redator: salva rascunho, não publica e não edita produto publicado', async () => {
      const { payload, product } = await setup()
      const { redator } = await getTestUsers(payload)
      const asDraft = await payload.update({
        collection: 'products',
        id: product.id,
        data: { verdict: 'Rascunho do redator' },
        user: redator,
        overrideAccess: false,
      })
      expect(asDraft.verdict).toBe('Rascunho do redator')

      const publish = await payload
        .update({ collection: 'products', id: product.id, data: { status: 'ficha' }, user: redator, overrideAccess: false })
        .catch((e: unknown) => e)
      expect(messages(publish)).toContain('Redatores só podem salvar como rascunho')

      const image = await createImage(payload, tracker)
      await makePublishable(payload, product.id, image.id)
      await expect(
        payload.update({ collection: 'products', id: product.id, data: { verdict: 'x' }, user: redator, overrideAccess: false }),
      ).rejects.toThrow()
    })

    it('anônimo não lê rascunho', async () => {
      const { payload, product } = await setup()
      const result = await payload.find({ collection: 'products', where: { id: { equals: product.id } }, overrideAccess: false })
      expect(result.totalDocs).toBe(0)
    })

    it('apagar o produto apaga as variantes; subcategoria com produto não pode ser apagada', async () => {
      const { payload, product, subcategory } = await setup()
      const blocked = await payload.delete({ collection: 'categories', id: subcategory.id }).catch((e: unknown) => e)
      expect(blocked).toBeInstanceOf(APIError)

      await payload.delete({ collection: 'products', id: product.id })
      expect(await variantsOf(product.id)).toHaveLength(0)
    })
  })
  ```

- [ ] **Step 2: Rodar e ver falhar**

  Run: `pnpm test:int`
  Expected: FAIL. As coleções `products` e `variants` não existem.

- [ ] **Step 3: Hooks do produto**

  `src/collections/products/hooks.ts`:
  ```ts
  import { ValidationError } from 'payload'
  import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionBeforeDeleteHook } from 'payload'

  import { roleOf } from '../../access'
  import { checkProductPublication, type ProductStatus } from '../../catalog/product-status'
  import { computeFinalScore, syncScoreRows, type ScoreRow } from '../../catalog/score'
  import { missingRequiredSpecs, specValueErrors, syncSpecRows, type SpecRow } from '../../catalog/spec-template'
  import { pick, relId } from '../../lib/relations'
  import { loadSubcategoryRules } from '../catalog-rules'

  const count = (value: unknown) => (Array.isArray(value) ? value.length : 0)

  export const prepareProduct: CollectionBeforeChangeHook = async ({ data, originalDoc, req, context }) => {
    const { template, criteria } = await loadSubcategoryRules(req, relId(pick(data, originalDoc, 'subcategory')))
    const specs = syncSpecRows(template, pick<SpecRow[]>(data, originalDoc, 'specs'), 'product')
    const scores = syncScoreRows(criteria, pick<ScoreRow[]>(data, originalDoc, 'scores'))
    data.specs = specs
    data.scores = scores
    data.finalScore = computeFinalScore(criteria, scores)

    const status = pick<ProductStatus>(data, originalDoc, 'status') ?? 'rascunho'
    if (status === 'analise' && !pick(data, originalDoc, 'publishedAt')) data.publishedAt = new Date().toISOString()
    if (context.skipPublicationCheck) return data

    const errors = specValueErrors(template, specs).map((message) => ({ path: 'specs', message }))
    if (roleOf(req.user) === 'redator' && status !== 'rascunho') {
      errors.push({ path: 'status', message: 'Redatores só podem salvar como rascunho.' })
    }

    if (status !== 'rascunho') {
      const variants = originalDoc
        ? (await req.payload.find({ collection: 'variants', where: { product: { equals: originalDoc.id } }, depth: 0, limit: 1000, req })).docs
        : []
      const missingSpecs = [
        ...missingRequiredSpecs(template, specs, 'product'),
        ...variants.flatMap((variant) =>
          missingRequiredSpecs(template, (variant.specs ?? []) as SpecRow[], 'variant').map((label) => `${label} (${variant.label})`),
        ),
      ]
      const seo = pick<{ metaDescription?: string | null }>(data, originalDoc, 'seo')
      errors.push(
        ...checkProductPublication({
          status,
          finalScore: data.finalScore as number | null,
          imageCount: count(pick(data, originalDoc, 'images')),
          variantCount: variants.length,
          missingSpecs,
          verdict: pick<string>(data, originalDoc, 'verdict'),
          prosCount: count(pick(data, originalDoc, 'pros')),
          consCount: count(pick(data, originalDoc, 'cons')),
          metaDescription: seo?.metaDescription,
          sourcesCount: count(pick(data, originalDoc, 'sources')),
          reviewedAt: pick<string>(data, originalDoc, 'reviewedAt'),
        }).map((message) => ({ path: 'status', message })),
      )
    }

    if (errors.length > 0) throw new ValidationError({ collection: 'products', errors })
    return data
  }

  // Cria a variante "Padrão"; mantém as variantes em dia quando o nome ou a subcategoria mudam
  export const afterProductChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
    if (operation === 'create') {
      await req.payload.create({ collection: 'variants', data: { product: doc.id, label: 'Padrão', isReference: true }, req })
      return doc
    }
    const renamed = previousDoc?.name !== doc.name
    const moved = relId(previousDoc?.subcategory) !== relId(doc.subcategory)
    if (renamed || moved) {
      const { docs } = await req.payload.find({ collection: 'variants', where: { product: { equals: doc.id } }, depth: 0, limit: 1000, req })
      for (const variant of docs) await req.payload.update({ collection: 'variants', id: variant.id, data: {}, req })
    }
    return doc
  }

  export const cascadeProductDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
    await req.payload.delete({ collection: 'variants', where: { product: { equals: id } }, req, context: { cascade: true } })
  }
  ```

- [ ] **Step 4: Hooks da variante**

  `src/collections/variants/hooks.ts`:
  ```ts
  import { APIError, ValidationError } from 'payload'
  import type {
    CollectionAfterChangeHook,
    CollectionAfterDeleteHook,
    CollectionBeforeChangeHook,
    CollectionBeforeDeleteHook,
  } from 'payload'

  import { specValueErrors, syncSpecRows, type SpecRow } from '../../catalog/spec-template'
  import { pick, relId } from '../../lib/relations'
  import { loadSubcategoryRules } from '../catalog-rules'

  export const prepareVariant: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
    const productId = relId(pick(data, originalDoc, 'product'))
    if (productId === null) {
      throw new ValidationError({ collection: 'variants', errors: [{ path: 'product', message: 'Escolha o produto.' }] })
    }
    const product = await req.payload.findByID({ collection: 'products', id: productId, depth: 0, req })
    const { template } = await loadSubcategoryRules(req, relId(product.subcategory))
    const specs = syncSpecRows(template, pick<SpecRow[]>(data, originalDoc, 'specs'), 'variant')
    const label = String(pick(data, originalDoc, 'label') ?? '').trim()
    data.specs = specs
    data.label = label
    data.title = `${product.name} — ${label}`

    const errors = specValueErrors(template, specs).map((message) => ({ path: 'specs', message }))
    const duplicates = await req.payload.count({
      collection: 'variants',
      where: {
        and: [
          { product: { equals: productId } },
          { label: { equals: label } },
          ...(originalDoc ? [{ id: { not_equals: originalDoc.id } }] : []),
        ],
      },
      req,
    })
    if (duplicates.totalDocs > 0) errors.push({ path: 'label', message: 'Já existe uma variante com este rótulo neste produto.' })
    if (errors.length > 0) throw new ValidationError({ collection: 'variants', errors })
    return data
  }

  // Exatamente uma variante de referência por produto
  export const syncReference: CollectionAfterChangeHook = async ({ doc, req, context }) => {
    if (context.skipReferenceSync) return doc
    const siblings = (
      await req.payload.find({
        collection: 'variants',
        where: { and: [{ product: { equals: relId(doc.product) } }, { id: { not_equals: doc.id } }] },
        depth: 0,
        limit: 1000,
        req,
      })
    ).docs
    if (doc.isReference) {
      for (const sibling of siblings.filter((s) => s.isReference)) {
        await req.payload.update({ collection: 'variants', id: sibling.id, data: { isReference: false }, req, context: { skipReferenceSync: true } })
      }
      return doc
    }
    if (!siblings.some((s) => s.isReference)) {
      await req.payload.update({ collection: 'variants', id: doc.id, data: { isReference: true }, req, context: { skipReferenceSync: true } })
      return { ...doc, isReference: true }
    }
    return doc
  }

  export const guardVariantDelete: CollectionBeforeDeleteHook = async ({ id, req, context }) => {
    if (context.cascade) return
    const variant = await req.payload.findByID({ collection: 'variants', id, depth: 0, req })
    const productId = relId(variant.product)
    if (productId === null) return
    const product = await req.payload.findByID({ collection: 'products', id: productId, depth: 0, req })
    const { totalDocs } = await req.payload.count({ collection: 'variants', where: { product: { equals: productId } }, req })
    if (totalDocs <= 1 && product.status !== 'rascunho') {
      throw new APIError(
        'Não é possível apagar a única variante de um produto publicado. Volte o produto para rascunho antes.',
        409,
        undefined,
        true,
      )
    }
  }

  export const promoteReference: CollectionAfterDeleteHook = async ({ doc, req, context }) => {
    if (context.cascade || !doc.isReference) return
    const { docs } = await req.payload.find({
      collection: 'variants',
      where: { product: { equals: relId(doc.product) } },
      sort: 'createdAt',
      depth: 0,
      limit: 1,
      req,
    })
    if (docs[0]) {
      await req.payload.update({ collection: 'variants', id: docs[0].id, data: { isReference: true }, req, context: { skipReferenceSync: true } })
    }
  }
  ```

- [ ] **Step 5: Coleções**

  `src/collections/Variants.ts`:
  ```ts
  import type { CollectionConfig } from 'payload'

  import { adminOrEditor, anyone, loggedIn } from '../access'
  import { guardVariantDelete, prepareVariant, promoteReference, syncReference } from './variants/hooks'

  export const Variants: CollectionConfig = {
    slug: 'variants',
    labels: { singular: 'Variante', plural: 'Variantes' },
    admin: { useAsTitle: 'title', defaultColumns: ['title', 'modelCode', 'isReference'], group: 'Catálogo' },
    access: { read: anyone, create: loggedIn, update: loggedIn, delete: adminOrEditor },
    hooks: {
      beforeChange: [prepareVariant],
      afterChange: [syncReference],
      beforeDelete: [guardVariantDelete],
      afterDelete: [promoteReference],
    },
    fields: [
      { name: 'product', label: 'Produto', type: 'relationship', relationTo: 'products', required: true, index: true },
      { name: 'label', label: 'Rótulo', type: 'text', required: true, admin: { description: 'ex.: 55", 220 V, 8 GB/256 GB' } },
      { name: 'modelCode', label: 'Código do modelo', type: 'text', admin: { description: 'ex.: OLED55C4PSA' } },
      {
        name: 'voltage',
        label: 'Voltagem',
        type: 'select',
        options: [
          { label: '127 V', value: '127v' },
          { label: '220 V', value: '220v' },
          { label: 'Bivolt', value: 'bivolt' },
        ],
      },
      {
        name: 'isReference',
        label: 'Variante de referência',
        type: 'checkbox',
        defaultValue: false,
        admin: { description: 'A usada em cards, listas e comparativos. Só uma por produto.' },
      },
      {
        name: 'specs',
        label: 'Especificações desta variante',
        type: 'array',
        admin: { description: 'As linhas vêm do modelo da subcategoria (atributos que variam por variante).' },
        fields: [
          { name: 'key', type: 'text', required: true, admin: { hidden: true } },
          {
            type: 'row',
            fields: [
              { name: 'label', label: 'Atributo', type: 'text', admin: { readOnly: true, width: '50%' } },
              { name: 'value', label: 'Valor', type: 'text', admin: { width: '50%' } },
            ],
          },
        ],
      },
      { name: 'title', label: 'Título', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    ],
  }
  ```

  `src/collections/Products.ts`:
  ```ts
  import type { CollectionConfig } from 'payload'

  import { adminOrEditor, loggedIn, readPublishedProducts, updateProducts } from '../access'
  import { slugField } from '../fields/slug'
  import { httpsUrl } from '../lib/url'
  import { afterProductChange, cascadeProductDelete, prepareProduct } from './products/hooks'

  export const Products: CollectionConfig = {
    slug: 'products',
    labels: { singular: 'Produto', plural: 'Produtos' },
    admin: {
      useAsTitle: 'name',
      defaultColumns: ['name', 'brand', 'subcategory', 'status', 'finalScore', 'hasActiveOffer'],
      group: 'Catálogo',
    },
    access: { read: readPublishedProducts, create: loggedIn, update: updateProducts, delete: adminOrEditor },
    hooks: { beforeChange: [prepareProduct], afterChange: [afterProductChange], beforeDelete: [cascadeProductDelete] },
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true, admin: { description: 'ex.: LG C4' } },
      slugField('name'),
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        defaultValue: 'rascunho',
        admin: { position: 'sidebar' },
        options: [
          { label: 'Rascunho', value: 'rascunho' },
          { label: 'Ficha (fora do Google)', value: 'ficha' },
          { label: 'Análise (publicada)', value: 'analise' },
        ],
      },
      { name: 'finalScore', label: 'Nota DeciCompra', type: 'number', admin: { readOnly: true, position: 'sidebar', description: 'Calculada pelas notas de cada critério.' } },
      { name: 'hasActiveOffer', label: 'Tem oferta ativa', type: 'checkbox', defaultValue: false, admin: { readOnly: true, position: 'sidebar' } },
      { name: 'publishedAt', label: 'Publicado em', type: 'date', admin: { position: 'sidebar' } },
      { name: 'reviewedAt', label: 'Revisado em', type: 'date', admin: { position: 'sidebar' } },
      {
        type: 'tabs',
        tabs: [
          {
            label: 'Dados',
            fields: [
              { name: 'brand', label: 'Marca', type: 'relationship', relationTo: 'brands', required: true },
              {
                name: 'subcategory',
                label: 'Subcategoria',
                type: 'relationship',
                relationTo: 'categories',
                required: true,
                filterOptions: { parent: { exists: true } },
              },
              { name: 'images', label: 'Imagens', type: 'upload', relationTo: 'media', hasMany: true, admin: { description: 'A primeira é a principal.' } },
              { name: 'variants', label: 'Variantes', type: 'join', collection: 'variants', on: 'product' },
              {
                name: 'specs',
                label: 'Especificações',
                type: 'array',
                admin: { description: 'As linhas vêm do modelo da subcategoria. Salve para atualizar a lista.' },
                fields: [
                  { name: 'key', type: 'text', required: true, admin: { hidden: true } },
                  {
                    type: 'row',
                    fields: [
                      { name: 'label', label: 'Atributo', type: 'text', admin: { readOnly: true, width: '50%' } },
                      { name: 'value', label: 'Valor', type: 'text', admin: { width: '50%' } },
                    ],
                  },
                ],
              },
            ],
          },
          {
            label: 'Notas',
            fields: [
              {
                name: 'scores',
                label: 'Notas por critério',
                type: 'array',
                admin: { description: 'De 0 a 10, com uma casa decimal. As linhas vêm dos critérios da subcategoria.' },
                fields: [
                  { name: 'key', type: 'text', required: true, admin: { hidden: true } },
                  {
                    type: 'row',
                    fields: [
                      { name: 'label', label: 'Critério', type: 'text', admin: { readOnly: true, width: '60%' } },
                      { name: 'score', label: 'Nota', type: 'number', min: 0, max: 10, admin: { step: 0.1, width: '40%' } },
                    ],
                  },
                  { name: 'justification', label: 'Justificativa', type: 'textarea' },
                ],
              },
            ],
          },
          {
            label: 'Análise',
            fields: [
              { name: 'verdict', label: 'Veredito (uma frase)', type: 'text' },
              { name: 'pros', label: 'Pontos positivos', type: 'array', fields: [{ name: 'text', label: 'Texto', type: 'text', required: true }] },
              { name: 'cons', label: 'Pontos negativos', type: 'array', fields: [{ name: 'text', label: 'Texto', type: 'text', required: true }] },
              { name: 'recommendedFor', label: 'Indicado para', type: 'textarea' },
              { name: 'avoidIf', label: 'Evite se', type: 'textarea' },
              { name: 'fullReview', label: 'Análise completa', type: 'richText' },
              {
                name: 'sources',
                label: 'Fontes',
                type: 'array',
                fields: [
                  { name: 'title', label: 'Título', type: 'text', required: true },
                  { name: 'url', label: 'URL', type: 'text', required: true, validate: httpsUrl() },
                ],
              },
              {
                name: 'faq',
                label: 'Perguntas frequentes',
                type: 'array',
                fields: [
                  { name: 'question', label: 'Pergunta', type: 'text', required: true },
                  { name: 'answer', label: 'Resposta', type: 'textarea', required: true },
                ],
              },
            ],
          },
          {
            label: 'SEO',
            fields: [
              {
                name: 'seo',
                type: 'group',
                fields: [
                  { name: 'metaTitle', label: 'Meta título', type: 'text' },
                  {
                    name: 'metaDescription',
                    label: 'Meta descrição',
                    type: 'textarea',
                    admin: { description: '70 a 160 caracteres. Se ficar vazia, o veredito é usado.' },
                  },
                  { name: 'ogImage', label: 'Imagem de compartilhamento', type: 'upload', relationTo: 'media' },
                ],
              },
            ],
          },
        ],
      },
    ],
  }
  ```

  Em `src/payload.config.ts`, importe `Products` e `Variants` e troque a lista por:
  ```ts
    collections: [Users, Media, Categories, Brands, Stores, Products, Variants],
  ```

- [ ] **Step 6: Bloquear apagar subcategoria com produtos**

  Em `src/collections/categories/hooks.ts`, substitua `guardCategoryDelete` por:
  ```ts
  export const guardCategoryDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
    const [children, products] = await Promise.all([
      req.payload.count({ collection: 'categories', where: { parent: { equals: id } }, req }),
      req.payload.count({ collection: 'products', where: { subcategory: { equals: id } }, req }),
    ])
    if (children.totalDocs > 0 || products.totalDocs > 0) {
      throw new APIError('Não é possível apagar: existem subcategorias ou produtos ligados a esta categoria.', 409, undefined, true)
    }
  }
  ```

- [ ] **Step 7: Migração**

  ```bash
  pnpm generate:types
  pnpm payload migrate:create products_variants
  pnpm payload migrate
  ```

- [ ] **Step 8: Rodar os testes**

  Run: `pnpm test:unit && pnpm test:int`
  Expected: PASS (os 10 de `products.int.spec.ts` e todos os anteriores).

- [ ] **Step 9: Conferir no painel**

  Run: `pnpm dev` → http://localhost:3000/admin.

  Crie uma categoria, uma subcategoria (com 1 atributo e 2 critérios somando 100), uma marca e um produto.

  Esperado:
  - o produto mostra a variante "Padrão" na aba Dados
  - as linhas de especificação e de notas aparecem preenchidas com os rótulos
  - ao preencher as notas e salvar, a "Nota DeciCompra" aparece na lateral

  Apague os dados de teste e pare o servidor.

- [ ] **Step 10: Commit**

  ```bash
  git add -A
  git commit -m "feat: produtos e variantes com especificações, nota calculada e regras de publicação" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 9: Ofertas e faixa de preço

**Files:**
- Create: `src/catalog/price-range.ts`, `tests/unit/price-range.test.ts`, `src/collections/Offers.ts`, `src/collections/offers/hooks.ts`, `tests/int/offers.int.spec.ts`
- Modify: `src/collections/products/hooks.ts` (apagar ofertas em cascata), `src/collections/Products.ts` (join de ofertas), `src/collections/Variants.ts` + `variants/hooks.ts` (ofertas da variante), `src/payload.config.ts`, `tests/int/helpers/fixtures.ts`, `src/migrations/*` (nova migração `offers`)

**Interfaces:**
- Consumes:
  - `relId`, `pick`, `httpsUrl`
  - `adminOrEditor`, `anyone`
  - `context.skipPublicationCheck` e `context.cascade` (Tarefa 8)
  - as fábricas de `fixtures.ts`
- Produces:
  - **Em `src/catalog/price-range.ts`:**
    - `STALE_PRICE_DAYS = 60`
    - `type OfferForPrice = { status: 'active' | 'unavailable'; priceMin: number; priceMax: number; verifiedAt: string | Date }`
    - `type PriceRange = { kind: 'range'; min: number; max: number; verifiedAt: Date } | { kind: 'stale' } | { kind: 'unavailable' }`
    - `computePriceRange(offers, now): PriceRange`
    - `formatPriceRange(range): string | null`
    - `offerPriceErrors(min, max): string[]`
  - **Coleção `offers`:** `product`, `variant`, `store`, `url`, `affiliateUrl`, `priceMin`, `priceMax`, `verifiedAt`, `status` (`active` | `unavailable`), `notes`, `title` (somente leitura: "{variante} · {loja}")
  - **`refreshHasActiveOffer(req, productId)`:** recalcula `products.hasActiveOffer`
  - **Em `fixtures.ts`:** `createOffer(payload, tracker, { productId, variantId, storeId, data? })`

- [ ] **Step 1: Testes da faixa de preço**

  `tests/unit/price-range.test.ts`:
  ```ts
  import { describe, expect, it } from 'vitest'

  import { computePriceRange, formatPriceRange, offerPriceErrors, type OfferForPrice } from '@/catalog/price-range'

  const now = new Date('2026-10-03T12:00:00.000Z')
  const offer = (o: Partial<OfferForPrice>): OfferForPrice => ({
    status: 'active',
    priceMin: 4300,
    priceMax: 4600,
    verifiedAt: '2026-10-01T12:00:00.000Z',
    ...o,
  })

  describe('computePriceRange', () => {
    it('menor mínimo e maior máximo entre as ofertas ativas, com a verificação mais antiga', () => {
      expect(
        computePriceRange(
          [
            offer({}),
            offer({ priceMin: 4500, priceMax: 5100, verifiedAt: '2026-09-20T12:00:00.000Z' }),
            offer({ status: 'unavailable', priceMin: 100, priceMax: 9999 }),
          ],
          now,
        ),
      ).toEqual({ kind: 'range', min: 4300, max: 5100, verifiedAt: new Date('2026-09-20T12:00:00.000Z') })
    })

    it('sem oferta ativa = indisponível', () => {
      expect(computePriceRange([offer({ status: 'unavailable' })], now)).toEqual({ kind: 'unavailable' })
      expect(computePriceRange([], now)).toEqual({ kind: 'unavailable' })
    })

    it('oculta a faixa quando a verificação mais antiga passou de 60 dias', () => {
      expect(computePriceRange([offer({ verifiedAt: '2026-08-04T11:00:00.000Z' })], now)).toEqual({ kind: 'stale' })
      expect(computePriceRange([offer({ verifiedAt: '2026-08-04T13:00:00.000Z' })], now).kind).toBe('range')
    })
  })

  describe('formatPriceRange', () => {
    const plain = (s: string | null) => s?.replace(/ /g, ' ')

    it('formata como na spec', () => {
      expect(plain(formatPriceRange({ kind: 'range', min: 4300, max: 5100, verifiedAt: new Date('2026-10-03T12:00:00.000Z') }))).toBe(
        'R$ 4.300 – R$ 5.100 · verificado em 03/10/2026',
      )
    })

    it('mínimo igual ao máximo mostra um valor só', () => {
      expect(plain(formatPriceRange({ kind: 'range', min: 999, max: 999, verifiedAt: new Date('2026-10-03T12:00:00.000Z') }))).toBe(
        'R$ 999 · verificado em 03/10/2026',
      )
    })

    it('indisponível e desatualizada', () => {
      expect(formatPriceRange({ kind: 'unavailable' })).toBe('Indisponível no momento')
      expect(formatPriceRange({ kind: 'stale' })).toBeNull()
    })
  })

  describe('offerPriceErrors', () => {
    it('valida mínimo positivo e máximo ≥ mínimo', () => {
      expect(offerPriceErrors(100, 200)).toEqual([])
      expect(offerPriceErrors(0, 200)).toEqual(['O preço mínimo precisa ser maior que zero.'])
      expect(offerPriceErrors(300, 200)).toEqual(['O preço máximo não pode ser menor que o mínimo.'])
    })
  })
  ```

- [ ] **Step 2: Rodar e ver falhar**

  Run: `pnpm test:unit`
  Expected: FAIL. O módulo `@/catalog/price-range` não existe.

- [ ] **Step 3: Implementar `src/catalog/price-range.ts`**

  ```ts
  export const STALE_PRICE_DAYS = 60

  const DAY_MS = 86_400_000

  export type OfferForPrice = {
    status: 'active' | 'unavailable'
    priceMin: number
    priceMax: number
    verifiedAt: string | Date
  }

  export type PriceRange =
    | { kind: 'range'; min: number; max: number; verifiedAt: Date }
    | { kind: 'stale' }
    | { kind: 'unavailable' }

  // Faixa exibida para uma variante (spec §5.2)
  export function computePriceRange(offers: OfferForPrice[], now: Date): PriceRange {
    const active = offers.filter((offer) => offer.status === 'active')
    if (active.length === 0) return { kind: 'unavailable' }
    const oldest = new Date(Math.min(...active.map((offer) => new Date(offer.verifiedAt).getTime())))
    if (now.getTime() - oldest.getTime() > STALE_PRICE_DAYS * DAY_MS) return { kind: 'stale' }
    return {
      kind: 'range',
      min: Math.min(...active.map((offer) => offer.priceMin)),
      max: Math.max(...active.map((offer) => offer.priceMax)),
      verifiedAt: oldest,
    }
  }

  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0, minimumFractionDigits: 0 })
  const date = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' })

  export function formatPriceRange(range: PriceRange): string | null {
    if (range.kind === 'unavailable') return 'Indisponível no momento'
    if (range.kind === 'stale') return null
    const values = range.min === range.max ? currency.format(range.min) : `${currency.format(range.min)} – ${currency.format(range.max)}`
    return `${values} · verificado em ${date.format(range.verifiedAt)}`
  }

  export function offerPriceErrors(min: number, max: number): string[] {
    const errors: string[] = []
    if (!(min > 0)) errors.push('O preço mínimo precisa ser maior que zero.')
    if (max < min) errors.push('O preço máximo não pode ser menor que o mínimo.')
    return errors
  }
  ```

- [ ] **Step 4: Rodar e ver passar**

  Run: `pnpm test:unit`
  Expected: PASS.

- [ ] **Step 5: Fábrica e testes das ofertas**

  Acrescente ao final de `tests/int/helpers/fixtures.ts`:
  ```ts
  export async function createOffer(
    payload: Payload,
    tracker: Tracker,
    refs: {
      productId: number | string
      variantId: number | string
      storeId: number | string
      data?: Partial<{ status: 'active' | 'unavailable'; affiliateUrl: string; priceMin: number; priceMax: number }>
    },
  ) {
    return tracker.add(
      'offers',
      await payload.create({
        collection: 'offers',
        data: {
          product: refs.productId,
          variant: refs.variantId,
          store: refs.storeId,
          url: 'https://www.loja.com.br/produto',
          affiliateUrl: 'https://www.loja.com.br/produto?tag=decicompra-20',
          priceMin: 4300,
          priceMax: 4600,
          verifiedAt: new Date().toISOString(),
          status: 'active',
          ...refs.data,
        },
      }),
    )
  }
  ```

  `tests/int/offers.int.spec.ts`:
  ```ts
  import { ValidationError } from 'payload'
  import { afterAll, describe, expect, it } from 'vitest'

  import { createBrand, createCategoryPair, createOffer, createProduct, createStore, Tracker } from './helpers/fixtures'
  import { getTestPayload } from './helpers/getTestPayload'
  import { getTestUsers } from './helpers/users'

  const payloadPromise = getTestPayload()
  let tracker: Tracker

  afterAll(async () => tracker?.cleanup())

  async function setup() {
    const payload = await payloadPromise
    tracker ??= new Tracker(payload)
    const { subcategory } = await createCategoryPair(payload, tracker)
    const brand = await createBrand(payload, tracker)
    const store = await createStore(payload, tracker)
    const product = await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id })
    const [variant] = (await payload.find({ collection: 'variants', where: { product: { equals: product.id } } })).docs
    return { payload, subcategory, brand, store, product, variant }
  }

  const productById = async (id: number | string) =>
    (await payloadPromise).findByID({ collection: 'products', id, depth: 0 })

  describe('Ofertas', () => {
    it('monta o título e marca o produto como tendo oferta ativa', async () => {
      const { payload, store, product, variant } = await setup()
      const offer = await createOffer(payload, tracker, { productId: product.id, variantId: variant.id, storeId: store.id })
      expect(offer.title).toBe(`${variant.title} · ${store.name}`)
      expect((await productById(product.id)).hasActiveOffer).toBe(true)

      await payload.update({ collection: 'offers', id: offer.id, data: { status: 'unavailable' } })
      expect((await productById(product.id)).hasActiveOffer).toBe(false)

      await payload.update({ collection: 'offers', id: offer.id, data: { status: 'active' } })
      await payload.delete({ collection: 'offers', id: offer.id })
      expect((await productById(product.id)).hasActiveOffer).toBe(false)
    })

    it('recusa variante de outro produto, preço invertido e URL sem https', async () => {
      const { payload, subcategory, brand, store, product, variant } = await setup()
      const other = await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id })

      const wrongVariant = await createOffer(payload, tracker, { productId: other.id, variantId: variant.id, storeId: store.id }).catch(
        (e: unknown) => e,
      )
      expect(JSON.stringify((wrongVariant as ValidationError).data)).toContain('não pertence a este produto')

      const inverted = await createOffer(payload, tracker, {
        productId: product.id,
        variantId: variant.id,
        storeId: store.id,
        data: { priceMin: 500, priceMax: 400 },
      }).catch((e: unknown) => e)
      expect(JSON.stringify((inverted as ValidationError).data)).toContain('não pode ser menor que o mínimo')

      const http = await createOffer(payload, tracker, {
        productId: product.id,
        variantId: variant.id,
        storeId: store.id,
        data: { affiliateUrl: 'http://loja.com.br/x' },
      }).catch((e: unknown) => e)
      expect(http).toBeInstanceOf(ValidationError)
    })

    it('apagar a variante ou o produto apaga as ofertas deles', async () => {
      const { payload, store, product, variant } = await setup()
      const extra = await payload.create({ collection: 'variants', data: { product: product.id, label: '65"' } })
      const offerOnExtra = await createOffer(payload, tracker, { productId: product.id, variantId: extra.id, storeId: store.id })
      await payload.delete({ collection: 'variants', id: extra.id })
      expect((await payload.find({ collection: 'offers', where: { id: { equals: offerOnExtra.id } } })).totalDocs).toBe(0)

      const offer = await createOffer(payload, tracker, { productId: product.id, variantId: variant.id, storeId: store.id })
      await payload.delete({ collection: 'products', id: product.id })
      expect((await payload.find({ collection: 'offers', where: { id: { equals: offer.id } } })).totalDocs).toBe(0)
    })

    it('editor cria oferta; redator não', async () => {
      const { payload, store, product, variant } = await setup()
      const { editor, redator } = await getTestUsers(payload)
      const data = {
        product: product.id,
        variant: variant.id,
        store: store.id,
        url: 'https://loja.com.br/p',
        affiliateUrl: 'https://loja.com.br/p?tag=x',
        priceMin: 10,
        priceMax: 20,
        verifiedAt: new Date().toISOString(),
        status: 'active' as const,
      }
      tracker.add('offers', await payload.create({ collection: 'offers', data, user: editor, overrideAccess: false }))
      await expect(payload.create({ collection: 'offers', data, user: redator, overrideAccess: false })).rejects.toThrow()
    })
  })
  ```

- [ ] **Step 6: Rodar e ver falhar**

  Run: `pnpm test:int`
  Expected: FAIL. A coleção `offers` não existe.

- [ ] **Step 7: Hooks das ofertas**

  `src/collections/offers/hooks.ts`:
  ```ts
  import { ValidationError } from 'payload'
  import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionBeforeChangeHook, PayloadRequest } from 'payload'

  import { offerPriceErrors } from '../../catalog/price-range'
  import { pick, relId } from '../../lib/relations'

  export const prepareOffer: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
    const errors: { path: string; message: string }[] = []
    const productId = relId(pick(data, originalDoc, 'product'))
    const variantId = relId(pick(data, originalDoc, 'variant'))
    const storeId = relId(pick(data, originalDoc, 'store'))
    if (productId === null) errors.push({ path: 'product', message: 'Escolha o produto.' })
    if (variantId === null) errors.push({ path: 'variant', message: 'Escolha a variante.' })
    if (storeId === null) errors.push({ path: 'store', message: 'Escolha a loja.' })
    if (errors.length > 0) throw new ValidationError({ collection: 'offers', errors })

    const [variant, store] = await Promise.all([
      req.payload.findByID({ collection: 'variants', id: variantId!, depth: 0, req }),
      req.payload.findByID({ collection: 'stores', id: storeId!, depth: 0, req }),
    ])
    if (String(relId(variant.product)) !== String(productId)) {
      errors.push({ path: 'variant', message: 'A variante escolhida não pertence a este produto.' })
    }
    const priceMin = Number(pick(data, originalDoc, 'priceMin'))
    const priceMax = Number(pick(data, originalDoc, 'priceMax'))
    errors.push(...offerPriceErrors(priceMin, priceMax).map((message) => ({ path: 'priceMax', message })))
    if (errors.length > 0) throw new ValidationError({ collection: 'offers', errors })

    data.title = `${variant.title} · ${store.name}`
    return data
  }

  export async function refreshHasActiveOffer(req: PayloadRequest, productId: number | string | null): Promise<void> {
    if (productId === null) return
    const exists = await req.payload.count({ collection: 'products', where: { id: { equals: productId } }, req })
    if (exists.totalDocs === 0) return
    const active = await req.payload.count({
      collection: 'offers',
      where: { and: [{ product: { equals: productId } }, { status: { equals: 'active' } }] },
      req,
    })
    await req.payload.update({
      collection: 'products',
      id: productId,
      data: { hasActiveOffer: active.totalDocs > 0 },
      req,
      context: { skipPublicationCheck: true },
    })
  }

  export const afterOfferChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req, context }) => {
    if (context.cascade) return doc
    const ids = new Set([relId(doc.product), relId(previousDoc?.product)].filter((id) => id !== null).map(String))
    for (const id of ids) await refreshHasActiveOffer(req, id)
    return doc
  }

  export const afterOfferDelete: CollectionAfterDeleteHook = async ({ doc, req, context }) => {
    if (context.cascade) return
    await refreshHasActiveOffer(req, relId(doc.product))
  }
  ```

- [ ] **Step 8: Coleção `src/collections/Offers.ts`**

  ```ts
  import type { CollectionConfig } from 'payload'

  import { adminOrEditor, anyone } from '../access'
  import { relId } from '../lib/relations'
  import { httpsUrl } from '../lib/url'
  import { afterOfferChange, afterOfferDelete, prepareOffer } from './offers/hooks'

  export const Offers: CollectionConfig = {
    slug: 'offers',
    labels: { singular: 'Oferta', plural: 'Ofertas' },
    admin: {
      useAsTitle: 'title',
      defaultColumns: ['title', 'priceMin', 'priceMax', 'verifiedAt', 'status'],
      group: 'Afiliados',
      description: 'Único lugar onde links e preços são editados. Os botões do site usam /ir/{id}.',
    },
    access: { read: anyone, create: adminOrEditor, update: adminOrEditor, delete: adminOrEditor },
    hooks: { beforeChange: [prepareOffer], afterChange: [afterOfferChange], afterDelete: [afterOfferDelete] },
    fields: [
      { name: 'product', label: 'Produto', type: 'relationship', relationTo: 'products', required: true, index: true },
      {
        name: 'variant',
        label: 'Variante',
        type: 'relationship',
        relationTo: 'variants',
        required: true,
        index: true,
        filterOptions: ({ siblingData }) => {
          const productId = relId((siblingData as { product?: unknown } | undefined)?.product)
          return productId === null ? true : { product: { equals: productId } }
        },
      },
      { name: 'store', label: 'Loja', type: 'relationship', relationTo: 'stores', required: true },
      { name: 'url', label: 'URL da página na loja', type: 'text', required: true, validate: httpsUrl() },
      {
        name: 'affiliateUrl',
        label: 'URL de afiliado',
        type: 'text',
        required: true,
        validate: httpsUrl(),
        admin: { description: 'Destino real do botão. Trocar aqui vale na hora em todo o site.' },
      },
      {
        type: 'row',
        fields: [
          { name: 'priceMin', label: 'Preço mínimo (R$)', type: 'number', required: true, min: 0, admin: { width: '50%' } },
          { name: 'priceMax', label: 'Preço máximo (R$)', type: 'number', required: true, min: 0, admin: { width: '50%' } },
        ],
      },
      {
        name: 'verifiedAt',
        label: 'Verificado em',
        type: 'date',
        required: true,
        defaultValue: () => new Date().toISOString(),
        admin: { position: 'sidebar' },
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        defaultValue: 'active',
        admin: { position: 'sidebar' },
        options: [
          { label: 'Ativa', value: 'active' },
          { label: 'Indisponível', value: 'unavailable' },
        ],
      },
      { name: 'notes', label: 'Observações internas', type: 'textarea' },
      { name: 'title', label: 'Título', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    ],
  }
  ```

  Em `src/payload.config.ts`, importe `Offers` e troque a lista por:
  ```ts
    collections: [Users, Media, Categories, Brands, Stores, Products, Variants, Offers],
  ```

- [ ] **Step 9: Cascatas e join de ofertas no produto**

  Em `src/collections/products/hooks.ts`, substitua `cascadeProductDelete` por:
  ```ts
  export const cascadeProductDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
    await req.payload.delete({ collection: 'offers', where: { product: { equals: id } }, req, context: { cascade: true } })
    await req.payload.delete({ collection: 'variants', where: { product: { equals: id } }, req, context: { cascade: true } })
  }
  ```

  Em `src/collections/Products.ts`, logo depois do campo `variants` (join), acrescente:
  ```ts
              { name: 'offers', label: 'Ofertas', type: 'join', collection: 'offers', on: 'product' },
  ```

  Em `src/collections/variants/hooks.ts`, acrescente o import:
  ```ts
  import { refreshHasActiveOffer } from '../offers/hooks'
  ```
  E as duas funções no fim do arquivo:
  ```ts
  // Ofertas mostram o título da variante; mantê-lo em dia
  export const refreshOfferTitles: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
    if (previousDoc?.title === doc.title) return doc
    const { docs } = await req.payload.find({ collection: 'offers', where: { variant: { equals: doc.id } }, depth: 0, limit: 1000, req })
    for (const offer of docs) await req.payload.update({ collection: 'offers', id: offer.id, data: {}, req })
    return doc
  }

  export const deleteVariantOffers: CollectionAfterDeleteHook = async ({ doc, req, context }) => {
    if (context.cascade) return
    await req.payload.delete({ collection: 'offers', where: { variant: { equals: doc.id } }, req, context: { cascade: true } })
    await refreshHasActiveOffer(req, relId(doc.product))
  }
  ```
  Em `src/collections/Variants.ts`, troque o import dos hooks e os `hooks` por:
  ```ts
  import {
    deleteVariantOffers,
    guardVariantDelete,
    prepareVariant,
    promoteReference,
    refreshOfferTitles,
    syncReference,
  } from './variants/hooks'
  ```
  ```ts
    hooks: {
      beforeChange: [prepareVariant],
      afterChange: [syncReference, refreshOfferTitles],
      beforeDelete: [guardVariantDelete],
      afterDelete: [promoteReference, deleteVariantOffers],
    },
  ```

- [ ] **Step 10: Migração**

  ```bash
  pnpm generate:types
  pnpm payload migrate:create offers
  pnpm payload migrate
  ```

- [ ] **Step 11: Rodar os testes**

  Run: `pnpm test:unit && pnpm test:int`
  Expected: PASS (inclui os 4 de `offers.int.spec.ts`).

- [ ] **Step 12: Commit**

  ```bash
  git add -A
  git commit -m "feat: ofertas de afiliado, faixa de preço e indicador de oferta ativa" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 10: Ressincronizar produtos quando a subcategoria muda

**Files:**
- Modify: `src/collections/categories/hooks.ts`, `src/collections/Categories.ts`
- Create: `tests/int/taxonomy-resync.int.spec.ts`

**Interfaces:**
- Consumes: `context.skipPublicationCheck` (Tarefa 8), as fábricas de `fixtures.ts`
- Produces: `resyncSubcategoryProducts`, um hook `afterChange` de `categories`. Quando o modelo ou os critérios de uma subcategoria mudam, ele atualiza todos os produtos e variantes dela: linhas de especificação e de nota, mais a nota final.

- [ ] **Step 1: Teste**

  `tests/int/taxonomy-resync.int.spec.ts`:
  ```ts
  import { afterAll, describe, expect, it } from 'vitest'

  import { createBrand, createCategoryPair, createImage, createProduct, makePublishable, sampleSpecTemplate, Tracker } from './helpers/fixtures'
  import { getTestPayload } from './helpers/getTestPayload'

  const payloadPromise = getTestPayload()
  let tracker: Tracker

  afterAll(async () => tracker?.cleanup())

  describe('Mudança de pesos e de modelo na subcategoria', () => {
    it('recalcula a nota de produtos publicados e adiciona as linhas novas, sem bloquear o salvamento', async () => {
      const payload = await payloadPromise
      tracker = new Tracker(payload)
      const { subcategory } = await createCategoryPair(payload, tracker)
      const brand = await createBrand(payload, tracker)
      const product = await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id })
      const image = await createImage(payload, tracker)
      const published = await makePublishable(payload, product.id, image.id)
      expect(published.finalScore).toBe(8.6)

      await payload.update({
        collection: 'categories',
        id: subcategory.id,
        data: {
          criteria: [
            { key: 'imagem', name: 'Imagem', weight: 20 },
            { key: 'custo_beneficio', name: 'Custo-benefício', weight: 80 },
          ],
          specTemplate: [
            ...sampleSpecTemplate,
            { key: 'hdmi', label: 'Portas HDMI', type: 'number', required: true },
            { key: 'cor', label: 'Cor', type: 'text', perVariant: true },
          ],
        },
      })

      const after = await payload.findByID({ collection: 'products', id: product.id, depth: 0 })
      expect(after.finalScore).toBe(8.2)
      expect(after.status).toBe('ficha')
      expect(after.specs?.map((r) => r.key)).toContain('hdmi')
      expect(after.scores?.map((r) => r.label)).toEqual(['Imagem (20%)', 'Custo-benefício (80%)'])

      const [variant] = (await payload.find({ collection: 'variants', where: { product: { equals: product.id } } })).docs
      expect(variant.specs?.map((r) => r.key)).toEqual(['tamanho', 'cor'])
    })
  })
  ```

- [ ] **Step 2: Rodar e ver falhar**

  Run: `pnpm test:int`
  Expected: FAIL. `finalScore` continua 8.6, porque nada recalcula.

- [ ] **Step 3: Implementar o hook**

  Em `src/collections/categories/hooks.ts`, acrescente ao import de tipos `CollectionAfterChangeHook` e, no fim do arquivo:
  ```ts
  function rulesSignature(doc: Record<string, unknown> | undefined): string {
    const strip = (rows: unknown) =>
      Array.isArray(rows) ? rows.map(({ id: _id, ...rest }: Record<string, unknown>) => rest) : []
    return JSON.stringify({ template: strip(doc?.specTemplate), criteria: strip(doc?.criteria) })
  }

  // Produtos e variantes acompanham o modelo e os critérios da subcategoria
  export const resyncSubcategoryProducts: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
    if (operation !== 'update' || relId(doc.parent) === null) return doc
    if (rulesSignature(doc) === rulesSignature(previousDoc)) return doc

    const products = await req.payload.find({
      collection: 'products',
      where: { subcategory: { equals: doc.id } },
      depth: 0,
      limit: 10_000,
      req,
    })
    for (const product of products.docs) {
      await req.payload.update({ collection: 'products', id: product.id, data: {}, req, context: { skipPublicationCheck: true } })
      const variants = await req.payload.find({ collection: 'variants', where: { product: { equals: product.id } }, depth: 0, limit: 1000, req })
      for (const variant of variants.docs) await req.payload.update({ collection: 'variants', id: variant.id, data: {}, req })
    }
    return doc
  }
  ```
  Em `src/collections/Categories.ts`, troque o import dos hooks e `hooks` por:
  ```ts
  import { guardCategoryDelete, resyncSubcategoryProducts, validateCategory } from './categories/hooks'
  ```
  ```ts
    hooks: { beforeChange: [validateCategory], afterChange: [resyncSubcategoryProducts], beforeDelete: [guardCategoryDelete] },
  ```

- [ ] **Step 4: Rodar e ver passar**

  Run: `pnpm test:int`
  Expected: PASS. A nota 9×0,2 + 8×0,8 = 8,2.

- [ ] **Step 5: Commit**

  ```bash
  git add -A
  git commit -m "feat: produtos acompanham mudanças de modelo e pesos da subcategoria" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 11: Redirecionamento `/ir/{id}`

**Files:**
- Create: `src/catalog/outbound.ts`, `tests/unit/outbound.test.ts`, `src/app/(frontend)/ir/[id]/route.ts`, `tests/int/outbound.int.spec.ts`

**Interfaces:**
- Consumes: as coleções `offers`, `stores`, `products`; as fábricas de `fixtures.ts`
- Produces:
  - `type OutboundOffer = { status: 'active' | 'unavailable'; affiliateUrl: string; store: { active: boolean } | null; product: { slug: string } | null }`
  - `resolveOutbound(offer: OutboundOffer | null): string`
  - A rota `GET /ir/{id}`, que responde 302 com os cabeçalhos `Location`, `X-Robots-Tag` e `Cache-Control: no-store`

- [ ] **Step 1: Testes**

  `tests/unit/outbound.test.ts`:
  ```ts
  import { describe, expect, it } from 'vitest'

  import { resolveOutbound, type OutboundOffer } from '@/catalog/outbound'

  const offer: OutboundOffer = {
    status: 'active',
    affiliateUrl: 'https://www.amazon.com.br/dp/X?tag=decicompra-20',
    store: { active: true },
    product: { slug: 'lg-c4' },
  }

  describe('resolveOutbound', () => {
    it('oferta ativa de loja ativa vai para a URL de afiliado', () => {
      expect(resolveOutbound(offer)).toBe(offer.affiliateUrl)
    })

    it('oferta indisponível ou loja inativa volta para a página do produto', () => {
      expect(resolveOutbound({ ...offer, status: 'unavailable' })).toBe('/produtos/lg-c4/')
      expect(resolveOutbound({ ...offer, store: { active: false } })).toBe('/produtos/lg-c4/')
    })

    it('sem oferta ou sem produto vai para a home', () => {
      expect(resolveOutbound(null)).toBe('/')
      expect(resolveOutbound({ ...offer, status: 'unavailable', product: null })).toBe('/')
    })
  })
  ```

  `tests/int/outbound.int.spec.ts`:
  ```ts
  import { afterAll, describe, expect, it } from 'vitest'

  import { GET } from '@/app/(frontend)/ir/[id]/route'

  import { createBrand, createCategoryPair, createOffer, createProduct, createStore, Tracker } from './helpers/fixtures'
  import { getTestPayload } from './helpers/getTestPayload'

  const payloadPromise = getTestPayload()
  let tracker: Tracker

  afterAll(async () => tracker?.cleanup())

  const go = (id: string | number) => GET(new Request(`http://localhost/ir/${id}`), { params: Promise.resolve({ id: String(id) }) })

  async function setup(storeActive = true) {
    const payload = await payloadPromise
    tracker ??= new Tracker(payload)
    const { subcategory } = await createCategoryPair(payload, tracker)
    const brand = await createBrand(payload, tracker)
    const store = await createStore(payload, tracker, { active: storeActive })
    const product = await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id })
    const [variant] = (await payload.find({ collection: 'variants', where: { product: { equals: product.id } } })).docs
    const offer = await createOffer(payload, tracker, { productId: product.id, variantId: variant.id, storeId: store.id })
    return { payload, product, offer }
  }

  describe('/ir/{id}', () => {
    it('redireciona para o afiliado, sem cache e sem indexação; troca de URL vale na hora', async () => {
      const { payload, offer } = await setup()
      let res = await go(offer.id)
      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe(offer.affiliateUrl)
      expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow')
      expect(res.headers.get('cache-control')).toBe('no-store')

      await payload.update({ collection: 'offers', id: offer.id, data: { affiliateUrl: 'https://nova.loja.com.br/x?tag=novo' } })
      res = await go(offer.id)
      expect(res.headers.get('location')).toBe('https://nova.loja.com.br/x?tag=novo')
    })

    it('oferta indisponível ou loja inativa volta para o produto', async () => {
      const { payload, product, offer } = await setup()
      await payload.update({ collection: 'offers', id: offer.id, data: { status: 'unavailable' } })
      expect((await go(offer.id)).headers.get('location')).toBe(`/produtos/${product.slug}/`)

      const inactive = await setup(false)
      expect((await go(inactive.offer.id)).headers.get('location')).toBe(`/produtos/${inactive.product.slug}/`)
    })

    it('id inexistente ou inválido vai para a home', async () => {
      expect((await go(999_999_999)).headers.get('location')).toBe('/')
      expect((await go('abc')).headers.get('location')).toBe('/')
    })
  })
  ```

- [ ] **Step 2: Rodar e ver falhar**

  Run: `pnpm test:unit && pnpm test:int`
  Expected: FAIL. `@/catalog/outbound` e a rota não existem.

- [ ] **Step 3: Implementar**

  `src/catalog/outbound.ts`:
  ```ts
  export type OutboundOffer = {
    status: 'active' | 'unavailable'
    affiliateUrl: string
    store: { active: boolean } | null
    product: { slug: string } | null
  }

  // Destino de /ir/{id} (spec §5.3)
  export function resolveOutbound(offer: OutboundOffer | null): string {
    if (!offer) return '/'
    if (offer.status === 'active' && offer.store?.active && offer.affiliateUrl) return offer.affiliateUrl
    return offer.product ? `/produtos/${offer.product.slug}/` : '/'
  }
  ```

  `src/app/(frontend)/ir/[id]/route.ts`:
  ```ts
  import config from '@payload-config'
  import { getPayload } from 'payload'

  import { resolveOutbound, type OutboundOffer } from '@/catalog/outbound'

  export const dynamic = 'force-dynamic'

  export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const location = resolveOutbound(await loadOffer(id))
    return new Response(null, {
      status: 302,
      headers: { Location: location, 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
    })
  }

  async function loadOffer(id: string): Promise<OutboundOffer | null> {
    if (!/^\d+$/.test(id)) return null
    const payload = await getPayload({ config })
    const offer = await payload.findByID({ collection: 'offers', id: Number(id), depth: 1, disableErrors: true })
    if (!offer) return null
    const store = typeof offer.store === 'object' && offer.store ? offer.store : null
    const product = typeof offer.product === 'object' && offer.product ? offer.product : null
    return {
      status: offer.status,
      affiliateUrl: offer.affiliateUrl,
      store: store ? { active: Boolean(store.active) } : null,
      product: product ? { slug: product.slug } : null,
    }
  }
  ```

- [ ] **Step 4: Rodar e ver passar**

  Run: `pnpm test:unit && pnpm test:int`
  Expected: PASS.

- [ ] **Step 5: Verificar no navegador**

  Run: `pnpm dev`. No painel, crie uma loja, uma oferta para um produto de teste e anote o id da oferta.

  Abra `http://localhost:3000/ir/<id>`.
  Esperado: o navegador vai para a URL de afiliado.

  Apague os dados de teste e pare o servidor.

- [ ] **Step 6: Commit**

  ```bash
  git add -A
  git commit -m "feat: redirecionamento de afiliado /ir/{id}" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 12: Painel de manutenção no admin

**Files:**
- Create: `src/catalog/maintenance.ts`, `tests/unit/maintenance.test.ts`, `src/components/admin/MaintenancePanel.tsx`, `tests/components/MaintenancePanel.test.tsx`
- Modify: `src/payload.config.ts`, `src/app/(payload)/admin/importMap.js` (gerado)

**Interfaces:**
- Consumes: os campos `offers.status`, `offers.verifiedAt`, `products.status` e `products.hasActiveOffer`
- Produces:
  - `STALE_OFFER_DAYS = 30`
  - `staleOffersWhere(now: Date): Where`
  - `productsWithoutActiveOfferWhere(): Where`
  - `toQueryString(value: Record<string, unknown>): string`
  - `adminListUrl(collection: string, where: Where): string`
  - `<MaintenancePanel payload={…} />` (componente de servidor exibido antes do dashboard)
  - A Fase 1B vai acrescentar a linha "Conteúdos a revisar"

- [ ] **Step 1: Testes**

  `tests/unit/maintenance.test.ts`:
  ```ts
  import { describe, expect, it } from 'vitest'

  import { adminListUrl, productsWithoutActiveOfferWhere, staleOffersWhere, toQueryString } from '@/catalog/maintenance'

  describe('consultas de manutenção', () => {
    it('ofertas ativas verificadas há mais de 30 dias', () => {
      expect(staleOffersWhere(new Date('2026-10-31T00:00:00.000Z'))).toEqual({
        and: [{ status: { equals: 'active' } }, { verifiedAt: { less_than: '2026-10-01T00:00:00.000Z' } }],
      })
    })

    it('produtos publicados sem oferta ativa', () => {
      expect(productsWithoutActiveOfferWhere()).toEqual({
        and: [{ status: { not_equals: 'rascunho' } }, { hasActiveOffer: { equals: false } }],
      })
    })
  })

  describe('toQueryString e adminListUrl', () => {
    it('serializa no formato de colchetes que o painel entende', () => {
      const qs = toQueryString({ where: { and: [{ status: { equals: 'active' } }] } })
      expect(decodeURIComponent(qs)).toBe('where[and][0][status][equals]=active')
    })

    it('monta a URL da lista filtrada', () => {
      const url = adminListUrl('products', productsWithoutActiveOfferWhere())
      expect(url.startsWith('/admin/collections/products?')).toBe(true)
      expect(decodeURIComponent(url)).toContain('where[and][1][hasActiveOffer][equals]=false')
    })
  })
  ```

  `tests/components/MaintenancePanel.test.tsx`:
  ```tsx
  import { render, screen } from '@testing-library/react'
  import { describe, expect, it, vi } from 'vitest'

  import { MaintenancePanel } from '@/components/admin/MaintenancePanel'

  describe('MaintenancePanel', () => {
    it('mostra as contagens com links para as listas filtradas', async () => {
      const count = vi.fn().mockResolvedValueOnce({ totalDocs: 3 }).mockResolvedValueOnce({ totalDocs: 0 })
      render(await MaintenancePanel({ payload: { count } } as never))

      const stale = screen.getByRole('link', { name: /Ofertas desatualizadas/ })
      expect(stale.textContent).toContain('3')
      expect(decodeURIComponent(stale.getAttribute('href') ?? '')).toContain('/admin/collections/offers?where[and][0][status][equals]=active')

      const noOffer = screen.getByRole('link', { name: /sem oferta ativa/ })
      expect(noOffer.textContent).toContain('0')
      expect(count).toHaveBeenCalledTimes(2)
    })
  })
  ```

- [ ] **Step 2: Rodar e ver falhar**

  Run: `pnpm test:unit`
  Expected: FAIL. Os módulos não existem.

- [ ] **Step 3: Implementar**

  `src/catalog/maintenance.ts`:
  ```ts
  import type { Where } from 'payload'

  export const STALE_OFFER_DAYS = 30

  const DAY_MS = 86_400_000

  export function staleOffersWhere(now: Date): Where {
    const limit = new Date(now.getTime() - STALE_OFFER_DAYS * DAY_MS).toISOString()
    return { and: [{ status: { equals: 'active' } }, { verifiedAt: { less_than: limit } }] }
  }

  export function productsWithoutActiveOfferWhere(): Where {
    return { and: [{ status: { not_equals: 'rascunho' } }, { hasActiveOffer: { equals: false } }] }
  }

  function flatten(value: unknown, prefix: string, out: [string, string][]): void {
    if (Array.isArray(value)) value.forEach((item, index) => flatten(item, `${prefix}[${index}]`, out))
    else if (value !== null && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) flatten(item, prefix ? `${prefix}[${key}]` : key, out)
    } else if (value !== undefined) out.push([prefix, String(value)])
  }

  // Formato where[and][0][campo][operador]=valor, usado pelas listas do painel
  export function toQueryString(value: Record<string, unknown>): string {
    const out: [string, string][] = []
    flatten(value, '', out)
    return out.map(([key, item]) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`).join('&')
  }

  export function adminListUrl(collection: string, where: Where): string {
    return `/admin/collections/${collection}?${toQueryString({ where })}`
  }
  ```

  `src/components/admin/MaintenancePanel.tsx`:
  ```tsx
  import type { ServerProps } from 'payload'

  import { adminListUrl, productsWithoutActiveOfferWhere, staleOffersWhere } from '../../catalog/maintenance'

  // Exibido no início do painel (spec §8.4)
  export async function MaintenancePanel({ payload }: Pick<ServerProps, 'payload'>) {
    const now = new Date()
    const staleWhere = staleOffersWhere(now)
    const noOfferWhere = productsWithoutActiveOfferWhere()
    const [stale, noOffer] = await Promise.all([
      payload.count({ collection: 'offers', where: staleWhere }),
      payload.count({ collection: 'products', where: noOfferWhere }),
    ])
    const items = [
      { label: 'Ofertas desatualizadas (verificadas há mais de 30 dias)', count: stale.totalDocs, href: adminListUrl('offers', staleWhere) },
      { label: 'Produtos publicados sem oferta ativa', count: noOffer.totalDocs, href: adminListUrl('products', noOfferWhere) },
    ]
    return (
      <section
        aria-labelledby="manutencao-titulo"
        style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}
      >
        <h2 id="manutencao-titulo" style={{ margin: '0 0 8px', fontSize: 18 }}>
          Manutenção
        </h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {items.map((item) => (
            <li key={item.href} style={{ margin: '4px 0' }}>
              <a href={item.href}>
                {item.label}: <strong>{item.count}</strong>
              </a>
            </li>
          ))}
        </ul>
      </section>
    )
  }
  ```

  Em `src/payload.config.ts`, dentro de `admin: { … }`, acrescente:
  ```ts
      components: { beforeDashboard: ['/components/admin/MaintenancePanel#MaintenancePanel'] },
  ```
  Depois:
  ```bash
  pnpm generate:importmap
  ```

- [ ] **Step 4: Rodar e ver passar**

  Run: `pnpm test:unit && pnpm typecheck`
  Expected: PASS.

- [ ] **Step 5: Verificar no painel**

  Run: `pnpm dev` → http://localhost:3000/admin.

  Esperado:
  - o bloco **Manutenção** aparece no topo do painel, com as duas contagens
  - clicar numa linha abre a lista já filtrada

  Pare o servidor.

- [ ] **Step 6: Commit**

  ```bash
  git add -A
  git commit -m "feat: painel de manutenção (ofertas desatualizadas e produtos sem oferta)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 13: Categorias iniciais (seed) e runner de ambiente

**Files:**
- Create: `src/seed/taxonomy.ts`, `scripts/seed-taxonomy.ts`, `scripts/with-env.mjs`, `tests/int/seed.int.spec.ts`
- Modify: `README.md`, `package.json` (script `seed:taxonomia`)

**Interfaces:**
- Consumes: a coleção `categories`, `footerColumns` (`src/config/navigation.ts`, Fase 0)
- Produces:
  - `TAXONOMY` (dados da spec §3.1 e §9.4)
  - `seedTaxonomy(payload): Promise<{ created: number; existing: number }>`: idempotente; só cria o que falta e nunca sobrescreve
  - `pnpm seed:taxonomia`
  - `node scripts/with-env.mjs <arquivo .env> <comando…>`

- [ ] **Step 1: Teste**

  `tests/int/seed.int.spec.ts`:
  ```ts
  import { describe, expect, it } from 'vitest'

  import { footerColumns } from '@/config/navigation'
  import { seedTaxonomy, TAXONOMY } from '@/seed/taxonomy'

  import { getTestPayload } from './helpers/getTestPayload'

  describe('Seed das categorias', () => {
    it('é idempotente e bate com a spec e com os links do rodapé', async () => {
      const payload = await getTestPayload()
      await seedTaxonomy(payload)
      const second = await seedTaxonomy(payload)
      expect(second.created).toBe(0)

      const anchors = await payload.find({ collection: 'categories', where: { isAnchor: { equals: true } }, limit: 100 })
      const anchorSlugs = anchors.docs.map((d) => d.slug).sort()
      expect(anchorSlugs).toEqual(expect.arrayContaining(['air-fryers', 'ar-condicionado', 'furadeiras-e-parafusadeiras', 'notebooks', 'smart-tvs']))
      for (const doc of anchors.docs.filter((d) => TAXONOMY.some((c) => c.subcategories.some((s) => s.slug === d.slug)))) {
        expect((doc.criteria ?? []).reduce((sum, c) => sum + c.weight, 0)).toBe(100)
      }

      const footerCategoryHrefs = footerColumns.find((c) => c.title === 'Categorias')!.links.map((l) => l.href)
      expect(TAXONOMY.map((c) => `/${c.slug}/`)).toEqual(footerCategoryHrefs)
    })
  })
  ```

- [ ] **Step 2: Rodar e ver falhar**

  Run: `pnpm test:int`
  Expected: FAIL. `@/seed/taxonomy` não existe.

- [ ] **Step 3: Implementar `src/seed/taxonomy.ts`**

  ```ts
  import type { Payload } from 'payload'

  import type { Criterion } from '../catalog/score'
  import { slugify } from '../lib/slug'

  type SubcategorySeed = { name: string; slug: string; anchor?: boolean; criteria?: Criterion[] }
  type CategorySeed = { name: string; slug: string; icon: string; subcategories: SubcategorySeed[] }

  const sub = (name: string, extra: Partial<SubcategorySeed> = {}): SubcategorySeed => ({ name, slug: slugify(name), ...extra })

  const c = (key: string, name: string, weight: number): Criterion => ({ key, name, weight })

  // Spec §3.1 (categorias e âncoras) e §9.4 (pesos iniciais)
  export const TAXONOMY: CategorySeed[] = [
    {
      name: 'Casa & Eletrodomésticos',
      slug: 'casa-e-eletrodomesticos',
      icon: '🏠',
      subcategories: [
        sub('Ar-condicionado', {
          anchor: true,
          criteria: [
            c('eficiencia_energetica', 'Eficiência energética (Procel/IDRS)', 25),
            c('desempenho_ruido', 'Desempenho e ruído', 20),
            c('recursos', 'Recursos (inverter, Wi-Fi, filtros)', 10),
            c('confiabilidade_suporte_instalacao', 'Confiabilidade, suporte e instalação', 20),
            c('custo_beneficio', 'Custo-benefício', 25),
          ],
        }),
        sub('Geladeiras'),
        sub('Máquinas de lavar'),
        sub('Micro-ondas'),
        sub('Fornos'),
        sub('Aspiradores'),
        sub('Climatizadores'),
      ],
    },
    {
      name: 'Ferramentas & Equipamentos',
      slug: 'ferramentas-e-equipamentos',
      icon: '🔧',
      subcategories: [
        sub('Furadeiras e parafusadeiras', {
          anchor: true,
          criteria: [
            c('potencia_desempenho', 'Potência e desempenho', 30),
            c('ergonomia', 'Ergonomia', 15),
            c('durabilidade', 'Durabilidade', 20),
            c('suporte_pecas', 'Suporte e peças', 15),
            c('custo_beneficio', 'Custo-benefício', 20),
          ],
        }),
        sub('Serras'),
        sub('Compressores'),
        sub('Lavadoras de alta pressão'),
        sub('Ferramentas manuais'),
      ],
    },
    {
      name: 'Eletroportáteis',
      slug: 'eletroportateis',
      icon: '🍳',
      subcategories: [
        sub('Air fryers', {
          anchor: true,
          criteria: [
            c('cozimento_capacidade', 'Cozimento e capacidade', 30),
            c('facilidade_uso_limpeza', 'Facilidade de uso e limpeza', 20),
            c('construcao_durabilidade', 'Construção e durabilidade', 20),
            c('suporte', 'Suporte', 10),
            c('custo_beneficio', 'Custo-benefício', 20),
          ],
        }),
        sub('Cafeteiras'),
        sub('Liquidificadores'),
        sub('Batedeiras'),
        sub('Panelas elétricas'),
        sub('Sanduicheiras'),
        sub('Processadores'),
      ],
    },
    {
      name: 'Tecnologia',
      slug: 'tecnologia',
      icon: '💻',
      subcategories: [
        sub('Notebooks', {
          anchor: true,
          criteria: [
            c('desempenho', 'Desempenho', 30),
            c('tela_construcao', 'Tela e construção', 15),
            c('bateria_portabilidade', 'Bateria e portabilidade', 15),
            c('confiabilidade_suporte', 'Confiabilidade e suporte', 15),
            c('custo_beneficio', 'Custo-benefício', 25),
          ],
        }),
        sub('Computadores'),
        sub('Monitores'),
        sub('Impressoras'),
        sub('Celulares'),
        sub('Tablets'),
        sub('Acessórios', { slug: 'acessorios-de-tecnologia' }),
        sub('Roteadores'),
        sub('Armazenamento'),
      ],
    },
    {
      name: 'TVs & Entretenimento',
      slug: 'tvs-e-entretenimento',
      icon: '📺',
      subcategories: [
        sub('Smart TVs', {
          anchor: true,
          criteria: [
            c('imagem', 'Imagem', 35),
            c('recursos_smart', 'Recursos/Smart', 15),
            c('som', 'Som', 10),
            c('confiabilidade_suporte', 'Confiabilidade e suporte', 15),
            c('custo_beneficio', 'Custo-benefício', 25),
          ],
        }),
        sub('Soundbars'),
        sub('Projetores'),
        sub('Acessórios', { slug: 'acessorios-de-tv' }),
      ],
    },
  ]

  async function findBySlug(payload: Payload, slug: string) {
    const { docs } = await payload.find({ collection: 'categories', where: { slug: { equals: slug } }, depth: 0, limit: 1 })
    return docs[0] ?? null
  }

  // Cria só o que falta; nunca sobrescreve edições feitas no painel
  export async function seedTaxonomy(payload: Payload): Promise<{ created: number; existing: number }> {
    let created = 0
    let existing = 0
    for (const [order, category] of TAXONOMY.entries()) {
      let parent = await findBySlug(payload, category.slug)
      if (parent) existing++
      else {
        parent = await payload.create({
          collection: 'categories',
          data: { name: category.name, slug: category.slug, icon: category.icon, order },
        })
        created++
      }
      for (const [subOrder, subcategory] of category.subcategories.entries()) {
        if (await findBySlug(payload, subcategory.slug)) {
          existing++
          continue
        }
        await payload.create({
          collection: 'categories',
          data: {
            name: subcategory.name,
            slug: subcategory.slug,
            parent: parent.id,
            order: subOrder,
            isAnchor: Boolean(subcategory.anchor),
            criteria: subcategory.criteria ?? [],
          },
        })
        created++
      }
    }
    return { created, existing }
  }
  ```

  Os dois "Acessórios" ganham slugs diferentes, porque os slugs são únicos no sistema inteiro.

- [ ] **Step 4: Script e runner**

  `scripts/seed-taxonomy.ts`:
  ```ts
  import { getPayload } from 'payload'

  import config from '../src/payload.config'
  import { seedTaxonomy } from '../src/seed/taxonomy'

  const payload = await getPayload({ config })
  const result = await seedTaxonomy(payload)
  console.log(`Categorias: ${result.created} criadas, ${result.existing} já existiam.`)
  process.exit(0)
  ```

  `scripts/with-env.mjs`:
  ```js
  // Uso: node scripts/with-env.mjs <arquivo .env> <comando...>
  // Roda o comando com as variáveis desse arquivo por cima do ambiente (o shell não lida bem com "&" nas URLs do Neon)
  import { spawnSync } from 'node:child_process'
  import { readFileSync } from 'node:fs'

  import dotenv from 'dotenv'

  const [file, ...command] = process.argv.slice(2)
  if (!file || command.length === 0) {
    console.error('Uso: node scripts/with-env.mjs <arquivo .env> <comando...>')
    process.exit(1)
  }
  const env = { ...process.env, ...dotenv.parse(readFileSync(file)) }
  let host = '(sem DATABASE_URL)'
  try {
    host = new URL(env.DATABASE_URL).hostname
  } catch {}
  console.log(`[with-env] ${file} → banco ${host}`)
  const result = spawnSync(command.join(' '), { env, shell: true, stdio: 'inherit' })
  process.exit(result.status ?? 1)
  ```

  Em `package.json`, acrescente aos scripts:
  ```json
      "seed:taxonomia": "cross-env NODE_OPTIONS=--no-deprecation payload run scripts/seed-taxonomy.ts",
  ```

  No `README.md`, acrescente ao final:
  ````markdown
  ## Categorias iniciais

  ```bash
  pnpm seed:taxonomia
  ```
  Cria as 5 categorias e as subcategorias da spec (com os pesos das âncoras). Pode rodar de novo sem duplicar.

  ## Rodar um comando em outro ambiente

  ```bash
  node scripts/with-env.mjs .env.production.local pnpm payload migrate:status
  ```
  Mostra o banco de destino antes de rodar. Use com cuidado: em produção, os comandos gravam dados reais.
  ````

- [ ] **Step 5: Rodar os testes e o seed no dev**

  Run: `pnpm test:int`
  Expected: PASS.

  Run: `pnpm seed:taxonomia`
  Expected: "Categorias: 37 criadas, 0 já existiam."

  Run: `pnpm seed:taxonomia`
  Expected: "Categorias: 0 criadas, 37 já existiam."

- [ ] **Step 6: Commit**

  ```bash
  git add -A
  git commit -m "feat: seed das categorias iniciais e runner de ambiente" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 14: Verificação final e publicação (com o responsável)

**Files:** nenhum novo.

**Interfaces:**
- Consumes: todas as tarefas anteriores
- Produces: a Fase 1A em produção, com as categorias iniciais cadastradas

- [ ] **Step 1: Suíte completa e simulação do CI**

  Pare qualquer servidor na porta 3000.
  ```bash
  pnpm lint && pnpm test:unit && pnpm test:int && pnpm build && pnpm typecheck && CI=true pnpm test:e2e
  ```
  Expected: tudo PASS.

- [ ] **Step 2: Publicar (pedir autorização ao responsável)**

  Com a autorização, junte o branch de trabalho ao `main` com fast-forward e envie:
  ```bash
  git push origin main
  ```
  Esperado:
  - CI verde no GitHub
  - deploy de produção na Vercel com ✔. O build aplica as migrações no banco `production`, e o seu usuário de produção vira Administrador.

- [ ] **Step 3: Categorias iniciais na produção (pedir autorização ao responsável)**

  ```bash
  node scripts/with-env.mjs .env.production.local pnpm seed:taxonomia
  ```
  Esperado:
  - a linha `[with-env]` mostra o host do banco **production**
  - a saída é "Categorias: 37 criadas, 0 já existiam."

- [ ] **Step 4: Conferência com o responsável**

  O responsável entra em https://decicompra.vercel.app/admin e confere:
  - grupos **Catálogo** (Categorias, Marcas, Produtos, Variantes) e **Afiliados** (Lojas, Ofertas) no menu
  - as 5 categorias com suas subcategorias, e as 5 âncoras com os pesos da spec
  - o bloco **Manutenção** no topo do painel
  - o próprio papel: **Administrador**
