import type { PublicImage } from '../media/public'
import type { Line } from '../tenant/lines'

/**
 * Link preview image of a line while the panel has none (`SiteSettings.seo.ogImage`, SWV8
 * P0 #4): a static file in `public/brand`, drawn by `scripts/<line>-og.mjs`. Lines without a
 * file share no image rather than another line's.
 */
const DEFAULT_OG_IMAGES: Partial<Record<Line, PublicImage>> = {
  software: {
    alt: 'PRO-KOM Software — strony i programy dla firm. Zobaczysz, zanim zapłacisz.',
    width: 1200,
    height: 630,
    sources: [{ url: '/brand/prokom-software_og.png', width: 1200 }],
  },
}

export function defaultOgImage(line: Line | null): PublicImage | null {
  return (line && DEFAULT_OG_IMAGES[line]) ?? null
}
