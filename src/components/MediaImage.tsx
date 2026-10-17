'use client'

import Image, { type ImageLoader } from 'next/image'

import { pickSource } from '@/lib/media/sizes'
import type { PublicImage } from '@/lib/media/public'

type Props = {
  image: PublicImage
  /** `sizes` of the `<img>`: how wide the image is on screen, e.g. `(min-width: 1024px) 50vw, 100vw`. */
  sizes: string
  /** Above the fold (first hero): load at once, high priority (`priority` is deprecated in Next 16). */
  eager?: boolean
  className?: string
}

/**
 * Uploaded image through `next/image` (lazy loading, `srcset`, no layout shift). The loader
 * points at the WebP sizes Payload made on upload instead of Next's optimizer (`lib/media/sizes`).
 * A client component only because a loader is a function; the image data comes from the server.
 */
export function MediaImage({ image, sizes, eager = false, className }: Props) {
  const loader: ImageLoader = ({ width }) => pickSource(image.sources, width)
  // One file only (an image smaller than every size): nothing to choose from → `unoptimized`.
  // Otherwise `src` is the smallest file, so Next sees the loader return other files per width.
  const single = image.sources.length === 1
  return (
    <Image
      loader={single ? undefined : loader}
      unoptimized={single}
      src={image.sources[0]?.url ?? ''}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      className={className}
    />
  )
}
