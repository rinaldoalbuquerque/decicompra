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

## Categorias iniciais

```bash
pnpm seed
```
Cria as 5 categorias e as subcategorias da spec (com os pesos das âncoras) e o autor "Equipe DeciCompra". Pode rodar de novo sem duplicar.

## Rodar um comando em outro ambiente

```bash
node scripts/with-env.mjs .env.producao.local pnpm payload migrate:status
```
Mostra o banco de destino antes de rodar. Use com cuidado: em produção, os comandos gravam dados reais.
Nunca chame o arquivo de produção de `.env.production.local`: o Next carregaria esse arquivo sozinho no `next start`.

## Dados de demonstração (só desenvolvimento)

```bash
DEMO_SEED=1 pnpm seed:demo            # Git Bash
$env:DEMO_SEED=1; pnpm seed:demo      # PowerShell
```
A variável `DEMO_SEED=1` é a confirmação de que o banco é de desenvolvimento. Cria 3 TVs, ofertas e um conteúdo de cada tipo (slugs `demo-…`) para ver as páginas funcionando. Recusa o banco de produção.

## Backup do banco (semanal)

O workflow `.github/workflows/backup.yml` roda todo domingo às 03:00 (Brasília) e também pode ser disparado à mão
(GitHub → Actions → "Backup do banco" → "Run workflow"). Ele faz o `pg_dump` do banco de produção e envia o arquivo
para um bucket R2 **privado**, guardando as 8 cópias mais recentes. Sem os segredos abaixo, ele só avisa e não faz nada.

Segredos do repositório (GitHub → Settings → Secrets and variables → Actions):

| Segredo | Valor |
|---|---|
| `BACKUP_DATABASE_URL` | string de conexão **direta** do banco de produção (Neon, branch production) |
| `BACKUP_R2_BUCKET` | nome do bucket privado de backups (ex.: `decicompra-backups`) |
| `BACKUP_R2_ENDPOINT` | `https://<id-da-conta>.r2.cloudflarestorage.com` |
| `BACKUP_R2_ACCESS_KEY_ID` / `BACKUP_R2_SECRET_ACCESS_KEY` | token R2 com permissão de leitura e escrita **só** nesse bucket |

Restaurar (num banco vazio ou num branch novo do Neon, nunca direto em produção sem conferir):

```bash
pg_restore --clean --if-exists --no-owner --no-privileges -d "postgresql://...destino..." decicompra-AAAA-MM-DD-HHMM.dump
```

O Neon também tem restauração nativa por ponto no tempo (painel do Neon → Branches → Restore).
