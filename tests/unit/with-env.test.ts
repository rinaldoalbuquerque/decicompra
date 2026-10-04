import { describe, expect, it } from 'vitest'

import { toShellCommand } from '../../scripts/with-env-lib.mjs'

describe('toShellCommand', () => {
  it('mantém argumentos simples e põe aspas nos que têm espaço ou aspas', () => {
    expect(toShellCommand(['pnpm', 'payload', 'migrate:status'])).toBe('pnpm payload migrate:status')
    expect(toShellCommand(['node', '-e', 'console.log("oi mundo")'])).toBe('node -e "console.log(\\"oi mundo\\")"')
  })
})
