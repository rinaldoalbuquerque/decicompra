import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

// Imagem de compartilhamento (spec §11): logo, título e, quando houver, a Nota DeciCompra
export function ogImage({ kicker, title, score }: { kicker?: string | null; title: string; score?: string | null }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#172554',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 44, fontWeight: 800 }}>
          <svg width="72" height="72" viewBox="0 0 32 32">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2563EB" />
                <stop offset="1" stopColor="#16A34A" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#g)" />
            <path d="M5 10.5 11 16 5 21.5" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M13 8h4.5a8 8 0 0 1 0 16H13Z" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinejoin="round" />
          </svg>
          <div style={{ display: 'flex' }}>
            Deci<span style={{ color: '#93C5FD' }}>Compra</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {kicker ? <div style={{ fontSize: 30, color: '#86EFAC', textTransform: 'uppercase', letterSpacing: 2 }}>{kicker}</div> : null}
          <div style={{ fontSize: title.length > 60 ? 54 : 66, fontWeight: 800, lineHeight: 1.1 }}>{title.slice(0, 110)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 30, color: '#BFDBFE' }}>
          <div style={{ display: 'flex' }}>Compare. Entenda. Decida.</div>
          {score ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#16A34A', color: '#FFFFFF', padding: '10px 24px', borderRadius: 16 }}>
              <span style={{ fontSize: 28 }}>Nota DeciCompra</span>
              <span style={{ fontSize: 48, fontWeight: 800 }}>{score}</span>
            </div>
          ) : null}
        </div>
      </div>
    ),
    OG_SIZE,
  )
}
