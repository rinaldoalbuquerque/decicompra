# DeciCompra · Fase 0 (Fundação): Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Tarefas humanas:** as Tarefas 1 e 8 envolvem criar contas e clicar em painéis web. Quem executa é o **responsável pelo projeto**, com o agente orientando passo a passo. O agente **para e espera** a confirmação antes de seguir. O agente nunca pede que senhas ou chaves sejam coladas no chat. Elas vão direto para o arquivo `.env` local ou para o painel da Vercel.

**Goal:** Deixar no ar (deploy de prévia na Vercel) um projeto Next.js + Payload CMS com:
- banco PostgreSQL no Neon
- imagens no Cloudflare R2
- painel em português
- identidade visual aplicada (cores, fontes, cabeçalho, rodapé)
- CI rodando lint, testes e build a cada push

**Architecture:** Um único projeto Next.js (App Router) contém o site público (`src/app/(frontend)`) e o painel Payload (`src/app/(payload)`). O banco de dados só muda via migrações versionadas (`push: false`). A configuração lida de variáveis de ambiente é validada na inicialização, e o app falha cedo com mensagens claras. As imagens vão para o R2 através do plugin `@payloadcms/storage-s3`, com versões WebP geradas no upload.

**Tech Stack:** Node 24 · pnpm 10 · Next.js 16.3 · Payload 3.90.2 (`@payloadcms/db-postgres`, `@payloadcms/storage-s3`, `@payloadcms/translations`) · PostgreSQL (Neon) · Cloudflare R2 · Tailwind CSS 4.3 · Vitest 4 + Testing Library · Playwright · GitHub Actions · Vercel.

**Spec:** [docs/superpowers/specs/2026-10-03-decicompra-design.md](../specs/2026-10-03-decicompra-design.md). Esta é a Fase 0 da seção 14.

## Global Constraints

- **Versões:** todos os pacotes `payload` e `@payloadcms/*` ficam na **mesma versão exata (3.90.2)**. A versão do Next é a que o template do Payload 3.90.2 instala (16.3.x).
- **Ambiente:** Node ≥ 20.9 (local: 24). Gerenciador de pacotes: **pnpm** (`"packageManager": "pnpm@10.20.0"`).
- **TypeScript:** `strict: true`.
- **Idioma:**
  - Identificadores de código em inglês
  - Rótulos do painel e do site em português (spec §4)
  - Painel do Payload em português (`pt`)
- **Banco de dados:** o esquema só muda via migrações (`push: false`). Toda mudança de coleção = `pnpm payload migrate:create <nome>` + commit da migração.
- **Segredos:** só em variáveis de ambiente. `.env` nunca vai para o git. `.env.example` documenta todas as variáveis.
- **Tokens de cor (spec §7.1), valores exatos:**
  - `azul-profundo` #172554
  - `azul-eletrico` #2563EB
  - `verde` #16A34A
  - `verde-texto` #15803D
  - `cinza-claro` #F1F5F9
  - `branco` #FFFFFF
  - `texto` #0F172A
  - `texto-suave` #475569
  - `negativo` #DC2626
- **Tipografia (spec §7.2):** Manrope 700–800 (títulos, logo) e Inter 400–600 (texto), auto-hospedadas via `next/font`. Corpo 16 px no celular e 17 px no desktop.
- **Layout (spec §7.3):** conteúdo com até 1280 px de largura, centralizado. Margem lateral de 16 px no celular.
- **Título das páginas (spec §11):** "{título} | DeciCompra".
- **Acessibilidade:** WCAG 2.2 AA (contraste, teclado, foco visível, `alt` obrigatório).
- **Mídia (spec §4.10):** `alt` obrigatório + `crédito/fonte` obrigatório. Versões WebP de 320, 640 e 1280 px geradas no upload.
- **Segurança:**
  - Login do painel bloqueado após 5 tentativas erradas, por 15 minutos (spec §12.5)
  - GraphQL desativado (não é usado)
- **Indexação antes do lançamento:** todas as páginas públicas saem com `noindex, nofollow`. Isso é provisório: a política de indexação definitiva entra na Fase 3.
- **Commits:** terminam com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Variável de ambiente ausente, vazia ou curta demais** (ex.: `PAYLOAD_SECRET` em branco): o app deve parar na inicialização com uma mensagem que nomeia a variável, em vez de subir com segredo vazio (o template faz `|| ''`). Coberto na Tarefa 3.
2. **R2 configurado pela metade, ou ausente na Vercel:** deve dar erro claro. Não pode cair silenciosamente no disco local, onde as imagens se perderiam no próximo deploy. Coberto na Tarefa 3.
3. **Upload de imagem acima de 4 MB:** deve recusar com mensagem em português que diga o limite. A Vercel corta requisições acima de ~4,5 MB com um erro genérico. Coberto na Tarefa 4.
4. **Upload de arquivo que não é imagem** (PDF, SVG, executável): deve ser recusado com mensagem clara. Coberto na Tarefa 4.
5. **Menu do celular operado pelo teclado:** Esc fecha e devolve o foco ao botão, e clicar num link fecha o menu. Coberto na Tarefa 6.

---

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `package.json`, `pnpm-lock.yaml` | Dependências e scripts |
| `.env.example` | Documentação de todas as variáveis de ambiente |
| `.gitignore` | Ignorados (inclui `.env`, `.superpowers/`, `/media`) |
| `README.md` | Como rodar o projeto |
| `next.config.ts` | Config do Next + `withPayload` (do template) |
| `vercel.json` | Região (São Paulo) e comando de build na Vercel |
| `postcss.config.mjs` | Plugin do Tailwind 4 |
| `vitest.config.mts` | Três projetos de teste: `unit`, `components`, `int` |
| `vitest.setup.ts` | Carrega `.env` nos testes |
| `playwright.config.ts` | Testes ponta a ponta |
| `.github/workflows/ci.yml` | CI |
| `src/payload.config.ts` | Config do Payload (banco, i18n, coleções, plugin R2) |
| `src/lib/env.ts` | Leitura e validação das variáveis de ambiente |
| `src/lib/media-url.ts` | Monta a URL pública de um arquivo no R2 |
| `src/collections/Users.ts` | Coleção de usuários do painel |
| `src/collections/Media.ts` | Coleção de mídia (upload, tamanhos, campos) |
| `src/collections/media-rules.ts` | Regras de upload: tamanho máximo, tipos permitidos, validação de `alt` |
| `src/migrations/*` | Migrações geradas pelo Payload |
| `src/payload-types.ts` | Tipos gerados pelo Payload |
| `src/design/tokens.ts` | Tokens de cor (fonte de verdade em TS) |
| `src/design/contrast.ts` | Cálculo de contraste WCAG |
| `src/design/fonts.ts` | Manrope e Inter via `next/font` |
| `src/app/(frontend)/globals.css` | Tailwind + `@theme` com os tokens + estilos base |
| `src/app/(frontend)/layout.tsx` | HTML raiz do site, fontes, cabeçalho, rodapé, metadados |
| `src/app/(frontend)/page.tsx` | Home provisória (slogan) |
| `src/config/navigation.ts` | Links do menu principal e do rodapé |
| `src/components/brand/Logo.tsx` | Logo provisório (SVG "D" + texto) |
| `src/components/layout/SiteHeader.tsx` | Cabeçalho |
| `src/components/layout/MobileMenu.tsx` | Menu do celular (componente cliente) |
| `src/components/layout/SiteFooter.tsx` | Rodapé |
| `tests/unit/*.test.ts` | Testes unitários (sem banco) |
| `tests/components/*.test.tsx` + `setup.tsx` | Testes de componentes (jsdom) |
| `tests/int/*.int.spec.ts` + `setup.ts` + `helpers/` | Testes de integração (banco de teste) |
| `tests/e2e/*.e2e.spec.ts` | Testes ponta a ponta (navegador) |

---

### Task 1: Contas e chaves externas (executada pelo responsável, com orientação)

**Files:** nenhum arquivo do repositório. Os valores obtidos aqui vão para o `.env` local na Tarefa 2 e para a Vercel na Tarefa 8.

**Interfaces:**
- Consumes: nada
- Produces: os valores abaixo, guardados num gerenciador de senhas ou bloco de notas seguro. **Nunca no git e nunca colados no chat.**
  - `NEON_DEV_URL`, `NEON_TEST_URL`, `NEON_MAIN_URL`: strings de conexão **diretas** (o host **não** contém `-pooler`), cada uma de um branch
  - `R2_ENDPOINT`: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
  - `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
  - Buckets `decicompra-media` (produção) e `decicompra-media-dev` (desenvolvimento/prévia), cada um com sua URL pública `https://pub-….r2.dev`
  - Conta no GitHub com um repositório **privado e vazio** `decicompra`
  - Conta na Vercel criada com login pelo GitHub

- [ ] **Step 1: Neon (banco de dados)**
  1. Crie a conta em https://neon.tech (login com GitHub serve).
  2. Crie o projeto `decicompra`, Postgres na versão padrão. Região: **AWS São Paulo (sa-east-1)**. Se não aparecer na lista, escolha **AWS US East (N. Virginia)**.
  3. O branch padrão `main` será o banco de **produção**.
  4. Em *Branches → New branch*, crie `dev` (a partir de `main`) e depois `test` (a partir de `main`).
  5. Para cada branch (`main`, `dev`, `test`), abra *Connect*, **desligue "Connection pooling"** e copie a string de conexão. Guarde como `NEON_MAIN_URL`, `NEON_DEV_URL` e `NEON_TEST_URL`.

  Esperado: três strings `postgresql://…@ep-….neon.tech/neondb?sslmode=require`, todas diferentes.

- [ ] **Step 2: Cloudflare R2 (imagens)**
  1. Crie a conta em https://dash.cloudflare.com e abra **R2 Object Storage**. A Cloudflare pede um cartão para ativar o R2 mesmo no plano gratuito (10 GB grátis).
  2. Crie o bucket `decicompra-media-dev`. Em *Settings → Public access → R2.dev subdomain*, clique em **Allow**. Guarde a URL `https://pub-….r2.dev` como URL pública **dev**.
  3. Repita para o bucket `decicompra-media` e guarde a URL pública **produção**.
  4. Em *R2 → Manage API tokens → Create API token*: permissão **Object Read & Write**, restrita aos **dois buckets**. Guarde `Access Key ID`, `Secret Access Key` e o endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.

  Observação: a URL `r2.dev` tem limite de requisições e serve só para desenvolvimento. No lançamento (spec §12.1) ela é trocada pelo domínio `img.decicompra.com.br`.

- [ ] **Step 3: GitHub**
  1. Use sua conta em https://github.com (ou crie uma).
  2. Crie o repositório **privado** `decicompra` **sem** README, sem .gitignore e sem licença (precisa estar vazio).

- [ ] **Step 4: Vercel**
  1. Crie a conta em https://vercel.com com **login pelo GitHub** (plano Hobby).
  2. Não importe nada ainda. Isso acontece na Tarefa 8.

- [ ] **Step 5: Confirmar com o agente**

  Responda ao agente: "Tarefa 1 concluída". Não envie valores. O agente segue para a Tarefa 2.

---

### Task 2: Projeto Next.js + Payload com banco Neon e migrações

**Files:**
- Create (via template): `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.json`, `.npmrc`, `.vscode/*`, `src/app/(payload)/**`, `src/payload-types.ts`
- Create: `.env.example`, `README.md`, `vitest.config.mts`, `vitest.setup.ts`, `tests/int/setup.ts`, `tests/int/helpers/getTestPayload.ts`, `tests/int/smoke.int.spec.ts`, `src/migrations/*`
- Modify: `.gitignore`, `src/payload.config.ts`, `src/collections/Users.ts`
- Delete (do template): `src/app/my-route/`, `src/app/(payload)/api/graphql/`, `src/app/(payload)/api/graphql-playground/`, `tests/e2e/*`, `tests/helpers/`, `tests/int/api.int.spec.ts`, `Dockerfile`, `docker-compose.yml`, `.yarnrc`, `test.env`

**Interfaces:**
- Consumes: as strings do Neon da Tarefa 1
- Produces:
  - `src/payload.config.ts`: export default da config do Payload. Os imports internos usam caminhos **relativos** (`./collections/…`), porque a CLI do Payload os carrega diretamente.
  - `getTestPayload(): Promise<Payload>` em `tests/int/helpers/getTestPayload.ts`. Conecta ao banco de teste e aplica as migrações (idempotente).
  - Scripts pnpm: `dev`, `build`, `build:vercel`, `start`, `lint`, `typecheck`, `test:unit`, `test:int`, `test:e2e`, `test`, `payload`, `generate:types`, `generate:importmap`
  - Projetos do Vitest: `unit` (`tests/unit/**/*.test.ts`, node), `components` (`tests/components/**/*.test.tsx`, jsdom), `int` (`tests/int/**/*.int.spec.ts`, node, banco de teste)

- [ ] **Step 1: Gerar o template numa pasta temporária e copiar para o repositório**

  O repositório já tem `docs/` e `.gitignore`, e o gerador exige uma pasta vazia.

  ```bash
  cd /c/Users/User/Documents/decicompra
  SCAFFOLD_DIR="$(mktemp -d)"
  (cd "$SCAFFOLD_DIR" && npx -y create-payload-app@3.90.2 -n decicompra -t blank --db postgres --db-connection-string "postgres://placeholder" --no-deps --no-agent)
  rm -rf "$SCAFFOLD_DIR/decicompra/.git"
  cp -rn "$SCAFFOLD_DIR/decicompra/." .
  rm -rf "$SCAFFOLD_DIR"
  rm -rf src/app/my-route "src/app/(payload)/api/graphql" "src/app/(payload)/api/graphql-playground" tests/e2e/* tests/helpers tests/int/api.int.spec.ts Dockerfile docker-compose.yml .yarnrc test.env
  ls
  ```
  Esperado: `docs/  eslint.config.mjs  next.config.ts  package.json  playwright.config.ts  README.md  src/  tests/  tsconfig.json  vitest.config.mts  vitest.setup.ts`, mais os arquivos ocultos.

- [ ] **Step 2: Substituir o `.gitignore`**

  ```gitignore
  # dependências
  /node_modules
  /.pnp
  .pnp.js

  # testes
  /coverage
  /test-results/
  /playwright-report/
  /blob-report/
  /playwright/.cache/

  # next.js
  /.next/
  /out/
  /build
  next-env.d.ts
  *.tsbuildinfo

  # ambiente (segredos)
  .env
  .env*.local

  # vercel
  .vercel

  # uploads locais (quando o R2 não está configurado)
  /media

  # wireframes do brainstorming
  .superpowers/

  # sistema
  .DS_Store
  *.pem
  npm-debug.log*
  ```

- [ ] **Step 3: Ajustar o `package.json`**

  Mude `"name"` para `"decicompra"` e `"description"` para `"DeciCompra: Compare. Entenda. Decida."`. Adicione `"packageManager": "pnpm@10.20.0"` e `"private": true`. Substitua o bloco `"scripts"` inteiro por:

  ```json
  "scripts": {
    "build": "cross-env NODE_OPTIONS=\"--no-deprecation --max-old-space-size=8000\" next build",
    "build:vercel": "pnpm payload migrate && pnpm build",
    "dev": "cross-env NODE_OPTIONS=--no-deprecation next dev",
    "generate:importmap": "cross-env NODE_OPTIONS=--no-deprecation payload generate:importmap",
    "generate:types": "cross-env NODE_OPTIONS=--no-deprecation payload generate:types",
    "lint": "cross-env NODE_OPTIONS=--no-deprecation eslint .",
    "payload": "cross-env NODE_OPTIONS=--no-deprecation payload",
    "start": "cross-env NODE_OPTIONS=--no-deprecation next start",
    "typecheck": "tsc --noEmit",
    "test": "pnpm test:unit && pnpm test:int && pnpm test:e2e",
    "test:unit": "cross-env NODE_OPTIONS=--no-deprecation vitest run --project unit --project components",
    "test:int": "cross-env NODE_OPTIONS=--no-deprecation vitest run --project int",
    "test:e2e": "cross-env NODE_OPTIONS=\"--no-deprecation --import=tsx/esm\" playwright test"
  },
  ```

- [ ] **Step 4: Instalar dependências**

  ```bash
  pnpm install
  pnpm add @payloadcms/translations@3.90.2
  pnpm add -D @eslint/eslintrc @testing-library/dom
  ```
  Esperado: termina sem erros. Avisos de peer dependency são aceitáveis.

- [ ] **Step 5: Criar `.env.example` e o `.env` local**

  `.env.example`:
  ```dotenv
  # Banco (Neon). Use a string de conexão DIRETA (host sem "-pooler").
  # Local e prévias da Vercel: branch "dev". Produção (só na Vercel): branch "main".
  DATABASE_URL=postgresql://usuario:senha@ep-exemplo.sa-east-1.aws.neon.tech/neondb?sslmode=require

  # Banco dos testes de integração: branch "test" do Neon. Os testes criam e apagam dados nele.
  TEST_DATABASE_URL=postgresql://usuario:senha@ep-exemplo-test.sa-east-1.aws.neon.tech/neondb?sslmode=require

  # Segredo do Payload: no mínimo 32 caracteres aleatórios. Gere com:
  # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  PAYLOAD_SECRET=

  # Cloudflare R2. Local: opcional (deixe TODAS vazias para salvar imagens em ./media).
  # Na Vercel: obrigatórias. Preencha todas ou nenhuma.
  R2_BUCKET=
  R2_ENDPOINT=
  R2_ACCESS_KEY_ID=
  R2_SECRET_ACCESS_KEY=
  R2_PUBLIC_URL=
  ```

  **Responsável:** copie para `.env` (`cp .env.example .env`) e preencha:
  - `DATABASE_URL` = `NEON_DEV_URL`
  - `TEST_DATABASE_URL` = `NEON_TEST_URL`
  - `PAYLOAD_SECRET` = saída do comando `node -e …`
  - As variáveis R2 ficam **vazias** por enquanto (Tarefa 4)

  O agente pode gerar o segredo e escrever o `.env`, mas as URLs do Neon o responsável cola direto no arquivo.

- [ ] **Step 6: Configurar o Payload (`src/payload.config.ts`)**

  ```ts
  import { postgresAdapter } from '@payloadcms/db-postgres'
  import { lexicalEditor } from '@payloadcms/richtext-lexical'
  import { pt } from '@payloadcms/translations/languages/pt'
  import path from 'path'
  import { buildConfig } from 'payload'
  import sharp from 'sharp'
  import { fileURLToPath } from 'url'

  import { Media } from './collections/Media'
  import { Users } from './collections/Users'

  const filename = fileURLToPath(import.meta.url)
  const dirname = path.dirname(filename)

  export default buildConfig({
    admin: {
      user: Users.slug,
      importMap: { baseDir: path.resolve(dirname) },
      meta: { titleSuffix: ' · DeciCompra' },
    },
    collections: [Users, Media],
    editor: lexicalEditor(),
    graphQL: { disable: true },
    i18n: { fallbackLanguage: 'pt', supportedLanguages: { pt } },
    secret: process.env.PAYLOAD_SECRET || '',
    typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
    db: postgresAdapter({
      pool: { connectionString: process.env.DATABASE_URL || '' },
      push: false,
      migrationDir: path.resolve(dirname, 'migrations'),
    }),
    sharp,
  })
  ```
  O `|| ''` é temporário. A Tarefa 3 o substitui pela validação.

- [ ] **Step 7: Usuários com nome e bloqueio de login (`src/collections/Users.ts`)**

  ```ts
  import type { CollectionConfig } from 'payload'

  export const Users: CollectionConfig = {
    slug: 'users',
    labels: { singular: 'Usuário', plural: 'Usuários' },
    admin: { useAsTitle: 'name', defaultColumns: ['name', 'email'] },
    auth: { maxLoginAttempts: 5, lockTime: 15 * 60 * 1000 },
    fields: [{ name: 'name', label: 'Nome', type: 'text', required: true }],
  }
  ```

- [ ] **Step 8: Configurar o Vitest em três projetos**

  `vitest.config.mts`:
  ```ts
  import react from '@vitejs/plugin-react'
  import tsconfigPaths from 'vite-tsconfig-paths'
  import { defineConfig } from 'vitest/config'

  export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
      passWithNoTests: true,
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            environment: 'node',
            include: ['tests/unit/**/*.test.ts'],
            setupFiles: ['./vitest.setup.ts'],
          },
        },
        {
          extends: true,
          test: {
            name: 'components',
            environment: 'jsdom',
            include: ['tests/components/**/*.test.tsx'],
            setupFiles: ['./vitest.setup.ts', './tests/components/setup.tsx'],
          },
        },
        {
          extends: true,
          test: {
            name: 'int',
            environment: 'node',
            include: ['tests/int/**/*.int.spec.ts'],
            setupFiles: ['./vitest.setup.ts', './tests/int/setup.ts'],
            fileParallelism: false,
            testTimeout: 60_000,
            hookTimeout: 120_000,
          },
        },
      ],
    },
  })
  ```

  `vitest.setup.ts`:
  ```ts
  // Carrega o .env para todos os projetos de teste
  import 'dotenv/config'
  ```

  `tests/components/setup.tsx` (criado agora para o projeto `components` não quebrar; ganha conteúdo na Tarefa 6):
  ```tsx
  import { cleanup } from '@testing-library/react'
  import { afterEach } from 'vitest'

  afterEach(() => cleanup())
  ```

  `tests/int/setup.ts`:
  ```ts
  // Testes de integração usam SEMPRE o banco de teste e NUNCA o R2
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error(
      'Defina TEST_DATABASE_URL no .env (branch "test" do Neon) para rodar os testes de integração.',
    )
  }
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
  for (const key of ['R2_BUCKET', 'R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_PUBLIC_URL']) {
    delete process.env[key]
  }
  ```

  `tests/int/helpers/getTestPayload.ts`:
  ```ts
  import config from '@payload-config'
  import { getPayload, type Payload } from 'payload'

  let cached: Promise<Payload> | null = null

  // Conecta ao banco de teste e aplica as migrações pendentes (idempotente)
  export function getTestPayload(): Promise<Payload> {
    cached ??= (async () => {
      const payload = await getPayload({ config: await config })
      await payload.db.migrate()
      return payload
    })()
    return cached
  }
  ```

- [ ] **Step 9: Escrever o teste de fumaça (deve falhar: ainda não há migração)**

  `tests/int/smoke.int.spec.ts`:
  ```ts
  import { describe, expect, it } from 'vitest'

  import { getTestPayload } from './helpers/getTestPayload'

  describe('Payload', () => {
    it('conecta ao banco de teste e consulta usuários', async () => {
      const payload = await getTestPayload()
      const result = await payload.find({ collection: 'users', limit: 1 })
      expect(result.totalDocs).toBeGreaterThanOrEqual(0)
    })

    it('mantém o GraphQL desativado', async () => {
      const payload = await getTestPayload()
      expect(payload.config.graphQL.disable).toBe(true)
    })
  })
  ```

  Run: `pnpm test:int`
  Expected: FAIL. A consulta a `users` dá erro do tipo `relation "users" does not exist`, porque ainda não existe migração.

- [ ] **Step 10: Criar a migração inicial e aplicar no banco `dev`**

  ```bash
  pnpm generate:types
  pnpm payload migrate:create initial
  pnpm payload migrate
  ```
  Esperado:
  - É criado `src/migrations/<data>_initial.ts`, `.json` e `index.ts`
  - `migrate` termina com "Done" (ou "Migrated")
  - `src/payload-types.ts` passa a conter `name: string` em `User`

- [ ] **Step 11: Rodar o teste de fumaça de novo**

  Run: `pnpm test:int`
  Expected: PASS (2 testes). O helper aplica as migrações no banco de teste.

- [ ] **Step 12: Verificar o painel no navegador**

  Run: `pnpm dev` e abra http://localhost:3000/admin.

  Esperado: a tela "Criar primeiro usuário" **em português**, com o campo Nome.

  **Responsável:** crie seu usuário administrador no banco `dev` com uma senha forte. Faça login e confirme o menu em português. Pare o servidor com Ctrl+C.

- [ ] **Step 13: Lint, tipos e README**

  `README.md`:
  ````markdown
  # DeciCompra

  Compare. Entenda. Decida. Portal de comparação, análise e recomendação de produtos.

  Especificação: `docs/superpowers/specs/2026-10-03-decicompra-design.md`

  ## Rodar localmente

  1. `pnpm install`
  2. Copie `.env.example` para `.env` e preencha (veja os comentários no arquivo)
  3. `pnpm payload migrate`
  4. `pnpm dev`: site em http://localhost:3000 e painel em http://localhost:3000/admin

  ## Mudou uma coleção do Payload?

  ```bash
  pnpm generate:types
  pnpm payload migrate:create nome-da-mudanca
  pnpm payload migrate
  ```
  Faça o commit da migração junto com a mudança.

  ## Testes

  - `pnpm test:unit`: unitários e de componentes
  - `pnpm test:int`: integração (usa `TEST_DATABASE_URL`)
  - `pnpm test:e2e`: navegador (Playwright)
  ````

  Run: `pnpm lint && pnpm typecheck`
  Expected: sem erros (avisos são aceitáveis).

- [ ] **Step 14: Commit**

  ```bash
  git add -A
  git status --short   # confirme que .env NÃO aparece
  git commit -m "feat: projeto Next.js + Payload com Neon, migrações e painel em português" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 3: Validação das variáveis de ambiente

**Files:**
- Create: `src/lib/env.ts`, `tests/unit/env.test.ts`
- Modify: `src/payload.config.ts`

**Interfaces:**
- Consumes: `src/payload.config.ts` da Tarefa 2
- Produces (em `src/lib/env.ts`):
  ```ts
  export type R2Config = { bucket: string; endpoint: string; accessKeyId: string; secretAccessKey: string; publicUrl: string }
  export type AppEnv = { databaseUrl: string; payloadSecret: string; r2: R2Config | null }
  export function readEnv(source?: Record<string, string | undefined>): AppEnv
  ```
  `publicUrl` sai sem barra final. Na Tarefa 4, `payload.config.ts` usa `env.r2`.

- [ ] **Step 1: Escrever os testes**

  `tests/unit/env.test.ts`:
  ```ts
  import { describe, expect, it } from 'vitest'

  import { readEnv } from '@/lib/env'

  const SECRET = 'a'.repeat(64)
  const base = { DATABASE_URL: 'postgresql://u:p@host/db', PAYLOAD_SECRET: SECRET }
  const r2 = {
    R2_BUCKET: 'decicompra-media-dev',
    R2_ENDPOINT: 'https://abc.r2.cloudflarestorage.com',
    R2_ACCESS_KEY_ID: 'key',
    R2_SECRET_ACCESS_KEY: 'secret',
    R2_PUBLIC_URL: 'https://pub-123.r2.dev/',
  }

  describe('readEnv', () => {
    it('lê banco e segredo e deixa o R2 nulo quando nenhuma variável R2 existe', () => {
      expect(readEnv(base)).toEqual({ databaseUrl: base.DATABASE_URL, payloadSecret: SECRET, r2: null })
    })

    it('trata variáveis R2 vazias ou só com espaços como ausentes', () => {
      const blanks = Object.fromEntries(Object.keys(r2).map((k) => [k, '  ']))
      expect(readEnv({ ...base, ...blanks }).r2).toBeNull()
    })

    it('lê o R2 completo e remove a barra final da URL pública', () => {
      expect(readEnv({ ...base, ...r2 }).r2).toEqual({
        bucket: 'decicompra-media-dev',
        endpoint: 'https://abc.r2.cloudflarestorage.com',
        accessKeyId: 'key',
        secretAccessKey: 'secret',
        publicUrl: 'https://pub-123.r2.dev',
      })
    })

    it.each(['DATABASE_URL', 'PAYLOAD_SECRET'])('falha nomeando %s quando ausente', (key) => {
      const source: Record<string, string | undefined> = { ...base }
      delete source[key]
      expect(() => readEnv(source)).toThrow(`Variável de ambiente obrigatória ausente: ${key}`)
    })

    it('falha quando DATABASE_URL está em branco', () => {
      expect(() => readEnv({ ...base, DATABASE_URL: '   ' })).toThrow('DATABASE_URL')
    })

    it('falha quando PAYLOAD_SECRET tem menos de 32 caracteres', () => {
      expect(() => readEnv({ ...base, PAYLOAD_SECRET: 'curto' })).toThrow(
        'PAYLOAD_SECRET precisa ter pelo menos 32 caracteres',
      )
    })

    it('falha listando as variáveis que faltam quando o R2 está configurado pela metade', () => {
      const partial = { ...base, R2_BUCKET: r2.R2_BUCKET, R2_ENDPOINT: r2.R2_ENDPOINT }
      expect(() => readEnv(partial)).toThrow(
        'Configuração do R2 incompleta. Faltando: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL.',
      )
    })

    it('exige o R2 quando roda na Vercel', () => {
      expect(() => readEnv({ ...base, VERCEL: '1' })).toThrow('Na Vercel, as variáveis R2_* são obrigatórias')
    })

    it('aceita a Vercel quando o R2 está completo', () => {
      expect(readEnv({ ...base, ...r2, VERCEL: '1' }).r2?.bucket).toBe('decicompra-media-dev')
    })
  })
  ```

- [ ] **Step 2: Rodar e ver falhar**

  Run: `pnpm test:unit`
  Expected: FAIL com `Failed to resolve import "@/lib/env"`.

- [ ] **Step 3: Implementar `src/lib/env.ts`**

  ```ts
  export type R2Config = {
    bucket: string
    endpoint: string
    accessKeyId: string
    secretAccessKey: string
    publicUrl: string
  }

  export type AppEnv = {
    databaseUrl: string
    payloadSecret: string
    r2: R2Config | null
  }

  type EnvSource = Record<string, string | undefined>

  const MIN_SECRET_LENGTH = 32

  const R2_KEYS: Record<keyof R2Config, string> = {
    bucket: 'R2_BUCKET',
    endpoint: 'R2_ENDPOINT',
    accessKeyId: 'R2_ACCESS_KEY_ID',
    secretAccessKey: 'R2_SECRET_ACCESS_KEY',
    publicUrl: 'R2_PUBLIC_URL',
  }

  function read(source: EnvSource, key: string): string | undefined {
    const value = source[key]?.trim()
    return value ? value : undefined
  }

  function required(source: EnvSource, key: string): string {
    const value = read(source, key)
    if (!value) {
      throw new Error(`Variável de ambiente obrigatória ausente: ${key}. Veja o arquivo .env.example.`)
    }
    return value
  }

  function readR2(source: EnvSource): R2Config | null {
    const fields = Object.keys(R2_KEYS) as (keyof R2Config)[]
    const values = fields.map((field) => [field, read(source, R2_KEYS[field])] as const)
    const missing = values.filter(([, value]) => !value).map(([field]) => R2_KEYS[field])

    if (missing.length === fields.length) return null
    if (missing.length > 0) {
      throw new Error(`Configuração do R2 incompleta. Faltando: ${missing.join(', ')}.`)
    }

    const config = Object.fromEntries(values) as R2Config
    return { ...config, publicUrl: config.publicUrl.replace(/\/+$/, '') }
  }

  // Lê e valida a configuração do ambiente; falha cedo com mensagem clara
  export function readEnv(source: EnvSource = process.env): AppEnv {
    const databaseUrl = required(source, 'DATABASE_URL')
    const payloadSecret = required(source, 'PAYLOAD_SECRET')
    if (payloadSecret.length < MIN_SECRET_LENGTH) {
      throw new Error(`PAYLOAD_SECRET precisa ter pelo menos ${MIN_SECRET_LENGTH} caracteres.`)
    }

    const r2 = readR2(source)
    if (!r2 && source.VERCEL === '1') {
      throw new Error(
        'Na Vercel, as variáveis R2_* são obrigatórias: o disco do servidor é temporário e as imagens enviadas seriam perdidas.',
      )
    }

    return { databaseUrl, payloadSecret, r2 }
  }
  ```

- [ ] **Step 4: Rodar e ver passar**

  Run: `pnpm test:unit`
  Expected: PASS (10 testes em `env.test.ts`).

- [ ] **Step 5: Usar `readEnv` na config do Payload**

  Em `src/payload.config.ts`, adicione o import junto aos outros imports locais:
  ```ts
  import { readEnv } from './lib/env'
  ```
  Logo após a linha `const dirname = path.dirname(filename)`:
  ```ts
  const env = readEnv()
  ```
  E troque as duas leituras diretas:
  ```ts
    secret: env.payloadSecret,
  ```
  ```ts
      pool: { connectionString: env.databaseUrl },
  ```

- [ ] **Step 6: Verificar que nada quebrou e que a falha é clara**

  Run: `pnpm test:int`
  Expected: PASS.

  Run: `PAYLOAD_SECRET= pnpm payload migrate:status`
  Expected: o comando falha mostrando `Variável de ambiente obrigatória ausente: PAYLOAD_SECRET`. Uma variável vazia no ambiente tem prioridade sobre o `.env`, porque o dotenv não sobrescreve.

- [ ] **Step 7: Commit**

  ```bash
  git add src/lib/env.ts tests/unit/env.test.ts src/payload.config.ts
  git commit -m "feat: valida variáveis de ambiente na inicialização" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 4: Mídia com versões WebP e armazenamento no Cloudflare R2

**Files:**
- Create: `src/lib/media-url.ts`, `src/collections/media-rules.ts`, `tests/unit/media-url.test.ts`, `tests/unit/media-rules.test.ts`, `tests/int/media.int.spec.ts`, `src/migrations/<data>_media_r2.*`
- Modify: `src/collections/Media.ts`, `src/payload.config.ts`, `src/payload-types.ts` (gerado), `src/app/(payload)/admin/importMap.js` (gerado), `package.json` (dependência)

**Interfaces:**
- Consumes: `readEnv()` / `AppEnv['r2']` da Tarefa 3, `getTestPayload()` da Tarefa 2
- Produces:
  - `buildMediaURL(publicUrl: string, prefix: string | undefined, filename: string): string` em `src/lib/media-url.ts`
  - Em `src/collections/media-rules.ts`:
    - `MAX_UPLOAD_BYTES = 4 * 1024 * 1024`
    - `ALLOWED_IMAGE_TYPES: string[]`
    - `assertUploadSize(size?: number): void`
    - `assertImageType(mimetype?: string): void`
    - `validateAlt: TextFieldSingleValidation`
    - `rejectInvalidUpload: CollectionBeforeOperationHook`
  - Coleção `media` com os campos `alt` e `credit`. Tamanhos: `thumb` (320), `card` (640), `large` (1280), todos `image/webp`.

- [ ] **Step 1: Testes da URL pública**

  `tests/unit/media-url.test.ts`:
  ```ts
  import { describe, expect, it } from 'vitest'

  import { buildMediaURL } from '@/lib/media-url'

  describe('buildMediaURL', () => {
    it('junta URL pública, prefixo e nome do arquivo', () => {
      expect(buildMediaURL('https://pub-1.r2.dev', 'media', 'tv.webp')).toBe('https://pub-1.r2.dev/media/tv.webp')
    })

    it('ignora barras finais na URL pública', () => {
      expect(buildMediaURL('https://pub-1.r2.dev//', 'media', 'tv.webp')).toBe('https://pub-1.r2.dev/media/tv.webp')
    })

    it('codifica espaços e acentos no nome do arquivo', () => {
      expect(buildMediaURL('https://pub-1.r2.dev', 'media', 'tv lg ç.webp')).toBe(
        'https://pub-1.r2.dev/media/tv%20lg%20%C3%A7.webp',
      )
    })

    it('funciona sem prefixo', () => {
      expect(buildMediaURL('https://pub-1.r2.dev', undefined, 'tv.webp')).toBe('https://pub-1.r2.dev/tv.webp')
    })
  })
  ```

- [ ] **Step 2: Testes das regras de upload**

  `tests/unit/media-rules.test.ts`:
  ```ts
  import { APIError } from 'payload'
  import { describe, expect, it } from 'vitest'

  import { assertImageType, assertUploadSize, MAX_UPLOAD_BYTES, validateAlt } from '@/collections/media-rules'

  describe('assertUploadSize', () => {
    it('aceita arquivo no limite', () => {
      expect(() => assertUploadSize(MAX_UPLOAD_BYTES)).not.toThrow()
    })

    it('aceita operação sem arquivo', () => {
      expect(() => assertUploadSize(undefined)).not.toThrow()
    })

    it('recusa acima de 4 MB com status 413 e mensagem em português', () => {
      try {
        assertUploadSize(MAX_UPLOAD_BYTES + 1)
        expect.unreachable()
      } catch (error) {
        expect(error).toBeInstanceOf(APIError)
        expect((error as APIError).status).toBe(413)
        expect((error as APIError).message).toContain('4 MB')
      }
    })
  })

  describe('assertImageType', () => {
    it.each(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])('aceita %s', (type) => {
      expect(() => assertImageType(type)).not.toThrow()
    })

    it('aceita operação sem arquivo', () => {
      expect(() => assertImageType(undefined)).not.toThrow()
    })

    it.each(['application/pdf', 'image/svg+xml', 'application/x-msdownload'])('recusa %s com status 415', (type) => {
      try {
        assertImageType(type)
        expect.unreachable()
      } catch (error) {
        expect(error).toBeInstanceOf(APIError)
        expect((error as APIError).status).toBe(415)
        expect((error as APIError).message).toContain('JPG, PNG, WebP ou AVIF')
      }
    })
  })

  describe('validateAlt', () => {
    const call = (value: string | null | undefined) =>
      (validateAlt as (v: typeof value) => true | string)(value)

    it('aceita texto descritivo', () => {
      expect(call('Smart TV LG C4 de 55 polegadas')).toBe(true)
    })

    it.each([undefined, null, '', '   '])('recusa %j', (value) => {
      expect(call(value)).toBe('Descreva a imagem: o texto alternativo é obrigatório.')
    })
  })
  ```

- [ ] **Step 3: Rodar e ver falhar**

  Run: `pnpm test:unit`
  Expected: FAIL. Os imports `@/lib/media-url` e `@/collections/media-rules` não existem.

- [ ] **Step 4: Implementar `src/lib/media-url.ts`**

  ```ts
  // URL pública de um arquivo no R2: <publicUrl>/<prefixo>/<arquivo>, com cada trecho codificado
  export function buildMediaURL(publicUrl: string, prefix: string | undefined, filename: string): string {
    const base = publicUrl.replace(/\/+$/, '')
    const segments = [...(prefix ? prefix.split('/') : []), filename]
      .filter((segment) => segment.length > 0)
      .map(encodeURIComponent)
    return `${base}/${segments.join('/')}`
  }
  ```

- [ ] **Step 5: Implementar `src/collections/media-rules.ts`**

  ```ts
  import { APIError } from 'payload'
  import type { CollectionBeforeOperationHook, TextFieldSingleValidation } from 'payload'

  // A Vercel recusa requisições acima de ~4,5 MB; 4 MB deixa margem e dá mensagem clara
  export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

  export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

  export function assertUploadSize(size: number | undefined): void {
    if (size !== undefined && size > MAX_UPLOAD_BYTES) {
      throw new APIError('A imagem tem mais de 4 MB. Reduza o tamanho antes de enviar.', 413, undefined, true)
    }
  }

  export function assertImageType(mimetype: string | undefined): void {
    if (mimetype !== undefined && !ALLOWED_IMAGE_TYPES.includes(mimetype)) {
      throw new APIError('Envie uma imagem JPG, PNG, WebP ou AVIF.', 415, undefined, true)
    }
  }

  export const rejectInvalidUpload: CollectionBeforeOperationHook = ({ args, req }) => {
    assertUploadSize(req.file?.size)
    assertImageType(req.file?.mimetype)
    return args
  }

  export const validateAlt: TextFieldSingleValidation = (value) =>
    typeof value === 'string' && value.trim().length > 0
      ? true
      : 'Descreva a imagem: o texto alternativo é obrigatório.'
  ```

- [ ] **Step 6: Rodar os testes unitários**

  Run: `pnpm test:unit`
  Expected: PASS (env + media-url + media-rules).

- [ ] **Step 7: Teste de integração da coleção de mídia**

  `tests/int/media.int.spec.ts`:
  ```ts
  import { APIError, ValidationError } from 'payload'
  import sharp from 'sharp'
  import { afterAll, describe, expect, it } from 'vitest'

  import { MAX_UPLOAD_BYTES } from '@/collections/media-rules'

  import { getTestPayload } from './helpers/getTestPayload'

  const createdIds: (number | string)[] = []

  async function pngFile(width: number, height: number, name: string) {
    const data = await sharp({ create: { width, height, channels: 3, background: '#2563EB' } }).png().toBuffer()
    return { data, mimetype: 'image/png', name, size: data.length }
  }

  afterAll(async () => {
    const payload = await getTestPayload()
    for (const id of createdIds) await payload.delete({ collection: 'media', id })
  })

  describe('Mídia', () => {
    it('gera as versões WebP de 320, 640 e 1280 px', async () => {
      const payload = await getTestPayload()
      const doc = await payload.create({
        collection: 'media',
        data: { alt: 'Retângulo azul de teste', credit: 'Teste automatizado' },
        file: await pngFile(1600, 1000, 'teste-tamanhos.png'),
      })
      createdIds.push(doc.id)

      expect(doc.sizes?.thumb).toMatchObject({ width: 320, mimeType: 'image/webp' })
      expect(doc.sizes?.card).toMatchObject({ width: 640, mimeType: 'image/webp' })
      expect(doc.sizes?.large).toMatchObject({ width: 1280, mimeType: 'image/webp' })
    })

    it('recusa texto alternativo só com espaços', async () => {
      const payload = await getTestPayload()
      const error = await payload
        .create({
          collection: 'media',
          data: { alt: '   ', credit: 'Teste' },
          file: await pngFile(400, 300, 'teste-alt.png'),
        })
        .catch((e: unknown) => e)

      expect(error).toBeInstanceOf(ValidationError)
      expect(JSON.stringify((error as ValidationError).data)).toContain('texto alternativo é obrigatório')
    })

    it('recusa arquivo acima de 4 MB', async () => {
      const payload = await getTestPayload()
      const size = MAX_UPLOAD_BYTES + 1
      const error = await payload
        .create({
          collection: 'media',
          data: { alt: 'Grande demais', credit: 'Teste' },
          file: { data: Buffer.alloc(size), mimetype: 'image/png', name: 'grande.png', size },
        })
        .catch((e: unknown) => e)

      expect(error).toBeInstanceOf(APIError)
      expect((error as APIError).status).toBe(413)
    })

    it('recusa PDF', async () => {
      const payload = await getTestPayload()
      const data = Buffer.from('%PDF-1.4 teste')
      const error = await payload
        .create({
          collection: 'media',
          data: { alt: 'Documento', credit: 'Teste' },
          file: { data, mimetype: 'application/pdf', name: 'doc.pdf', size: data.length },
        })
        .catch((e: unknown) => e)

      expect(error).toBeInstanceOf(APIError)
      expect((error as APIError).status).toBe(415)
    })
  })
  ```

  Run: `pnpm test:int`
  Expected: FAIL. O campo `credit` não existe, e os tamanhos e as regras ainda não foram configurados.

- [ ] **Step 8: Configurar a coleção `src/collections/Media.ts`**

  ```ts
  import type { CollectionConfig } from 'payload'

  import { ALLOWED_IMAGE_TYPES, rejectInvalidUpload, validateAlt } from './media-rules'

  const webp = { format: 'webp' as const, options: { quality: 80 } }

  export const Media: CollectionConfig = {
    slug: 'media',
    labels: { singular: 'Mídia', plural: 'Mídia' },
    access: { read: () => true },
    hooks: { beforeOperation: [rejectInvalidUpload] },
    fields: [
      {
        name: 'alt',
        label: 'Texto alternativo',
        type: 'text',
        required: true,
        validate: validateAlt,
        admin: { description: 'Descreva a imagem para quem não pode vê-la (acessibilidade e SEO).' },
      },
      {
        name: 'credit',
        label: 'Crédito / fonte',
        type: 'text',
        required: true,
        admin: { description: 'Ex.: "Divulgação LG". Use só imagens oficiais de imprensa ou com permissão.' },
      },
    ],
    upload: {
      mimeTypes: ALLOWED_IMAGE_TYPES,
      imageSizes: [
        { name: 'thumb', width: 320, formatOptions: webp },
        { name: 'card', width: 640, formatOptions: webp },
        { name: 'large', width: 1280, formatOptions: webp },
      ],
    },
  }
  ```

- [ ] **Step 9: Instalar o plugin e ligar o R2 em `src/payload.config.ts`**

  ```bash
  pnpm add @payloadcms/storage-s3@3.90.2
  ```

  Em `src/payload.config.ts`, adicione os imports:
  ```ts
  import { s3Storage } from '@payloadcms/storage-s3'
  ```
  ```ts
  import { buildMediaURL } from './lib/media-url'
  ```
  E adicione, depois de `sharp,`:
  ```ts
    plugins: [
      s3Storage({
        // Sem R2 configurado (local/CI), as imagens vão para ./media. Na Vercel o R2 é obrigatório (readEnv).
        enabled: env.r2 !== null,
        // Mantém o mesmo esquema de banco com ou sem R2, para as migrações serem iguais em todo ambiente
        alwaysInsertFields: true,
        bucket: env.r2?.bucket ?? '',
        collections: {
          media: {
            prefix: 'media',
            disablePayloadAccessControl: true,
            generateFileURL: ({ filename, prefix }) => buildMediaURL(env.r2?.publicUrl ?? '', prefix, filename),
          },
        },
        config: {
          endpoint: env.r2?.endpoint,
          region: 'auto',
          forcePathStyle: true,
          credentials: {
            accessKeyId: env.r2?.accessKeyId ?? '',
            secretAccessKey: env.r2?.secretAccessKey ?? '',
          },
        },
      }),
    ],
  ```

- [ ] **Step 10: Gerar tipos, mapa de importação e migração**

  ```bash
  pnpm generate:types
  pnpm generate:importmap
  pnpm payload migrate:create media_r2
  pnpm payload migrate
  ```
  Esperado: nova migração em `src/migrations/` (colunas `credit`, `prefix` e as de `sizes_*`). `migrate` conclui no banco `dev`.

- [ ] **Step 11: Rodar todos os testes**

  Run: `pnpm test:unit && pnpm test:int`
  Expected: PASS (unitários + 2 de fumaça + 4 de mídia).

- [ ] **Step 12: Verificar o upload real para o R2 (bucket dev)**

  **Responsável:** no `.env`, preencha as 5 variáveis `R2_*` com:
  - bucket `decicompra-media-dev`
  - endpoint, chave e segredo da Tarefa 1
  - URL pública **dev**

  Run: `pnpm dev`, abra http://localhost:3000/admin → Mídia → Criar. Envie uma foto qualquer (JPG < 4 MB) com texto alternativo e crédito.

  Esperado:
  - A URL do documento começa com a URL pública dev (`https://pub-….r2.dev/media/…`) e abre a imagem no navegador
  - No painel da Cloudflare, o bucket `decicompra-media-dev` mostra o original e três arquivos `.webp`

  Depois, apague o documento de teste no painel e confirme que os arquivos somem do bucket.

- [ ] **Step 13: Commit**

  ```bash
  git add -A
  git status --short   # confirme que .env e /media NÃO aparecem
  git commit -m "feat: coleção de mídia com versões WebP, regras de upload e armazenamento no R2" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 5: Tokens de design, Tailwind e fontes

**Files:**
- Create: `src/design/tokens.ts`, `src/design/contrast.ts`, `src/design/fonts.ts`, `src/app/(frontend)/globals.css`, `postcss.config.mjs`, `tests/unit/design-tokens.test.ts`
- Modify: `src/app/(frontend)/layout.tsx`, `package.json` (dependências)
- Delete: `src/app/(frontend)/styles.css`

**Interfaces:**
- Consumes: nada de tarefas anteriores
- Produces:
  - `colors` (objeto `as const`, chaves = nomes dos tokens) e `type ColorToken` em `src/design/tokens.ts`
  - `contrastRatio(foreground: string, background: string): number` em `src/design/contrast.ts`
  - `manrope` e `inter` (objetos do `next/font` com `.variable`) em `src/design/fonts.ts`
  - **Classes Tailwind disponíveis para as próximas tarefas:**
    - cores: `bg-azul-profundo`, `text-branco`, `text-verde`, `text-texto-suave`, `bg-cinza-claro` etc.
    - fontes: `font-display` (Manrope) e `font-sans` (Inter, padrão)

- [ ] **Step 1: Escrever os testes de tokens e contraste**

  `tests/unit/design-tokens.test.ts`:
  ```ts
  import { readFileSync } from 'node:fs'
  import path from 'node:path'
  import { describe, expect, it } from 'vitest'

  import { contrastRatio } from '@/design/contrast'
  import { colors, type ColorToken } from '@/design/tokens'

  describe('contrastRatio', () => {
    it('preto sobre branco = 21', () => {
      expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
    })

    it('mesma cor = 1', () => {
      expect(contrastRatio('#2563EB', '#2563EB')).toBeCloseTo(1, 5)
    })

    it('aceita hexadecimal minúsculo e é simétrico', () => {
      expect(contrastRatio('#172554', '#ffffff')).toBeCloseTo(contrastRatio('#FFFFFF', '#172554'), 5)
    })
  })

  describe('tokens de cor (spec §7.1)', () => {
    const textPairs: [ColorToken, ColorToken][] = [
      ['texto', 'branco'],
      ['texto-suave', 'branco'],
      ['texto-suave', 'cinza-claro'],
      ['branco', 'azul-profundo'],
      ['branco', 'azul-eletrico'],
      ['azul-eletrico', 'branco'],
      ['branco', 'verde-texto'],
      ['verde-texto', 'branco'],
      ['negativo', 'branco'],
    ]

    it.each(textPairs)('%s sobre %s atinge AA para texto normal (4,5:1)', (fg, bg) => {
      expect(contrastRatio(colors[fg], colors[bg])).toBeGreaterThanOrEqual(4.5)
    })

    it('verde (#16A34A) com texto branco NÃO atinge 4,5:1, e por isso existe o verde-texto', () => {
      expect(contrastRatio(colors.branco, colors.verde)).toBeLessThan(4.5)
    })

    it('verde sobre azul-profundo atinge AA para texto grande (3:1), como no "Decida." da home', () => {
      expect(contrastRatio(colors.verde, colors['azul-profundo'])).toBeGreaterThanOrEqual(3)
    })

    it('globals.css declara exatamente os mesmos valores do tokens.ts', () => {
      const css = readFileSync(path.resolve(process.cwd(), 'src/app/(frontend)/globals.css'), 'utf8').toLowerCase()
      for (const [name, hex] of Object.entries(colors)) {
        expect(css).toContain(`--color-${name}: ${hex.toLowerCase()};`)
      }
    })
  })
  ```

- [ ] **Step 2: Rodar e ver falhar**

  Run: `pnpm test:unit`
  Expected: FAIL com `Failed to resolve import "@/design/contrast"`.

- [ ] **Step 3: Implementar `src/design/tokens.ts` e `src/design/contrast.ts`**

  `src/design/tokens.ts`:
  ```ts
  // Fonte de verdade das cores (spec §7.1). O globals.css repete estes valores; um teste garante a paridade.
  export const colors = {
    'azul-profundo': '#172554',
    'azul-eletrico': '#2563EB',
    verde: '#16A34A',
    'verde-texto': '#15803D',
    'cinza-claro': '#F1F5F9',
    branco: '#FFFFFF',
    texto: '#0F172A',
    'texto-suave': '#475569',
    negativo: '#DC2626',
  } as const

  export type ColorToken = keyof typeof colors
  ```

  `src/design/contrast.ts`:
  ```ts
  // Contraste WCAG 2.x entre duas cores hexadecimais (#RRGGBB)
  function channel(value: number): number {
    const c = value / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }

  function luminance(hex: string): number {
    const n = Number.parseInt(hex.replace('#', ''), 16)
    const r = channel((n >> 16) & 0xff)
    const g = channel((n >> 8) & 0xff)
    const b = channel(n & 0xff)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  export function contrastRatio(foreground: string, background: string): number {
    const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
    return (light + 0.05) / (dark + 0.05)
  }
  ```

- [ ] **Step 4: Instalar o Tailwind e criar o CSS global**

  ```bash
  pnpm add -D tailwindcss@4.3.3 @tailwindcss/postcss@4.3.3 postcss
  rm "src/app/(frontend)/styles.css"
  ```

  `postcss.config.mjs`:
  ```js
  export default {
    plugins: { '@tailwindcss/postcss': {} },
  }
  ```

  `src/app/(frontend)/globals.css`:
  ```css
  @import 'tailwindcss';

  /* Cores da marca (spec §7.1). Mantenha igual a src/design/tokens.ts: o teste design-tokens confere. */
  @theme {
    --color-azul-profundo: #172554;
    --color-azul-eletrico: #2563eb;
    --color-verde: #16a34a;
    --color-verde-texto: #15803d;
    --color-cinza-claro: #f1f5f9;
    --color-branco: #ffffff;
    --color-texto: #0f172a;
    --color-texto-suave: #475569;
    --color-negativo: #dc2626;
  }

  /* Fontes auto-hospedadas pelo next/font (variáveis definidas no <html>) */
  @theme inline {
    --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
    --font-display: var(--font-manrope), ui-sans-serif, system-ui, sans-serif;
  }

  @layer base {
    html {
      color: var(--color-texto);
      background: var(--color-branco);
    }

    body {
      font-family: var(--font-sans);
      font-size: 1rem;
      line-height: 1.6;
    }

    @media (min-width: 1024px) {
      body {
        font-size: 1.0625rem;
      }
    }

    h1,
    h2,
    h3,
    h4 {
      font-family: var(--font-display);
      line-height: 1.15;
    }

    :focus-visible {
      outline: 3px solid var(--color-azul-eletrico);
      outline-offset: 2px;
    }
  }
  ```

- [ ] **Step 5: Rodar os testes de tokens**

  Run: `pnpm test:unit`
  Expected: PASS (inclui os 15 casos de `design-tokens.test.ts`).

- [ ] **Step 6: Fontes e layout raiz com as fontes aplicadas**

  `src/design/fonts.ts`:
  ```ts
  import { Inter, Manrope } from 'next/font/google'

  // Baixadas no build e servidas pelo próprio site (sem requisição ao Google no navegador)
  export const manrope = Manrope({
    subsets: ['latin'],
    weight: ['700', '800'],
    variable: '--font-manrope',
    display: 'swap',
  })

  export const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-inter',
    display: 'swap',
  })
  ```

  `src/app/(frontend)/layout.tsx` (versão provisória; a Tarefa 6 acrescenta cabeçalho e rodapé):
  ```tsx
  import type { Metadata } from 'next'
  import React from 'react'

  import { inter, manrope } from '@/design/fonts'

  import './globals.css'

  export const metadata: Metadata = {
    title: { default: 'DeciCompra · Compare. Entenda. Decida.', template: '%s | DeciCompra' },
    description: 'Análises independentes, comparativos e guias de compra para você escolher melhor.',
  }

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="pt-BR" className={`${inter.variable} ${manrope.variable}`}>
        <body className="bg-branco text-texto antialiased">
          <main>{children}</main>
        </body>
      </html>
    )
  }
  ```

  Substitua `src/app/(frontend)/page.tsx` por uma versão mínima, que a Tarefa 6 completa:
  ```tsx
  export default function HomePage() {
    return <h1 className="p-8 font-display text-4xl font-extrabold text-azul-profundo">DeciCompra</h1>
  }
  ```

- [ ] **Step 7: Verificar no navegador**

  Run: `pnpm dev`, abra http://localhost:3000.

  Esperado: "DeciCompra" em Manrope ExtraBold, azul profundo. No DevTools → Network, as fontes vêm de `/_next/static/media/…` e não de `fonts.googleapis.com`.

  Abra também http://localhost:3000/admin e confirme que o painel continua com o visual normal do Payload (o Tailwind não vaza para o painel).

- [ ] **Step 8: Lint, tipos e commit**

  Run: `pnpm lint && pnpm typecheck`
  Expected: sem erros.

  ```bash
  git add -A
  git commit -m "feat: tokens de cor, Tailwind 4 e fontes Manrope/Inter auto-hospedadas" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 6: Cabeçalho, rodapé, logo provisório e home provisória

**Files:**
- Create: `src/config/navigation.ts`, `src/components/brand/Logo.tsx`, `src/components/layout/SiteHeader.tsx`, `src/components/layout/MobileMenu.tsx`, `src/components/layout/SiteFooter.tsx`, `tests/components/SiteHeader.test.tsx`, `tests/components/MobileMenu.test.tsx`, `tests/components/SiteFooter.test.tsx`, `tests/e2e/site-shell.e2e.spec.ts`
- Modify: `tests/components/setup.tsx`, `src/app/(frontend)/layout.tsx`, `src/app/(frontend)/page.tsx`, `playwright.config.ts`

**Interfaces:**
- Consumes: as classes Tailwind e `font-display` da Tarefa 5
- Produces:
  - Em `src/config/navigation.ts`:
    - `type NavLink = { label: string; href: string }`
    - `type FooterColumn = { title: string; links: NavLink[] }`
    - `mainNav: NavLink[]`
    - `footerColumns: FooterColumn[]`

    Na Fase 1, esses dados passam para as Configurações do painel (spec §4.11).
  - `<Logo />`, `<SiteHeader />`, `<MobileMenu links={NavLink[]} />`, `<SiteFooter year?={number} />`
  - Rótulos acessíveis usados pelos testes:
    - navegação "Principal" (desktop) e "Menu" (celular)
    - botão "Abrir menu" / "Fechar menu"
    - link do logo "DeciCompra, página inicial"

- [ ] **Step 1: Dados de navegação**

  `src/config/navigation.ts`:
  ```ts
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
  ```

- [ ] **Step 2: Setup dos testes de componentes (mock do `next/link`)**

  `tests/components/setup.tsx`:
  ```tsx
  import { cleanup } from '@testing-library/react'
  import type { AnchorHTMLAttributes, ReactNode } from 'react'
  import { afterEach, vi } from 'vitest'

  // No jsdom não há roteador do Next; o Link vira um <a> comum
  vi.mock('next/link', () => ({
    default: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) => (
      <a href={href} {...rest}>
        {children}
      </a>
    ),
  }))

  afterEach(() => cleanup())
  ```

- [ ] **Step 3: Escrever os testes de componentes**

  `tests/components/MobileMenu.test.tsx`:
  ```tsx
  import { fireEvent, render, screen } from '@testing-library/react'
  import { describe, expect, it } from 'vitest'

  import { MobileMenu } from '@/components/layout/MobileMenu'
  import { mainNav } from '@/config/navigation'

  describe('MobileMenu', () => {
    it('começa fechado', () => {
      render(<MobileMenu links={mainNav} />)
      expect(screen.getByRole('button', { name: 'Abrir menu' }).getAttribute('aria-expanded')).toBe('false')
      expect(screen.queryByRole('navigation', { name: 'Menu' })).toBeNull()
    })

    it('abre ao clicar e mostra os links na ordem do menu', () => {
      render(<MobileMenu links={mainNav} />)
      fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))

      expect(screen.getByRole('button', { name: 'Fechar menu' }).getAttribute('aria-expanded')).toBe('true')
      const links = screen.getAllByRole('link')
      expect(links.map((a) => a.textContent)).toEqual(mainNav.map((l) => l.label))
      expect(links.map((a) => a.getAttribute('href'))).toEqual(mainNav.map((l) => l.href))
    })

    it('fecha com Esc e devolve o foco ao botão', () => {
      render(<MobileMenu links={mainNav} />)
      fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
      fireEvent.keyDown(document, { key: 'Escape' })

      const button = screen.getByRole('button', { name: 'Abrir menu' })
      expect(button.getAttribute('aria-expanded')).toBe('false')
      expect(document.activeElement).toBe(button)
    })

    it('fecha ao clicar num link', () => {
      render(<MobileMenu links={mainNav} />)
      fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
      fireEvent.click(screen.getByRole('link', { name: 'Guias' }))

      expect(screen.getByRole('button', { name: 'Abrir menu' }).getAttribute('aria-expanded')).toBe('false')
    })
  })
  ```

  `tests/components/SiteHeader.test.tsx`:
  ```tsx
  import { render, screen, within } from '@testing-library/react'
  import { describe, expect, it } from 'vitest'

  import { SiteHeader } from '@/components/layout/SiteHeader'
  import { mainNav } from '@/config/navigation'

  describe('SiteHeader', () => {
    it('tem o logo apontando para a home', () => {
      render(<SiteHeader />)
      expect(screen.getByRole('link', { name: 'DeciCompra, página inicial' }).getAttribute('href')).toBe('/')
    })

    it('mostra a navegação principal na ordem da spec', () => {
      render(<SiteHeader />)
      const nav = screen.getByRole('navigation', { name: 'Principal' })
      const links = within(nav).getAllByRole('link')
      expect(links.map((a) => a.textContent)).toEqual([
        'Categorias',
        'Melhores',
        'Comparativos',
        'Guias',
        'Entenda',
      ])
      expect(links.map((a) => a.getAttribute('href'))).toEqual(mainNav.map((l) => l.href))
    })
  })
  ```

  `tests/components/SiteFooter.test.tsx`:
  ```tsx
  import { render, screen, within } from '@testing-library/react'
  import { describe, expect, it } from 'vitest'

  import { SiteFooter } from '@/components/layout/SiteFooter'
  import { footerColumns } from '@/config/navigation'

  describe('SiteFooter', () => {
    it('mostra o slogan e deixa claro que não vendemos produtos', () => {
      render(<SiteFooter year={2026} />)
      const footer = screen.getByRole('contentinfo')
      expect(footer.textContent).toContain('Compare. Entenda. Decida.')
      expect(footer.textContent).toContain('Não vendemos produtos.')
    })

    it.each(footerColumns.map((c) => [c.title, c] as const))('coluna %s tem os links da spec', (title, column) => {
      render(<SiteFooter year={2026} />)
      const nav = screen.getByRole('navigation', { name: title })
      const links = within(nav).getAllByRole('link')
      expect(links.map((a) => [a.textContent, a.getAttribute('href')])).toEqual(
        column.links.map((l) => [l.label, l.href]),
      )
    })

    it('mostra o ano no copyright', () => {
      render(<SiteFooter year={2027} />)
      expect(screen.getByRole('contentinfo').textContent).toContain('© 2027 DeciCompra')
    })
  })
  ```

- [ ] **Step 4: Rodar e ver falhar**

  Run: `pnpm test:unit`
  Expected: FAIL com `Failed to resolve import "@/components/layout/MobileMenu"` (e o mesmo para os outros dois).

- [ ] **Step 5: Implementar o logo**

  `src/components/brand/Logo.tsx`:
  ```tsx
  import { useId } from 'react'

  // Logo provisório (spec §7.4): "D" com duas linhas convergindo, em gradiente azul elétrico → verde
  export function Logo() {
    const gradientId = useId()
    return (
      <span className="inline-flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
        <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2563EB" />
              <stop offset="1" stopColor="#16A34A" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`} />
          <path d="M5 10.5 11 16 5 21.5" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
          <path
            d="M13 8h4.5a8 8 0 0 1 0 16H13Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
        </svg>
        <span>
          Deci<span className="text-blue-300">Compra</span>
        </span>
      </span>
    )
  }
  ```

- [ ] **Step 6: Implementar o menu do celular**

  `src/components/layout/MobileMenu.tsx`:
  ```tsx
  'use client'

  import Link from 'next/link'
  import { useEffect, useId, useRef, useState } from 'react'

  import type { NavLink } from '@/config/navigation'

  export function MobileMenu({ links }: { links: NavLink[] }) {
    const [open, setOpen] = useState(false)
    const panelId = useId()
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
      if (!open) return
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false)
          buttonRef.current?.focus()
        }
      }
      document.addEventListener('keydown', onKeyDown)
      return () => document.removeEventListener('keydown', onKeyDown)
    }, [open])

    return (
      <div className="lg:hidden">
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-white/10"
        >
          <span className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</span>
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
        <nav
          id={panelId}
          aria-label="Menu"
          hidden={!open}
          className="absolute inset-x-0 top-16 z-40 border-t border-white/10 bg-azul-profundo shadow-lg"
        >
          <ul className="flex flex-col px-4 py-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)} className="block py-3 text-base font-medium">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    )
  }
  ```

- [ ] **Step 7: Implementar o cabeçalho**

  `src/components/layout/SiteHeader.tsx`:
  ```tsx
  import Link from 'next/link'

  import { Logo } from '@/components/brand/Logo'
  import { mainNav } from '@/config/navigation'

  import { MobileMenu } from './MobileMenu'

  export function SiteHeader() {
    return (
      <header className="relative bg-azul-profundo text-branco">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-4 lg:px-8">
          <Link href="/" aria-label="DeciCompra, página inicial" className="rounded-md">
            <Logo />
          </Link>
          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-7 text-sm font-medium">
              {mainNav.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="rounded-sm py-2 hover:text-blue-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <MobileMenu links={mainNav} />
        </div>
      </header>
    )
  }
  ```

- [ ] **Step 8: Implementar o rodapé**

  `src/components/layout/SiteFooter.tsx`:
  ```tsx
  import Link from 'next/link'

  import { Logo } from '@/components/brand/Logo'
  import { footerColumns } from '@/config/navigation'

  export function SiteFooter({ year = new Date().getFullYear() }: { year?: number }) {
    return (
      <footer className="bg-azul-profundo text-blue-100">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
          <div>
            <span className="text-branco">
              <Logo />
            </span>
            <p className="mt-3 text-sm">Compare. Entenda. Decida.</p>
            <p className="mt-1 text-sm">Não vendemos produtos.</p>
          </div>
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-bold text-branco">{column.title}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-branco hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-[1280px] px-4 py-4 text-xs lg:px-8">© {year} DeciCompra</p>
        </div>
      </footer>
    )
  }
  ```

- [ ] **Step 9: Rodar os testes de componentes**

  Run: `pnpm test:unit`
  Expected: PASS (MobileMenu 4, SiteHeader 2, SiteFooter 6, mais os anteriores).

- [ ] **Step 10: Layout final e home provisória**

  `src/app/(frontend)/layout.tsx`:
  ```tsx
  import type { Metadata } from 'next'
  import React from 'react'

  import { SiteFooter } from '@/components/layout/SiteFooter'
  import { SiteHeader } from '@/components/layout/SiteHeader'
  import { inter, manrope } from '@/design/fonts'

  import './globals.css'

  export const metadata: Metadata = {
    title: { default: 'DeciCompra · Compare. Entenda. Decida.', template: '%s | DeciCompra' },
    description: 'Análises independentes, comparativos e guias de compra para você escolher melhor.',
    // Provisório até o lançamento: a política de indexação definitiva é da Fase 3 (spec §5.5 e §11)
    robots: { index: false, follow: false },
  }

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="pt-BR" className={`${inter.variable} ${manrope.variable}`}>
        <body className="flex min-h-screen flex-col bg-branco text-texto antialiased">
          <a
            href="#conteudo"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-branco focus:px-4 focus:py-2 focus:text-azul-profundo"
          >
            Pular para o conteúdo
          </a>
          <SiteHeader />
          <main id="conteudo" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </body>
      </html>
    )
  }
  ```

  `src/app/(frontend)/page.tsx`:
  ```tsx
  // Home provisória da Fase 0; a home completa (spec §6.1) é construída na Fase 2
  export default function HomePage() {
    return (
      <section className="bg-azul-profundo text-branco">
        <div className="mx-auto max-w-[1280px] px-4 py-20 lg:px-8 lg:py-28">
          <p className="text-sm font-semibold tracking-wide text-blue-200">
            ANÁLISES INDEPENDENTES · NÃO VENDEMOS PRODUTOS
          </p>
          <h1 className="mt-3 text-4xl font-extrabold lg:text-6xl">
            Compare. Entenda. <span className="text-verde">Decida.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-blue-100 lg:text-xl">
            Análises, comparativos e guias completos para você escolher o melhor produto, sem complicação.
          </p>
          <p className="mt-8 text-sm text-blue-200">Site em construção.</p>
        </div>
      </section>
    )
  }
  ```

- [ ] **Step 11: Configurar o Playwright e escrever o teste ponta a ponta**

  `playwright.config.ts`:
  ```ts
  import { defineConfig, devices } from '@playwright/test'
  import 'dotenv/config'

  export default defineConfig({
    testDir: './tests/e2e',
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? 'github' : 'list',
    use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
      command: process.env.CI ? 'pnpm start' : 'pnpm dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  })
  ```

  `tests/e2e/site-shell.e2e.spec.ts`:
  ```ts
  import { expect, test } from '@playwright/test'

  test('home mostra slogan, cabeçalho, rodapé e não é indexável antes do lançamento', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('DeciCompra · Compare. Entenda. Decida.')
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Compare. Entenda. Decida.')
    await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link')).toHaveText([
      'Categorias',
      'Melhores',
      'Comparativos',
      'Guias',
      'Entenda',
    ])
    await expect(page.getByRole('contentinfo')).toContainText('Não vendemos produtos.')
  })

  test.describe('celular', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('menu abre, mostra os links e fecha com Esc', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByRole('navigation', { name: 'Principal' })).toBeHidden()
      await page.getByRole('button', { name: 'Abrir menu' }).click()

      const menu = page.getByRole('navigation', { name: 'Menu' })
      await expect(menu.getByRole('link', { name: 'Melhores' })).toBeVisible()

      await page.keyboard.press('Escape')
      await expect(menu).toBeHidden()
      await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeFocused()
    })
  })

  test.describe('sem JavaScript', () => {
    test.use({ javaScriptEnabled: false })

    test('a navegação principal funciona no desktop', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Guias' })).toBeVisible()
    })
  })

  test('painel administrativo carrega', async ({ page }) => {
    const response = await page.goto('/admin')
    expect(response?.status()).toBeLessThan(400)
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 30_000 })
  })
  ```

- [ ] **Step 12: Rodar o teste ponta a ponta**

  ```bash
  pnpm exec playwright install chromium
  pnpm test:e2e
  ```
  Expected: PASS (4 testes). O Playwright sobe o `pnpm dev` sozinho.

- [ ] **Step 13: Conferência visual**

  Run: `pnpm dev` e abra http://localhost:3000 em 1440 px e em 390 px (DevTools → modo celular).

  Esperado:
  - cabeçalho azul profundo com logo e menu (desktop) ou botão ☰ (celular)
  - topo com "Decida." em verde
  - rodapé com 5 colunas no desktop, empilhadas no celular
  - Tab mostra o link "Pular para o conteúdo" e um contorno de foco azul em cada link

  **Responsável:** confirme que o resultado está de acordo com o que foi aprovado.

- [ ] **Step 14: Lint, tipos e commit**

  Run: `pnpm lint && pnpm typecheck`
  Expected: sem erros.

  ```bash
  git add -A
  git commit -m "feat: cabeçalho, rodapé, menu do celular, logo e home provisórios" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 7: Integração contínua (GitHub Actions) e config da Vercel

**Files:**
- Create: `.github/workflows/ci.yml`, `vercel.json`

**Interfaces:**
- Consumes: os scripts pnpm da Tarefa 2 e os testes das Tarefas 2–6
- Produces: um workflow `CI` que roda em todo push para `main` e em todo pull request. Também `vercel.json`, com o comando de build (`pnpm run build:vercel`) e a região `gru1`.

- [ ] **Step 1: Escrever o workflow**

  `.github/workflows/ci.yml`:
  ```yaml
  name: CI

  on:
    push:
      branches: [main]
    pull_request:

  jobs:
    verificar:
      runs-on: ubuntu-latest
      timeout-minutes: 30

      services:
        postgres:
          image: postgres:17
          env:
            POSTGRES_USER: decicompra
            POSTGRES_PASSWORD: decicompra
            POSTGRES_DB: decicompra_test
          ports:
            - 5432:5432
          options: >-
            --health-cmd "pg_isready -U decicompra"
            --health-interval 5s
            --health-timeout 5s
            --health-retries 10

      env:
        CI: 'true'
        DATABASE_URL: postgres://decicompra:decicompra@localhost:5432/decicompra_test
        TEST_DATABASE_URL: postgres://decicompra:decicompra@localhost:5432/decicompra_test
        PAYLOAD_SECRET: ci-segredo-somente-para-testes-0123456789abcdef

      steps:
        - uses: actions/checkout@v4

        - uses: pnpm/action-setup@v4

        - uses: actions/setup-node@v4
          with:
            node-version: 24
            cache: pnpm

        - name: Instalar dependências
          run: pnpm install --frozen-lockfile

        - name: Lint
          run: pnpm lint

        - name: Testes unitários e de componentes
          run: pnpm test:unit

        - name: Migrações
          run: pnpm payload migrate

        - name: Testes de integração
          run: pnpm test:int

        - name: Build
          run: pnpm build

        - name: Verificação de tipos
          run: pnpm typecheck

        - name: Instalar navegador do Playwright
          run: pnpm exec playwright install --with-deps chromium

        - name: Testes ponta a ponta
          run: pnpm test:e2e
  ```

- [ ] **Step 2: Escrever `vercel.json`**

  ```json
  {
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "buildCommand": "pnpm run build:vercel",
    "regions": ["gru1"]
  }
  ```

- [ ] **Step 3: Simular o CI localmente (mesma sequência)**

  ```bash
  pnpm install --frozen-lockfile && pnpm lint && pnpm test:unit && pnpm test:int && pnpm build && pnpm typecheck && CI=true pnpm test:e2e
  ```
  Expected: tudo PASS. Com `CI=true`, o Playwright usa `pnpm start` sobre o build recém-gerado.

- [ ] **Step 4: Commit**

  ```bash
  git add .github/workflows/ci.yml vercel.json
  git commit -m "ci: lint, testes, build e e2e no GitHub Actions; config da Vercel" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

---

### Task 8: Publicar no GitHub e na Vercel (executada pelo responsável, com orientação)

**Files:** nenhum arquivo novo, salvo correções que a verificação revelar.

**Interfaces:**
- Consumes: todos os commits das Tarefas 2–7 e os valores da Tarefa 1
- Produces:
  - repositório no GitHub com CI verde
  - projeto na Vercel com deploy de **produção** (`*.vercel.app`, banco `main`, bucket `decicompra-media`) e deploys de **prévia** por branch (banco `dev`, bucket `decicompra-media-dev`)
  - usuário administrador criado nos bancos `dev` e `main`

- [ ] **Step 1: Enviar o código para o GitHub**

  ```bash
  git remote add origin https://github.com/<SEU_USUARIO>/decicompra.git
  git push -u origin main
  ```
  Na primeira vez, o Git para Windows abre o navegador para autorizar o acesso ao GitHub.

  Esperado: o código aparece no repositório e a aba **Actions** mostra o workflow **CI** rodando.

- [ ] **Step 2: Confirmar o CI verde**

  Esperado: o workflow **CI** termina com ✔ (cerca de 5–10 min).

  Se falhar, copie a mensagem de erro do passo que falhou para o agente. **Não** cole valores do `.env`.

- [ ] **Step 3: Importar o projeto na Vercel**

  Vercel → *Add New → Project* → importe `decicompra` do GitHub. Framework: **Next.js**. Não altere o comando de build: o `vercel.json` já define `pnpm run build:vercel`.

  **Antes do primeiro deploy**, em *Environment Variables*, cadastre:

  | Variável | Production | Preview |
  |---|---|---|
  | `DATABASE_URL` | `NEON_MAIN_URL` | `NEON_DEV_URL` |
  | `PAYLOAD_SECRET` | **novo** segredo (gere outro com `node -e …`) | o mesmo do seu `.env` |
  | `R2_BUCKET` | `decicompra-media` | `decicompra-media-dev` |
  | `R2_PUBLIC_URL` | URL pública **produção** | URL pública **dev** |
  | `R2_ENDPOINT` | endpoint | endpoint |
  | `R2_ACCESS_KEY_ID` | chave | chave |
  | `R2_SECRET_ACCESS_KEY` | segredo | segredo |

  Clique em **Deploy**.

  Esperado: o build roda `payload migrate` no banco `main` e depois `next build`, e termina com ✔.

- [ ] **Step 4: Criar o administrador de produção imediatamente**

  Abra `https://<projeto>.vercel.app/admin`. A tela "Criar primeiro usuário" fica aberta para **qualquer pessoa** enquanto não existir um usuário, então crie o seu **agora**, com uma senha forte e diferente da de `dev`.

  Esperado: login no painel em português.

- [ ] **Step 5: Verificar a produção**

  - `https://<projeto>.vercel.app` mostra a home provisória com cabeçalho, slogan e rodapé.
  - Ver código-fonte (Ctrl+U) contém `<meta name="robots" content="noindex, nofollow"/>`.
  - Em `/admin` → Mídia, envie uma imagem de teste. A URL gerada começa com a URL pública **produção** (`decicompra-media`). Depois **apague** o documento de teste.
  - Envie um arquivo de 5 MB: aparece um erro (da Vercel ou "A imagem tem mais de 4 MB…"), e nada é salvo.

- [ ] **Step 6: Verificar uma prévia**

  ```bash
  git switch -c teste-previa
  git commit --allow-empty -m "chore: testar deploy de prévia" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  git push -u origin teste-previa
  ```
  Esperado: a Vercel cria um deploy de **Preview** (link no painel da Vercel). Em `/admin`, o login aceita o usuário criado no banco `dev` na Tarefa 2. Isso prova que a prévia usa o banco `dev`.

  Limpeza:
  ```bash
  git switch main
  git branch -D teste-previa
  git push origin --delete teste-previa
  ```

- [ ] **Step 7: Encerrar a Fase 0**

  **Responsável:** confirme ao agente: "produção e prévia funcionando, CI verde". A Fase 0 está concluída, e o próximo passo é o plano da Fase 1 (Dados + painel).
