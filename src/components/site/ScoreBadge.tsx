import { scoreBand } from '@/catalog/score'
import { formatScore } from '@/content/view-models'

// Selo da Nota DeciCompra (spec §5.1): uma casa decimal, com a faixa por extenso
export function ScoreBadge({ score, showBand = false, size = 'md' }: { score: number | null | undefined; showBand?: boolean; size?: 'md' | 'lg' }) {
  const text = formatScore(score)
  if (text === null || score === null || score === undefined) return null
  const band = scoreBand(score)
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-label={`Nota DeciCompra ${text} de 10 (${band})`}
        className={`rounded-lg bg-verde-texto font-display font-extrabold text-branco ${size === 'lg' ? 'px-3 py-1.5 text-2xl' : 'px-2 py-0.5 text-base'}`}
      >
        {text}
      </span>
      {showBand ? <span className="text-sm font-semibold text-verde-texto">{band}</span> : null}
    </span>
  )
}
