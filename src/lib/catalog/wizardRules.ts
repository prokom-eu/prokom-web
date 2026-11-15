import type { Payload } from 'payload'

import { wizardSchema, type Wizard } from './wizard'

/**
 * Valid wizard rules of a tenant (`BiznesSettings.wizard`) — or `null`: none saved yet, or of an
 * older format. Server-side read (`overrideAccess`) for the page and for the inquiry.
 */
export async function readWizardRules(payload: Payload, tenantId: number): Promise<Wizard | null> {
  const { docs } = await payload.find({
    collection: 'biznes-settings',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    depth: 0,
    select: { wizard: true },
    overrideAccess: true,
  })
  const parsed = wizardSchema.safeParse(docs[0]?.wizard)
  return parsed.success ? parsed.data : null
}
