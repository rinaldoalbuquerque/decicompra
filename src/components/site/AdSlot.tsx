// Espaço de anúncio (spec §10.2): altura reservada para não deslocar a página.
// Desligado até a aprovação do AdSense; o script entra na Fase 3.
export function AdSlot({ placement, enabled }: { placement: 'home' | 'content' | 'sidebar'; enabled: boolean }) {
  if (!enabled) return null
  return (
    <div
      data-ad-placement={placement}
      aria-hidden="true"
      className={`my-8 w-full rounded-lg bg-cinza-claro ${placement === 'sidebar' ? 'min-h-[250px]' : 'min-h-[120px]'}`}
    />
  )
}
