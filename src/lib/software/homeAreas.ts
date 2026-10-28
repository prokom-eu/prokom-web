import type { SolutionArea } from '@/payload-types'

import { type IconName, isIconName } from '../catalog/options'
import { isValidNavHref } from '../site/link'
import { areaPriceText } from './mobileNav'

/**
 * The 8 areas of the start page section „Oferta” (spec. §4 pkt 3), from `SolutionAreas` of one
 * tenant. A chip links to its solution's page only when that solution is published in the same
 * tenant (`publishedSlugs` by id); otherwise it is plain text, as the panel describes it.
 */

export type HomeArea = {
  key: SolutionArea['key']
  name: string
  icon: IconName | null
  short: string | null
  description: string | null
  gain: string | null
  countLabel: string | null
  /** Price text: `priceLabel`, else „od {cena} zł”, else „Zapytaj o wycenę”. */
  price: string
  chips: { label: string; href: string | null }[]
  cta: { label: string; href: string } | null
}

export type HomeAreaDoc = Pick<
  SolutionArea,
  | 'key'
  | 'name'
  | 'icon'
  | 'short'
  | 'description'
  | 'gain'
  | 'countLabel'
  | 'priceFrom'
  | 'priceLabel'
  | 'chips'
  | 'cta'
>

const text = (value: string | null | undefined) => value?.trim() || null

function solutionId(value: NonNullable<HomeAreaDoc['chips']>[number]['solution']): number | null {
  if (typeof value === 'number') return value
  return value?.id ?? null
}

export function homeAreas(
  docs: readonly HomeAreaDoc[],
  publishedSlugs: ReadonlyMap<number, string>,
): HomeArea[] {
  return docs.map((doc) => {
    const ctaLabel = text(doc.cta?.label)
    const ctaHref = text(doc.cta?.href)
    return {
      key: doc.key,
      name: doc.name,
      icon: isIconName(doc.icon) ? doc.icon : null,
      short: text(doc.short),
      description: text(doc.description),
      gain: text(doc.gain),
      countLabel: text(doc.countLabel),
      price: areaPriceText({
        priceFrom: doc.priceFrom ?? null,
        priceLabel: doc.priceLabel ?? null,
      }),
      chips: (doc.chips ?? []).map((chip) => {
        const id = solutionId(chip.solution)
        const slug = id === null ? undefined : publishedSlugs.get(id)
        return { label: chip.label, href: slug ? `/rozwiazania/${slug}` : null }
      }),
      cta:
        ctaLabel && ctaHref && isValidNavHref(ctaHref) ? { label: ctaLabel, href: ctaHref } : null,
    }
  })
}
