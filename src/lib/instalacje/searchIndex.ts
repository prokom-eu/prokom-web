import type { IconName } from '@/lib/shared/icons'
import type { LineSearchEntry } from '@/lib/shared/search/lineProvider'

import type { ServiceKey } from '../../sites/instalacje/dane/types'

import type { InstMenu } from './menu'

/** What the index of the Instalacje search window is made of (all public, from the panel). */
export type InstSearchSources = {
  menu: InstMenu
  offer: readonly {
    name: string
    href: string | null
    solutions: readonly { name: string; description: string; categories: readonly string[] }[]
  }[]
  posts: readonly { slug: string; title: string; href: string; category: string | null }[]
  realizations: readonly { id: number; title: string; place: string | null; scope: string | null }[]
  pages: readonly { label: string; href: string; caption?: string | null }[]
  faq: readonly { question: string; answer: string }[]
}

/**
 * Runda v6 §1.5: each service its own icon in the search window (it showed the same shield for all).
 * The window draws the shared set (`lib/shared/icons`), which has no camera, antenna or speaker of
 * the line's own icons — the nearest shared drawing for each.
 */
export const SERVICE_SEARCH_ICONS: Record<ServiceKey, IconName> = {
  kam: 'monitor',
  alarm: 'bell',
  kd: 'key',
  wifi: 'server',
  tel: 'plug',
  ant: 'globe',
  smart: 'home',
  snd: 'mega',
  scr: 'site',
  ev: 'bolt',
}

/** Longer texts only help the matching; the window shows the title and the hint. */
const clip = (text: string | null | undefined, max = 160) =>
  text ? (text.length > max ? `${text.slice(0, max)}…` : text) : null

/**
 * Index of the shared search window on prokominstalacje.pl (spec §5.1, L1-I): services, objects,
 * the 76 solutions, guide posts, realizations, pages and the home FAQ — in that group order, built
 * on the server from published data, so a draft never shows up. Small by design (titles, a hint
 * and a clipped text), well under the 50 KB gzip budget.
 */
export function buildInstSearchIndex(sources: InstSearchSources): LineSearchEntry[] {
  const services = sources.menu.services.flatMap((column) =>
    column.items.map((item): LineSearchEntry => ({
      id: `usluga-${item.key}`,
      title: item.label,
      hint: item.caption ?? column.label,
      href: item.href,
      icon: SERVICE_SEARCH_ICONS[item.key as ServiceKey] ?? 'doc',
      group: 'Usługi',
      popularity: 80,
    })),
  )
  const objects = sources.menu.objects.flatMap((column) =>
    column.items.map((item): LineSearchEntry => ({
      id: `obiekt-${item.key}`,
      title: item.label,
      hint: item.caption ?? column.label,
      href: item.href,
      icon: 'home',
      group: 'Dla kogo',
      popularity: 70,
    })),
  )
  const solutions = sources.offer.flatMap((area) =>
    area.solutions.map((solution, index): LineSearchEntry => ({
      id: `rozwiazanie-${area.href ?? 'oferta'}-${index}`,
      title: solution.name,
      hint: area.name,
      href: area.href ?? '/uslugi',
      icon: 'check',
      group: 'Rozwiązania',
      text: clip([solution.description, ...solution.categories].join(' ')),
      popularity: 40,
    })),
  )
  const posts = sources.posts.map((post): LineSearchEntry => ({
    id: `poradnik-${post.slug}`,
    title: post.title,
    hint: post.category ? `Poradnik · ${post.category}` : 'Poradnik',
    href: post.href,
    icon: 'doc',
    group: 'Poradnik',
    popularity: 30,
  }))
  const realizations = sources.realizations.map((realization): LineSearchEntry => ({
    id: `realizacja-${realization.id}`,
    title: realization.title,
    hint: realization.place ?? 'Realizacja',
    href: '/realizacje',
    icon: 'star',
    group: 'Realizacje',
    text: clip(realization.scope),
    popularity: 20,
  }))
  const pages = sources.pages.map((page): LineSearchEntry => ({
    id: `strona-${page.href}`,
    title: page.label,
    hint: page.caption ?? null,
    href: page.href,
    icon: 'arrow',
    group: 'Strony',
    popularity: 60,
  }))
  const faq = sources.faq.map((item, index): LineSearchEntry => ({
    id: `pytanie-${index}`,
    title: item.question,
    hint: 'Najczęstsze pytania',
    href: '/#faq',
    icon: 'q',
    group: 'Pytania',
    text: clip(item.answer),
    popularity: 10,
  }))
  // One entry per address and title: a page in two lists (e.g. „Pełna oferta”) shows once.
  const seen = new Set<string>()
  return [
    ...services,
    ...objects,
    ...solutions,
    ...posts,
    ...realizations,
    ...pages,
    ...faq,
  ].filter((entry) => {
    const key = `${entry.href}|${entry.title}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
