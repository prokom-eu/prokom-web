import {
  SOFTWARE_OG_CATEGORIES,
  SOFTWARE_OG_COVER,
  type SoftwareOgCategory,
} from '@/lib/software/ogColors'
import type { CoverMotif } from '@/lib/software/postCovers'

import { CoverScene } from '../components/news/PostCover'
import { COVER_CSS } from './coverCss'
import { svgMarkup } from './svgMarkup'

/** `COVER_CSS` with each `var()` replaced by the literal colour of the category. */
export function coverStyle(category: SoftwareOgCategory): string {
  const { ink, glow } = SOFTWARE_OG_CATEGORIES[category]
  const values: Record<string, string> = {
    ...SOFTWARE_OG_COVER,
    'cover-hue': ink,
    'cover-hue-soft': glow,
  }
  return COVER_CSS.replace(/var\(--([\w-]+)\)/g, (_, name: string) => {
    const value = values[name]
    if (value === undefined) throw new Error(`No OG colour for --${name}`)
    return value
  })
}

/**
 * The cover scene of a post as a standalone SVG data URI (the page's scene, its rules inlined),
 * for an `<img>` of `ImageResponse`.
 */
export function coverDataUri(
  motif: CoverMotif,
  category: SoftwareOgCategory,
  width: number,
  height: number,
): string {
  const markup = svgMarkup(
    <CoverScene motif={motif} className="sw-cover" width={width} height={height} />,
  ).replace(
    /^<svg([^>]*)>/,
    `<svg xmlns="http://www.w3.org/2000/svg"$1><style>${coverStyle(category)}</style>`,
  )
  return `data:image/svg+xml;base64,${Buffer.from(markup).toString('base64')}`
}
