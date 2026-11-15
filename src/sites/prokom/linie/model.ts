import type { HubServiceView } from '@/lib/prokom/data'
import type { HubLine } from '@/lib/prokom/lines'
import { isHubLinkLive, type HubPageFlags } from '@/lib/prokom/pages'
import { normalizeText } from '@/lib/shared/search/normalize'

import type { HomeLine } from '../home/model'

export type Audience = 'firma' | 'dom'

/** One line in the catalog: its contact (panel), audience and first steps (`home.lines.scene`). */
export type OfferLine = {
  key: HubLine
  name: string
  label: string
  short: string
  domain: string | null
  url: string | null
  phone: string | null
  tel: string | null
  promise: string | null
  who: string
  steps: { title: string; text: string }[]
  tool: { title: string; url: string | null } | null
  count: number
}

/** A service as the catalog shows it, with its call to action already resolved. */
export type OfferService = {
  key: string
  line: HubLine
  title: string
  short: string
  long: string | null
  audience: HubServiceView['audience']
  includes: string[]
  related: string[]
  /** Normalized words the text search looks in. */
  words: string
  cta: { label: string; href: string } | null
}

/**
 * The call to action of a service (spec §6.2, ADR-H002 §3): its own `url` and `ctaLabel` (the
 * import points b11, b12 to `/inwestycje-i-dostawy`, i10 to `/wspolpraca`); a hub page that is
 * still off, or no address at all, falls back to the line's site with the line's own CTA.
 */
export function serviceCta(
  service: Pick<HubServiceView, 'url' | 'ctaLabel'>,
  line: Pick<HomeLine, 'url'> & { cta: string },
  pages: HubPageFlags,
): { label: string; href: string } | null {
  if (service.url && isHubLinkLive(service.url, pages)) {
    return { label: service.ctaLabel ?? line.cta, href: service.url }
  }
  return line.url ? { label: line.cta, href: line.url } : null
}

/** Lines and services of the catalog — only lines on the page, services in the panel's order. */
export function offerData(
  lines: readonly HomeLine[],
  services: readonly HubServiceView[],
  pages: HubPageFlags,
): { lines: OfferLine[]; services: OfferService[] } {
  const shown = services.filter((service) => lines.some((line) => line.key === service.line))
  return {
    lines: lines.map((line) => ({
      key: line.key,
      name: line.name,
      label: line.label,
      short: line.hero.short,
      domain: line.domain,
      url: line.url,
      phone: line.phone,
      tel: line.tel,
      promise: line.promise,
      who: line.scene.who,
      steps: line.scene.steps,
      tool: line.tools[0] ?? null,
      count: shown.filter((service) => service.line === line.key).length,
    })),
    services: shown.map((service) => {
      const line = lines.find((entry) => entry.key === service.line)
      return {
        key: service.key,
        line: service.line,
        title: service.title,
        short: service.short,
        long: service.long,
        audience: service.audience,
        includes: service.includes,
        related: service.related.filter((key) => shown.some((entry) => entry.key === key)),
        words: normalizeText(
          [
            service.title,
            service.short,
            service.long ?? '',
            service.keywords ?? '',
            ...service.includes,
          ].join(' '),
        ),
        cta: line ? serviceCta(service, { url: line.url, cta: line.scene.cta }, pages) : null,
      }
    }),
  }
}

export type OfferFilter = { q: string; audience: Audience | null; line: HubLine | null }

/** Services matching every word of the phrase, the audience (a „both” service fits each) and the line. */
export function filterServices(
  services: readonly OfferService[],
  filter: OfferFilter,
): OfferService[] {
  const words = normalizeText(filter.q).split(/\s+/).filter(Boolean)
  return services.filter(
    (service) =>
      (!filter.line || service.line === filter.line) &&
      (!filter.audience || service.audience === filter.audience || service.audience === 'oba') &&
      words.every((word) => service.words.includes(word)),
  )
}

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? ''

/** `?q=&dla=&linia=&u=` of `/linie` — unknown values are ignored, never an error. */
export function parseOfferParams(
  params: Record<string, string | string[] | undefined>,
  lines: readonly HubLine[],
  keys: readonly string[],
): OfferFilter & { selected: string | null } {
  const audience = first(params.dla)
  const line = first(params.linia)
  const selected = first(params.u)
  return {
    q: first(params.q).trim().slice(0, 80),
    audience: audience === 'firma' || audience === 'dom' ? audience : null,
    line: (lines as readonly string[]).includes(line) ? (line as HubLine) : null,
    selected: keys.includes(selected) ? selected : null,
  }
}

/**
 * The query string of a catalog state, for the address bar (`?u=b11` can be sent to someone).
 * Other parameters of the address (`utm_*`) stay as they were.
 */
export function offerQuery(filter: OfferFilter, selected: string | null, current = ''): string {
  const params = new URLSearchParams(current)
  for (const name of ['q', 'dla', 'linia', 'u']) params.delete(name)
  if (filter.q) params.set('q', filter.q)
  if (filter.audience) params.set('dla', filter.audience)
  if (filter.line) params.set('linia', filter.line)
  if (selected) params.set('u', selected)
  const query = params.toString()
  return query ? `?${query}` : ''
}
