import type { City } from '@/payload-types'

import { tenantIdOf } from '../tenant/id'

/**
 * City pages of the Software line `/miejscowosci/[miasto]` (spec. §6.9, ADR-014 §1.5, board
 * `Miasto`). Only an active city with its own hero text is a page: anything else is 404 and
 * not in the sitemap (no doorway pages). Prices of the „Dla kogo” cards come from the linked
 * solutions — only those of the same tenant.
 */

export const CITIES_PATH = '/miejscowosci'

export function cityHref(slug: string): string {
  return `${CITIES_PATH}/${encodeURIComponent(slug)}`
}

type Link = { label: string; href: string }

export type CityView = {
  slug: string
  name: string
  /** „z Rabki-Zdroju” — section eyebrows („Firmy z Rabki-Zdroju”). */
  locative: string | null
  hero: {
    eyebrow: string | null
    title: string
    titleAccent: string | null
    lead: string
    ctas: Link[]
    badges: { title: string; text: string | null }[]
  }
  who: {
    title: string | null
    lead: string | null
    items: { name: string; text: string | null; cta: string | null; solution: string | null }[]
  }
  local: { title: string | null; items: { title: string; text: string | null }[] }
  faq: { question: string; answer: string }[]
  nearby: string[]
  cta: { title: string | null; text: string | null; buttons: Link[] }
  seo: { title: string | null; description: string | null }
}

const text = (value: string | null | undefined) => value?.trim() || null

const links = (rows: readonly { link: { label: string; href: string } }[] | null | undefined) =>
  (rows ?? []).map(({ link }) => ({ label: link.label, href: link.href }))

export function buildCityView(city: City, tenantId: number): CityView | null {
  const title = text(city.hero?.title)
  const lead = text(city.hero?.lead)
  if (!city.active || !title || !lead) return null
  return {
    slug: city.slug,
    name: city.name,
    locative: text(city.locative),
    hero: {
      eyebrow: text(city.hero?.eyebrow),
      title,
      titleAccent: text(city.hero?.titleAccent),
      lead,
      ctas: links(city.hero?.ctas),
      badges: (city.hero?.badges ?? []).map((badge) => ({
        title: badge.title,
        text: text(badge.text),
      })),
    },
    who: {
      title: text(city.who?.title),
      lead: text(city.who?.lead),
      items: (city.who?.items ?? []).map((item) => ({
        name: item.name,
        text: text(item.text),
        cta: text(item.cta),
        solution:
          typeof item.solution === 'object' &&
          item.solution !== null &&
          tenantIdOf(item.solution.tenant) === tenantId
            ? item.solution.slug
            : null,
      })),
    },
    local: {
      title: text(city.local?.title),
      items: (city.local?.items ?? []).map((item) => ({
        title: item.title,
        text: text(item.text),
      })),
    },
    faq: (city.faq ?? []).map(({ question, answer }) => ({ question, answer })),
    nearby: (city.nearby ?? []).map((name) => name.trim()).filter(Boolean),
    cta: {
      title: text(city.cta?.title),
      text: text(city.cta?.text),
      buttons: links(city.cta?.buttons),
    },
    seo: { title: text(city.seo?.title), description: text(city.seo?.description) },
  }
}
