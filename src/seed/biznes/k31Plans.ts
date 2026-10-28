import { isSafeSvg, isSvgPath } from '../../lib/catalog/svg'
import { isYoutubeId } from '../../lib/catalog/videos'
import type { FloorPlan, Partner } from '../../payload-types'
import type { K31Catalog } from './k31'

/**
 * K31a-2: showrooms of `marki-salony-k31.json` (→ `Partners.showroom`) and the scenes of
 * `plansze-k31.json` (→ `FloorPlans`). Pure functions; `run.ts` gives them the product ids.
 * Cards are named by `slug_seed`; a card the K3.1 split replaced stands for all its new cards
 * (decision 27.10), the 301 target first.
 */

type SeriesRow = {
  n: string
  dla?: string
  wyr?: string
  klasa?: string
  img?: string
  prods: string[]
}

export type K31Showroom = {
  h1: string
  lead: string
  hero: string[]
  cmpTitle?: string
  wizTitle?: string
  segs: { id: string; n: string; ic?: string; series: SeriesRow[] }[]
  wiz: { q: string; o: { t: string; k: string }[] }[]
  wizRules: { when: string[]; ser: string; why: string; p: string[] }[]
  svc: { ic?: string; t: string; d: string }[]
}

/** `wideo-k31.json` → `serie.<brand>.<series>`. */
export type K31SeriesVideo = { id: string; t: string; k?: string | null }

export type K31Scene = {
  id: string
  nazwa: string
  tytul: string
  lead?: string
  ikona_path?: string
  svg: string
  viewBox: string
  punkty: { x: number; y: number; slug: string; etykieta: string; opis?: string }[]
}

export type ShowroomData = NonNullable<Partner['showroom']>
export type FloorPlanData = Pick<
  FloorPlan,
  'name' | 'slug' | 'title' | 'lead' | 'iconPath' | 'order' | 'viewBox' | 'svg'
> & { points: NonNullable<FloorPlan['points']> }

/** Product record id by `slug_seed` (`run.ts`: ids of the imported cards). */
export type ProductId = (slug: string) => number | undefined

const fail = (message: string): never => {
  throw new Error(`Seed (K3.1 salony/plany): ${message}`)
}

const unique = <T>(items: T[]) => [...new Set(items)]

/** Cards a package slug stands for: the card itself, or the new cards of a split source. */
export function cardsOf(catalog: K31Catalog): (slug: string) => string[] {
  const live = new Set(catalog.cards.map((card) => card.slug_seed))
  const splits = new Map(
    catalog.splits
      .filter(({ source }) => !live.has(source.slug_seed))
      .map(({ source, split }) => [
        source.slug_seed,
        unique([split.redirect_301, ...split.nowe.map((item) => item.slug)]),
      ]),
  )
  return (slug) => (live.has(slug) ? [slug] : (splits.get(slug) ?? fail(`unknown card "${slug}".`)))
}

function refs(slugs: string[], cards: (slug: string) => string[], id: ProductId): number[] {
  return unique(
    slugs
      .flatMap(cards)
      .map((slug) => id(slug) ?? fail(`card "${slug}" has no record — import the catalog first.`)),
  )
}

const icon = (path: string | undefined, where: string) => {
  if (!path) return null
  return isSvgPath(path) ? path : fail(`icon of ${where} is not an SVG path.`)
}

/** `stored`: the record's showroom, so films switched off by the check stay off. */
export function showroomData(
  brand: string,
  showroom: K31Showroom,
  videos: Record<string, K31SeriesVideo>,
  cards: (slug: string) => string[],
  id: ProductId,
  stored?: Pick<ShowroomData, 'videos'> | null,
): ShowroomData {
  // A film the weekly check switched off stays off: `active` belongs to the check (ADR-016).
  const inactive = new Set(
    (stored?.videos ?? []).filter((item) => item.active === false).map((item) => item.youtubeId),
  )
  const first = (slug: string | undefined) => (slug ? refs([slug], cards, id)[0] : null)
  return {
    h1: showroom.h1,
    lead: showroom.lead,
    heroProducts: refs(showroom.hero, cards, id),
    compareTitle: showroom.cmpTitle ?? null,
    wizardTitle: showroom.wizTitle ?? null,
    segments: showroom.segs.map((segment) => ({
      key: segment.id,
      name: segment.n,
      iconPath: icon(segment.ic, `${brand} / ${segment.n}`),
      series: segment.series.map((series) => ({
        name: series.n,
        tier: series.klasa ?? null,
        audience: series.dla ?? null,
        highlight: series.wyr ?? null,
        imageProduct: first(series.img),
        products: refs(series.prods, cards, id),
      })),
    })),
    wizard: showroom.wiz.map((question) => ({
      question: question.q,
      options: question.o.map((option) => ({ label: option.t, key: option.k })),
    })),
    wizardRules: showroom.wizRules.map((rule) => ({
      when: rule.when,
      series: rule.ser,
      why: rule.why,
      products: refs(rule.p, cards, id),
    })),
    services: showroom.svc.map((service) => ({
      title: service.t,
      description: service.d,
      iconPath: icon(service.ic, `${brand} / ${service.t}`),
    })),
    videos: Object.entries(videos).map(([series, video]) => ({
      series,
      youtubeId: isYoutubeId(video.id)
        ? video.id
        : fail(`film of ${brand} ${series}: "${video.id}".`),
      title: video.t,
      channel: video.k ?? null,
      active: !inactive.has(video.id),
    })),
  }
}

/**
 * Series of every card: the showroom tile that lists it wins over `seria_karty` (decision
 * 28.10 — Dell Pro Max), so the category's series filter (K31c) and the showroom agree.
 */
export function showroomSeries(
  seriesOfCard: Record<string, string>,
  showrooms: Record<string, Pick<K31Showroom, 'segs'>>,
): Record<string, string> {
  const result = { ...seriesOfCard }
  for (const showroom of Object.values(showrooms))
    for (const segment of showroom.segs)
      for (const series of segment.series) for (const slug of series.prods) result[slug] = series.n
  return result
}

/**
 * Cards whose series (`seria_karty`, set on the product by K31a-1) differs from the showroom
 * series that lists them — for the report; empty while `showroomSeries` sets the cards' series.
 */
export function seriesMismatches(
  showroom: K31Showroom,
  seriesOfCard: Record<string, string>,
): string[] {
  return showroom.segs.flatMap((segment) =>
    segment.series.flatMap((series) =>
      series.prods
        .filter((slug) => seriesOfCard[slug] && seriesOfCard[slug] !== series.n)
        .map((slug) => `${slug}: karta „${seriesOfCard[slug]}”, salon „${series.n}”`),
    ),
  )
}

export function floorPlanData(
  scene: K31Scene,
  order: number,
  svg: string,
  cards: (slug: string) => string[],
  id: ProductId,
): FloorPlanData {
  if (!isSafeSvg(svg)) fail(`floor plan "${scene.id}" (${scene.svg}) is not a safe SVG.`)
  return {
    name: scene.nazwa,
    slug: scene.id,
    title: scene.tytul,
    lead: scene.lead ?? null,
    iconPath: icon(scene.ikona_path, `plan ${scene.id}`),
    order,
    viewBox: scene.viewBox,
    svg: svg.trim(),
    points: scene.punkty.map((point) => ({
      x: point.x,
      y: point.y,
      // A split card on the plan: the card its old address leads to.
      product: refs([point.slug], cards, id)[0]!,
      label: point.etykieta,
      description: point.opis ?? null,
    })),
  }
}
