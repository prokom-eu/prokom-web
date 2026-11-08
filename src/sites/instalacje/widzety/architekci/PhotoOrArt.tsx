'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { MediaImage } from '@/components/MediaImage'
import type { PublicImage } from '@/lib/media/public'

type Props = {
  image: PublicImage
  sizes: string
  className?: string
  /** The card's SVG drawing, shown when the photo cannot load. */
  art: ReactNode
}

/**
 * A card photo of „Nowe rozwiązania” that falls back to the card's drawing when the file does not
 * load (runda v6 §1.7.2: a media record without its file showed a broken image). The shared
 * `MediaImage` has no error callback, so the `<img>` inside is watched here: an error event, or
 * an image that had already failed before hydration (`complete` with no width).
 */
export function PhotoOrArt({ image, sizes, className, art }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const img = ref.current?.querySelector('img')
    if (!img) return
    const fail = () => setFailed(true)
    if (img.complete && img.naturalWidth === 0) fail()
    img.addEventListener('error', fail)
    return () => img.removeEventListener('error', fail)
  }, [image])
  if (failed) return <>{art}</>
  return (
    <span ref={ref} className="arpoa">
      <MediaImage image={image} sizes={sizes} className={className} />
    </span>
  )
}
