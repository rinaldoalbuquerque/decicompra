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
