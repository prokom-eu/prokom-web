import type { Payload } from 'payload'

import { SETTINGS_DEFAULTS } from '../../lib/instalacje/options'
import { SEED_CONTEXT } from '../config'

const INSTALACJE_TENANT_SLUG = 'instalacje'

/**
 * Imports the Instalacje package (`seed/prokominstalacje/`) into the local database (I2, local
 * only, like `seed:software`). Idempotent. So far only the settings document of the line, with
 * its defaults, created while missing — then it belongs to the panel. Services, objects, offer
 * and realizations follow in `inst/i2-model` (ADR-I002 §5).
 */
export async function seedInstalacje(payload: Payload): Promise<void> {
  const log = (message: string) => payload.logger.info(`Seed (Instalacje): ${message}`)
  const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const

  const {
    docs: [tenant],
  } = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: INSTALACJE_TENANT_SLUG } },
    limit: 1,
    ...local,
  })
  if (!tenant) throw new Error('Seed (Instalacje): tenant "instalacje" missing — run `pnpm seed`.')

  const { totalDocs } = await payload.count({
    collection: 'instalacje-settings',
    where: { tenant: { equals: tenant.id } },
    overrideAccess: true,
    context: SEED_CONTEXT,
  })
  if (totalDocs > 0) {
    log('instalacje-settings: already set, skipped.')
    return
  }
  // No prices, 24-month warranty, 24 h answer (spec §2).
  await payload.create({
    collection: 'instalacje-settings',
    data: { tenant: tenant.id, showPrices: false, ...SETTINGS_DEFAULTS },
    ...local,
  })
  log('instalacje-settings: created.')
}
