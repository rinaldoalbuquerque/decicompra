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
