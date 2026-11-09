import { describe, expect, it } from 'vitest'

import rozwiazania from '../../../../../seed/prokomsoftware/rozwiazania.json'
import { isMockupKind } from '@/lib/software/mockups'
import { spotsOf } from '@/lib/software/spots'
import { SOLUTION_PREVIEWS } from '@/seed/software/previews'

import { mockupSpots } from './spots'

type Item = { slug: string; included?: string[] | null }

/** Points of „W cenie” that light up an area of the offer's own mock-up. */
function litPoints(item: Item): number {
  const preview = SOLUTION_PREVIEWS[item.slug]
  const kind = preview && isMockupKind(preview.kind) ? preview.kind : null
  const spots = mockupSpots(kind, preview?.variant ?? null)
  return (item.included ?? []).filter((point) => spotsOf(point).some((spot) => spots.has(spot)))
    .length
}

const items = (rozwiazania as { items?: Item[] }).items ?? Object.values(rozwiazania)[0]

describe('points of „W cenie” on the mock-ups (OKNO-OFERTY-PREMIUM §3)', () => {
  const coverage = Object.fromEntries((items as Item[]).map((item) => [item.slug, litPoints(item)]))

  it('the page offers light at least two points of their mock-up', () => {
    // Pages (site mock-ups) are where the points matter most; the report below lists the rest.
    // „landing-page” (1) and the panels, flows and apps (0) are reported in the PR instead.
    const pages = [
      'strona-wizytowka',
      'strona-firmowa-z-panelem',
      'strona-dla-hotelu-lub-pensjonatu',
      'strona-dla-restauracji-lub-baru',
      'rozbudowana-strona-firmowa',
      'sklep-internetowy',
    ]
    for (const slug of pages) expect(coverage[slug], slug).toBeGreaterThanOrEqual(2)
  })

  it('reports the coverage of all 29 offers (fewer than 2 → listed in the PR)', () => {
    expect(Object.keys(coverage)).toHaveLength(29)
    expect(coverage).toMatchSnapshot()
  })
})
