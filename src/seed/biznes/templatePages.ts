import type { Payload } from 'payload'

import type { PageBlock } from './page'
import { upsertBiznesPage } from './page'

type Report = (name: string, changed: boolean) => void
type TemplateBlock = 'bzAboutPage' | 'bzContactPage'

const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

/** `/o-firmie` and `/kontakt` of Biznes on the shared templates (D3-B PR 2, plan 0611 §8.2). */
export const TEMPLATE_PAGES: {
  slug: string
  title: string
  description: string
  block: TemplateBlock
}[] = [
  {
    slug: 'o-firmie',
    title: 'O firmie',
    description:
      'PRO-KOM Tadeusz Wójciak z Rabki-Zdroju: od 2004 kasy, POS, programy i opieka IT dla firm z Podhala. Zasady, linie PRO-KOM, marki i dojazd.',
    block: 'bzAboutPage',
  },
  {
    slug: 'kontakt',
    title: 'Kontakt',
    description:
      'Kontakt z PRO-KOM w Rabce-Zdroju: telefon, e-mail i formularz. Oddzwaniamy w ciągu 60 minut w godzinach pracy. Dojazd na całe Podhale.',
    block: 'bzContactPage',
  },
]

/** Block types of the old K4 layouts of these pages (K4 sections, FAQ, the visit card). */
const K4_BLOCKS = new Set(['bzSection', 'faq', 'bzLocation'])

/**
 * The layout a template page should get, or `null` to leave it: a new page and the old K4 layout
 * (the seed's own block types only) get the template block alone; a page already on it or
 * edited in the panel (other blocks) stays.
 */
export function templateLayout(
  stored: readonly PageBlock[] | undefined,
  block: TemplateBlock,
): PageBlock[] | null {
  const fresh = [{ blockType: block }] as PageBlock[]
  if (!stored?.length) return fresh
  if (stored.some((item) => item.blockType === block)) return null
  return stored.every((item) => K4_BLOCKS.has(item.blockType)) ? fresh : null
}

/** Creates or moves `/o-firmie` and `/kontakt` to the shared templates (reports `pages <slug>`). */
export async function seedBiznesTemplatePages(
  payload: Payload,
  tenantId: number,
  report: Report,
): Promise<void> {
  for (const { slug, title, description, block } of TEMPLATE_PAGES) {
    const {
      docs: [page],
    } = await payload.find({
      collection: 'pages',
      where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }] },
      limit: 1,
      ...local,
    })
    const layout = templateLayout(page?.layout ?? undefined, block)
    if (!page) {
      await upsertBiznesPage(
        payload,
        tenantId,
        { slug, title, description, layout: layout! },
        report,
      )
      continue
    }
    report(`pages ${slug} template`, Boolean(layout))
    if (!layout) continue
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { layout, _status: page._status ?? 'published' },
      ...local,
    })
  }
}
