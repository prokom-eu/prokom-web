import type { Payload } from 'payload'

import { type SoftwareWizard, softwareWizardSchema } from './schema'

/**
 * Valid wizard rules of a Software tenant (`SoftwareSettings.wizard`) — or `null`: none saved
 * yet, or of an older shape (before v3 — the migration `swa3_kreator_v3` rewrites it). Server-side read (`overrideAccess`) for the page and the inquiry.
 */
export async function readSoftwareWizard(
  payload: Payload,
  tenantId: number,
): Promise<SoftwareWizard | null> {
  const { docs } = await payload.find({
    collection: 'software-settings',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    depth: 0,
    select: { wizard: true },
    overrideAccess: true,
  })
  const parsed = softwareWizardSchema.safeParse(docs[0]?.wizard)
  return parsed.success ? parsed.data : null
}
