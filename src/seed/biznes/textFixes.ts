import type { Payload } from 'payload'

import { SEED_CONTEXT } from '../config'
import { BIZNES_CONTACT } from './contact'

/**
 * Wording corrected after a page was seeded. The seed never rewrites the blocks of an existing
 * page (`mergeLayout`), so without this the old contact stayed in local and staging databases.
 * Only these exact phrases change; everything else edited in the panel stays as it is.
 */
export const TEXT_FIXES: readonly (readonly [from: string, to: string])[] = [
  // Contact data of the line — decision of 01.11.2026 (`contact.ts`).
  ['biznes@pro-kom.eu', BIZNES_CONTACT.email],
  ['biuro@pro-kom.eu', BIZNES_CONTACT.email],
  ['18 267 65 11', BIZNES_CONTACT.phone2],
  ['tel:+48182676511', BIZNES_CONTACT.phone2Href],
  // K4-FINAL §1: „ustalamy w umowie”, never „zapisujemy w umowie” (audit of 01.11.2026).
  ['Zapisujemy go w umowie', 'Ustalamy go w umowie'],
  ['zapisujemy w umowie', 'ustalamy w umowie'],
  ['zapisanym w umowie', 'ustalonym w umowie'],
  ['zapisany w umowie', 'ustalony w umowie'],
  ['zapisane w umowie', 'ustalone w umowie'],
]

/** `value` with every fix applied to each string inside it (objects and arrays copied). */
export function fixTexts<T>(value: T): T {
  if (typeof value === 'string') {
    const fixed = TEXT_FIXES.reduce<string>((text, [from, to]) => text.split(from).join(to), value)
    return fixed as T
  }
  if (Array.isArray(value)) return value.map((item: unknown) => fixTexts(item)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, fixTexts(item)]),
    ) as T
  }
  return value
}

type Report = (name: string, changed: boolean) => void

/** Applies `TEXT_FIXES` to the layouts of the line's pages; a page is saved only when it changed. */
export async function seedBiznesTextFixes(
  payload: Payload,
  tenantId: number,
  report: Report,
): Promise<void> {
  const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const
  const { docs } = await payload.find({
    collection: 'pages',
    where: { tenant: { equals: tenantId } },
    limit: 0,
    pagination: false,
    ...local,
  })
  for (const page of docs) {
    const layout = fixTexts(page.layout)
    const changed = JSON.stringify(layout) !== JSON.stringify(page.layout)
    report('pages text fixes', changed)
    if (changed) {
      await payload.update({ collection: 'pages', id: page.id, data: { layout }, ...local })
    }
  }
}
