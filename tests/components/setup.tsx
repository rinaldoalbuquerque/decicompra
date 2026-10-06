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

// Nem o roteador do App Router: endereço fixo fora da home e navegação que não faz nada
vi.mock('next/navigation', () => ({
  usePathname: () => '/produtos/exemplo/',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

afterEach(() => cleanup())
