import type { Payload } from 'payload'

/**
 * BIZ-3 §10.2 (audit 0611 P1-8): SEO titles and descriptions of the Biznes panel pages that
 * had none or a too short one. A title is the page's part before „ | PRO-KOM Biznes” (13–43
 * characters, 30–60 in all); a description 100–155. Written only into an empty field — a title
 * from the panel wins; a description also replaces one under 100 characters (seeded earlier).
 * TODO(krystian): teksty napisane w sesji BIZ-3 — do przeczytania w PR.
 */
export const PAGE_SEO: Record<string, { title?: string; description?: string }> = {
  'automaty-vendingowe': { title: 'Automaty vendingowe dla firm — Rabka' },
  cookies: { title: 'Pliki cookies na stronie prokombiznes.pl' },
  dostepnosc: {
    title: 'Deklaracja dostępności strony',
    description:
      'Deklaracja dostępności strony prokombiznes.pl: stan dostępności, znane ograniczenia i kontakt, gdy coś na stronie jest trudne w użyciu.',
  },
  gopos: { title: 'GoPOS dla gastronomii — wdrożenie w Rabce' },
  insert: { title: 'Programy InsERT dla firm i biur — Rabka' },
  kontakt: { title: 'Kontakt i dojazd — Rabka-Zdrój' },
  'o-firmie': { title: 'O firmie PRO-KOM — kasy i IT w Rabce' },
  'opieka-it': { title: 'Opieka IT dla firm na Podhalu' },
  'polityka-prywatnosci': {
    title: 'Polityka prywatności i dane osobowe',
    description:
      'Jak PRO-KOM Biznes przetwarza dane z formularzy i zapytań: kto jest administratorem, w jakim celu, jak długo i jakie masz prawa (RODO).',
  },
  'ulga-na-kase-fiskalna': { title: 'Ulga na kasę fiskalną — jak ją odliczyć' },
}

const DESCRIPTION_MIN = 100

type Stored = { title?: string | null; description?: string | null } | null | undefined

/** What the seed writes into a page's SEO group; `null` when nothing changes. */
export function nextPageSeo(
  slug: string,
  stored: Stored,
): { title?: string; description?: string } | null {
  const seed = PAGE_SEO[slug]
  if (!seed) return null
  const patch: { title?: string; description?: string } = {}
  if (seed.title && !stored?.title?.trim()) patch.title = seed.title
  const description = stored?.description?.trim() ?? ''
  if (seed.description && description.length < DESCRIPTION_MIN) {
    patch.description = seed.description
  }
  return Object.keys(patch).length > 0 ? patch : null
}

const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

export async function seedBiznesPageSeo(
  payload: Payload,
  tenantId: number,
  report: (name: string, changed: boolean) => void,
): Promise<void> {
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      and: [{ tenant: { equals: tenantId } }, { slug: { in: Object.keys(PAGE_SEO) } }],
    },
    limit: Object.keys(PAGE_SEO).length,
    ...local,
  })
  for (const page of docs) {
    const patch = nextPageSeo(page.slug, page.seo)
    report('pages SEO (BIZ-3)', patch !== null)
    if (!patch) continue
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { seo: { ...page.seo, ...patch } },
      ...local,
    })
  }
}
