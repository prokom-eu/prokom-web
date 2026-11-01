import type { Payload } from 'payload'

import { HOME_SLUG } from '../../lib/pages/slug'
import { SOFTWARE_ABOUT_SLUG, SOFTWARE_ONE_FIRM_SLUG } from './about'
import { SOFTWARE_AUDIT_SLUG } from './audit'
import { SOFTWARE_CONTACT_SLUG } from './contact'
import { SOFTWARE_PRIVACY_SLUG } from './legal'
import { SOFTWARE_PRICING_SLUG } from './pricing'

type Count = (name: string, result: boolean | 'updated') => void
type Seo = { title?: string | null; description?: string | null }

// TODO(krystian): opisy meta do akceptacji przed produkcją (spec. §9: „opisy pisze Krystian”) —
// propozycje SW12 z tekstów plansz. Tytuł podstron bez „| PRO-KOM Software” (dokłada go szablon
// tytułu); strona główna leży w segmencie layoutu, którego szablon jej nie obejmuje — tytuł pełny.
/** Titles and descriptions of the Software pages kept in the panel (spec. §9). */
export const SOFTWARE_PAGE_SEO: Readonly<Record<string, Seo>> = {
  [HOME_SLUG]: {
    // ≤ 60 characters: longer titles are cut in results (audyt 01.11 P2).
    title: 'Strony i systemy dla firm — Rabka-Zdrój | PRO-KOM Software',
    description:
      'Strony internetowe, systemy dla firm i aplikacje z Rabki-Zdroju. Cena „od” i termin od razu, wycena na piśmie, opieka po starcie.',
  },
  [SOFTWARE_PRICING_SLUG]: {
    title: 'Cennik stron, systemów i opieki',
    description:
      'Ceny „od” stron, sklepów i systemów dla firm oraz poziomy opieki po starcie. Stała cena na piśmie przed rozpoczęciem pracy.',
  },
  [SOFTWARE_AUDIT_SLUG]: {
    description:
      'Darmowy audyt strony internetowej: szybkość, wygląd na telefonie i widoczność w Google. Lista poprawek prostym językiem, bez zobowiązań.',
  },
  [SOFTWARE_PRIVACY_SLUG]: {
    description:
      'Jak PRO-KOM Software przetwarza dane z formularzy i kreatora: kto jest administratorem, jak długo przechowujemy dane i jakie masz prawa.',
  },
  [SOFTWARE_CONTACT_SLUG]: {
    description:
      'Napisz albo zadzwoń do PRO-KOM Software w Rabce-Zdroju. Odpowiadamy w sprawie stron, systemów i aplikacji, wycena na piśmie.',
  },
  [SOFTWARE_ABOUT_SLUG]: {
    description:
      'PRO-KOM Software z Rabki-Zdroju: kto zbuduje Twoją stronę albo system, jak pracujemy i z czego budujemy.',
  },
  [SOFTWARE_ONE_FIRM_SLUG]: {
    description:
      'Strona, system, kasy, sieć i serwis od jednej firmy z Rabki-Zdroju. Jeden numer telefonu zamiast kilku dostawców.',
  },
}

/**
 * The SEO group to save, or `null` when nothing changes: the seed fills only empty fields, so a
 * title or description written in the panel stays.
 */
export function seoFill(current: Seo | null | undefined, seed: Seo): Seo | null {
  const next: Seo = { ...current }
  let changed = false
  for (const key of ['title', 'description'] as const) {
    if (seed[key] && !current?.[key]?.trim()) {
      next[key] = seed[key]
      changed = true
    }
  }
  return changed ? next : null
}

const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

/** Fills the empty SEO fields of the Software pages; run after the pages are created. */
export async function seedSoftwareSeo(payload: Payload, tenantId: number, count: Count) {
  for (const [slug, seed] of Object.entries(SOFTWARE_PAGE_SEO)) {
    const {
      docs: [page],
    } = await payload.find({
      collection: 'pages',
      where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }] },
      limit: 1,
      ...local,
    })
    if (!page) continue
    const seo = seoFill(page.seo, seed)
    count(`pages ${slug} seo`, seo ? 'updated' : false)
    if (!seo) continue
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { seo, _status: 'published' },
      ...local,
    })
  }
}
