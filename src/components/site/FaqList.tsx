export type FaqItem = { question: string; answer: string }

export function FaqList({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null
  return (
    <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
      {items.map((item) => (
        <details key={item.question} className="group px-4 py-3">
          <summary className="cursor-pointer font-semibold text-texto">{item.question}</summary>
          <p className="mt-2 text-texto-suave">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}
