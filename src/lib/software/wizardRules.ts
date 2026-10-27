import type { Payload } from 'payload'

import { type SoftwareWizard, softwareWizardSchema } from './wizard'

/**
 * Valid wizard rules of a Software tenant (`SoftwareSettings.wizard`) — or `null`: none saved
 * yet, or of the pre-SW7 shape. Server-side read (`overrideAccess`) for the page and the inquiry.
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
