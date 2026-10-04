import type { ImageSet } from '@/content/view-models'

// Versões WebP pré-geradas e servidas pelo R2 (spec §12.1), sem o otimizador da Vercel
export function ProductImage({
  image,
  sizes = '(min-width: 1024px) 400px, 100vw',
  className = '',
  priority = false,
}: {
  image: ImageSet | null
  sizes?: string
  className?: string
  priority?: boolean
}) {
  if (!image) {
    return <div aria-hidden="true" className={`aspect-[16/10] rounded-lg bg-cinza-claro ${className}`} />
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.src}
      srcSet={image.srcSet || undefined}
      sizes={image.srcSet ? sizes : undefined}
      alt={image.alt}
      width={image.width || undefined}
      height={image.height || undefined}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      className={`h-auto w-full rounded-lg bg-cinza-claro object-contain ${className}`}
    />
  )
}
