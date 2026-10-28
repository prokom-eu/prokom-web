import type { Partner } from '@/payload-types'

import { tenantIdOf } from '../tenant/id'
import { normalizeText } from './normalize'
import type { ProductVideo } from './product'

/**
 * Showroom of a brand (K31-ZMIANY §5, spec. §6.11, K31c): segments → series → cards, the
 * comparison of series, the wizard in 3 questions, films of series and services. Data from
 * `Partners.showroom` only; products as slugs, joined with the catalog index on the page.
 */

type Showroom = NonNullable<Partner['showroom']>

export type ShowroomSeries = {
  name: string
  /** `?seria=<slug>` in the category (K31c). */
  slug: string
  tier: string | null
  audience: string | null
  highlight: string | null
  /** Card whose photo the tile shows; `null` → the segment's icon (never another series' photo). */
  image: string | null
  products: string[]
}

export type ShowroomSegment = {
  key: string
  name: string
  /** SVG path of a 24 × 24 stroked icon, or `null`. */
  icon: string | null
  series: ShowroomSeries[]
}

export type ShowroomRule = { when: string[]; series: string; why: string; products: string[] }

export type ShowroomVideo = ProductVideo & { series: string }

export type ShowroomView = {
  h1: string | null
  lead: string | null
  hero: string[]
  compareTitle: string | null
  wizardTitle: string | null
  segments: ShowroomSegment[]
  wizard: { question: string; options: { label: string; key: string }[] }[]
  rules: ShowroomRule[]
  services: { title: string; icon: string | null; description: string }[]
  videos: ShowroomVideo[]
}

const text = (value: string | null | undefined) => value?.trim() || null

/** `?seria=` value: „ThinkPad T i X13” → `thinkpad-t-i-x13`. */
export const seriesSlug = (name: string) =>
  normalizeText(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Slugs of populated products of this site; ids (not populated) and other sites are left out. */
function slugsOf(values: readonly unknown[] | null | undefined, tenantId: number): string[] {
  const slugs = (values ?? []).flatMap((value) => {
    if (typeof value !== 'object' || value === null) return []
    const { slug, tenant } = value as { slug?: unknown; tenant?: unknown }
    return typeof slug === 'string' && tenantIdOf(tenant) === tenantId ? [slug] : []
  })
  return [...new Set(slugs)]
}

/**
 * Showroom of a partner on one tenant — or `null`: no showroom, no segment, or not a brand of
 * this site (`Partners` is shared, read with `overrideAccess`). Product relations come
 * populated with their slug and tenant (`getShowroomView`).
 */
export function buildShowroomView(
  partner: Pick<Partner, 'tenants' | 'showroom'>,
  tenantId: number,
): ShowroomView | null {
  const showroom: Showroom | null | undefined = partner.showroom
  const ownTenant = partner.tenants?.some((tenant) => tenantIdOf(tenant) === tenantId)
  if (!showroom || !ownTenant) return null
  const segments = (showroom.segments ?? []).map((segment) => ({
    key: segment.key,
    name: segment.name.trim(),
    icon: text(segment.iconPath),
    series: (segment.series ?? []).map((series) => ({
      name: series.name.trim(),
      slug: seriesSlug(series.name),
      tier: text(series.tier),
      audience: text(series.audience),
      highlight: text(series.highlight),
      image: slugsOf([series.imageProduct], tenantId)[0] ?? null,
      products: slugsOf(series.products, tenantId),
    })),
  }))
  if (segments.length === 0) return null
  return {
    h1: text(showroom.h1),
    lead: text(showroom.lead),
    hero: slugsOf(showroom.heroProducts, tenantId),
    compareTitle: text(showroom.compareTitle),
    wizardTitle: text(showroom.wizardTitle),
    segments,
    wizard: (showroom.wizard ?? []).flatMap(({ question, options }) => {
      const list = (options ?? []).map(({ label, key }) => ({ label, key }))
      return list.length >= 2 ? [{ question, options: list }] : []
    }),
    rules: (showroom.wizardRules ?? []).map((rule) => ({
      when: rule.when ?? [],
      series: rule.series.trim(),
      why: rule.why.trim(),
      products: slugsOf(rule.products, tenantId),
    })),
    services: (showroom.services ?? []).map(({ title, iconPath, description }) => ({
      title,
      icon: text(iconPath),
      description,
    })),
    videos: (showroom.videos ?? [])
      .filter((video) => video.active !== false)
      .map((video) => ({
        series: video.series.trim(),
        id: video.youtubeId,
        title: video.title,
        channel: text(video.channel),
        lang: text(video.lang),
      })),
  }
}

/**
 * The showroom with only the cards listed on the site (published, of this tenant): a series
 * without cards and a segment without series disappear; `null` when nothing is left.
 */
export function listShowroom(view: ShowroomView, listed: ReadonlySet<string>): ShowroomView | null {
  const keep = (slugs: string[]) => slugs.filter((slug) => listed.has(slug))
  const segments = view.segments
    .map((segment) => ({
      ...segment,
      series: segment.series
        .map((series) => ({
          ...series,
          image: series.image && listed.has(series.image) ? series.image : null,
          products: keep(series.products),
        }))
        .filter((series) => series.products.length > 0),
    }))
    .filter((segment) => segment.series.length > 0)
  if (segments.length === 0) return null
  return {
    ...view,
    hero: keep(view.hero),
    segments,
    rules: view.rules.map((rule) => ({ ...rule, products: keep(rule.products) })),
  }
}

/** Counters of the hero: cards, series and segments. */
export function showroomStats(view: ShowroomView) {
  const series = view.segments.flatMap((segment) => segment.series)
  return {
    products: new Set(series.flatMap((item) => item.products)).size,
    series: series.length,
    segments: view.segments.length,
  }
}

/** Rule of the wizard: the first whose keys are all among the answers; else the last one. */
export function pickWizardRule(
  rules: readonly ShowroomRule[],
  answers: readonly string[],
): ShowroomRule | null {
  return (
    rules.find((rule) => rule.when.every((key) => answers.includes(key))) ?? rules.at(-1) ?? null
  )
}

/** Columns of the series tiles: up to 6 in one row (at least 3), more in two rows. */
export const seriesColumns = (count: number) =>
  count <= 6 ? Math.max(count, 3) : Math.ceil(count / 2)

/** Film of the first of `series` (chosen series first) that has one, else the first film. */
export function seriesVideo(
  videos: readonly ShowroomVideo[],
  series: readonly string[],
): ShowroomVideo | null {
  for (const name of series) {
    const video = videos.find((item) => item.series === name)
    if (video) return video
  }
  return videos[0] ?? null
}
