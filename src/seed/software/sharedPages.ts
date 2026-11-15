import type { Payload } from 'payload'

import { upsertSoftwarePage } from './page'

type Count = (name: string, result: boolean | 'updated') => void

export const SOFTWARE_CONTACT_SLUG = 'kontakt'
export const SOFTWARE_ABOUT_SLUG = 'o-firmie'
/** v23 page, retired in SWA5b: its content is the „Pięć linii” section of O firmie (`#linie`). */
export const SOFTWARE_ONE_FIRM_PATH = '/jedna-firma'
export const SOFTWARE_ONE_FIRM_TARGET = '/o-firmie#linie'

/** SWA14 §4.4: the reports became the company dashboard — the old page answers 301. */
export const SOFTWARE_RENAMED_PATHS: readonly { from: string; to: string }[] = [
  { from: '/rozwiazania/raporty-dla-szefa', to: '/rozwiazania/pulpit-firmy' },
]

const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

/**
 * `/kontakt` and `/o-firmie` on the shared templates (SWA5b): one `swSharedPage` block each, the
 * texts in `SiteSettings.shared`. A page without that block (the v23 layout after the migration,
 * the sample page of `pnpm seed`) gets it; after that the page belongs to the panel.
 * `/jedna-firma` → 301 to O firmie `#linie` (decision D2), its page removed.
 */
export async function seedSoftwareSharedPages(payload: Payload, tenantId: number, count: Count) {
  for (const page of [
    { slug: SOFTWARE_CONTACT_SLUG, title: 'Kontakt', template: 'contact' as const },
    { slug: SOFTWARE_ABOUT_SLUG, title: 'O firmie', template: 'about' as const },
  ]) {
    await upsertSoftwarePage(
      payload,
      tenantId,
      {
        slug: page.slug,
        title: page.title,
        block: 'swSharedPage',
        layout: () => [{ blockType: 'swSharedPage', template: page.template }],
      },
      count,
    )
  }

  const inTenant = { tenant: { equals: tenantId } }
  for (const { from, to } of [
    { from: SOFTWARE_ONE_FIRM_PATH, to: SOFTWARE_ONE_FIRM_TARGET },
    ...SOFTWARE_RENAMED_PATHS,
  ]) {
    const {
      docs: [rule],
    } = await payload.find({
      collection: 'redirects',
      where: { and: [inTenant, { from: { equals: from } }] },
      limit: 1,
      ...local,
    })
    if (!rule) {
      await payload.create({
        collection: 'redirects',
        data: { from, to, tenant: tenantId },
        ...local,
      })
    }
    count('redirects', !rule)
  }

  const { docs: oldPages } = await payload.find({
    collection: 'pages',
    where: { and: [inTenant, { slug: { equals: SOFTWARE_ONE_FIRM_PATH.slice(1) } }] },
    limit: 1,
    ...local,
  })
  for (const old of oldPages) {
    await payload.delete({ collection: 'pages', id: old.id, ...local })
  }
  count('pages jedna-firma (usunięta)', oldPages.length > 0 ? 'updated' : false)
}
