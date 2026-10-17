import type { Metadata } from 'next'

import type { Line } from '@/lib/tenant/lines'

/** Brand files of each line in `public/brand/` (docs/marka.md), named as in the brand package. */
export const BRAND_ASSETS = [
  'poziome_kolor.svg',
  'poziome_negatyw.svg',
  'sygnet_kolor.svg',
  'favicon.svg',
  'favicon.ico',
  'apple-touch-icon-180.png',
  'icon-192.png',
  'icon-512.png',
] as const

export type BrandAsset = (typeof BRAND_ASSETS)[number]

// The package calls the main line "glowna"; in code it is `prokom` (Tenants.line).
const FILE_PREFIX: Record<Line, string> = {
  prokom: 'prokom-glowna',
  biznes: 'prokom-biznes',
  instalacje: 'prokom-instalacje',
  software: 'prokom-software',
}

/** Public URL of a line's brand file, e.g. `/brand/prokom-biznes_poziome_kolor.svg`. */
export function brandAsset(line: Line, asset: BrandAsset): string {
  return `/brand/${FILE_PREFIX[line]}_${asset}`
}

/** Favicons of a site: the simplified mark of its own line (16–48 px, no rule). */
export function brandIcons(line: Line): NonNullable<Metadata['icons']> {
  return {
    icon: [
      { url: brandAsset(line, 'favicon.ico'), sizes: '32x32' },
      { url: brandAsset(line, 'favicon.svg'), type: 'image/svg+xml' },
    ],
    apple: { url: brandAsset(line, 'apple-touch-icon-180.png'), sizes: '180x180' },
  }
}

/** A PRO-KOM line in the brand bar; `line` is set for lines with a site in this repo. */
export type BrandLink = { label: string; href: string; line?: Line }

/**
 * Brand bar: the PRO-KOM lines and their public sites. Production addresses on purpose — the
 * bar links out to other brands, and these change only with a new site (docs/dns.md).
 * TODO(krystian): PRO-KOM Zakopane — add once it has its own address.
 */
export const BRAND_LINKS: readonly BrandLink[] = [
  { label: 'PRO-KOM', href: 'https://pro-kom.eu', line: 'prokom' },
  { label: 'Biznes', href: 'https://prokombiznes.pl', line: 'biznes' },
  { label: 'Instalacje', href: 'https://prokominstalacje.pl', line: 'instalacje' },
  { label: 'Software', href: 'https://prokomsoftware.pl', line: 'software' },
  { label: 'Tech · naprawy', href: 'https://prokomserwis.pl' },
]
