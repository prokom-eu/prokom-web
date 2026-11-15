import type { Payload } from 'payload'

import { SEED_CONTEXT } from '../config'

/**
 * 301 redirects from the old pro-kom.eu to the new hub (spec §4, ADR-H001 pkt 8, ADR-006). The
 * mechanism is the shared one: `Redirects` per tenant, applied by `proxy.ts` before the pages.
 *
 * TODO(krystian): lista adresów starej pro-kom.eu (stare repo + sitemap) → cel na nowej stronie;
 * wpisy tu albo w panelu (Przekierowania, tenant `prokom`) przed przełączeniem domeny. Każdy wpis
 * dostanie test e2e 301 (H6-2 etap 2). Na razie pusto — nie zgaduję starych adresów.
 */
export const PROKOM_REDIRECTS: readonly { from: string; to: string }[] = []

type Count = (name: string, result: 'created' | 'updated' | 'skipped') => void

/** A rule by its source; one changed in the panel stays (the panel wins after the first import). */
export async function seedProkomRedirects(payload: Payload, tenantId: number, count: Count) {
  const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const
  for (const { from, to } of PROKOM_REDIRECTS) {
    const { totalDocs } = await payload.count({
      collection: 'redirects',
      where: { and: [{ tenant: { equals: tenantId } }, { from: { equals: from } }] },
      overrideAccess: true,
    })
    if (totalDocs > 0) {
      count('redirects', 'skipped')
      continue
    }
    await payload.create({
      collection: 'redirects',
      data: { from, to, tenant: tenantId },
      ...local,
    })
    count('redirects', 'created')
  }
}
