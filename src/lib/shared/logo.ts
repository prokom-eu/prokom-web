import type { SharedLineKey } from './lines'

/** `kolor` for light backgrounds, `negatyw` for dark ones (brand package names). */
export type LogoTone = 'kolor' | 'negatyw'

export type LogoFile = { src: string; width: number; height: number }

// Horizontal marks of the brand package share one viewBox (836 × 167); the main line is
// "glowna" there (spec §5 `LineLogo`: the green rule under the name, no line name).
const HORIZONTAL = { width: 836, height: 167 } as const
const PREFIX: Partial<Record<SharedLineKey, string>> = {
  prokom: 'prokom-glowna',
  biznes: 'prokom-biznes',
  instalacje: 'prokom-instalacje',
  software: 'prokom-software',
  tech: 'prokom-tech',
}

// Gaming is a product brand (spec §2.4): its own mark from the `prokom-gaming` repo, only in the
// version for dark backgrounds — its tile is always dark.
const GAMING: LogoFile = { src: '/brand/prokom-gaming-znak-ciemne.svg', width: 309, height: 113 }

/** The horizontal mark of a line, or `null` when the package has none in `public/brand` (Zakopane). */
export function lineLogoFile(line: SharedLineKey, tone: LogoTone): LogoFile | null {
  if (line === 'gaming') return GAMING
  const prefix = PREFIX[line]
  return prefix ? { src: `/brand/${prefix}_poziome_${tone}.svg`, ...HORIZONTAL } : null
}
