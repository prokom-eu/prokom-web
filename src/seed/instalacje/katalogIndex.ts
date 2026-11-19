/**
 * `pnpm seed:instalacje-katalog` — only the catalog of Instalacje (INST-K1/K2, ADR-029): its
 * departments, categories, brands (shared `partners`, the tenant added), photos, cards, salons and
 * the home „Najczęściej wybierane” when empty — plus the offer's solutions the panel lacks
 * (streaming, 77–79), created only, never changed. Nothing else of the live line is touched: its
 * pages, services, objects, texts and settings stay as edited in the panel. On production through
 * `scripts/prod-line-content.sh instalacje-katalog` (runbook §3a); locally `pnpm seed:instalacje`
 * runs the same catalog step. Needs the tenant `instalacje` and an up-to-date schema.
 */
import { getPayload } from 'payload'

import config from '../../payload.config'
import { assertSeedAllowed, SEED_CONTEXT } from '../config'
import { seedInstalacjeCatalog } from './katalog'
import { solutionsToImport } from './map'
import { missingSolutions } from './missingSolutions'

assertSeedAllowed(process.env.NODE_ENV)

const payload = await getPayload({ config })
const log = (message: string) => payload.logger.info(`Seed (Instalacje katalog): ${message}`)
const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const
try {
  const {
    docs: [tenant],
  } = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: 'instalacje' } },
    limit: 1,
    ...local,
  })
  if (!tenant) throw new Error('Seed (Instalacje katalog): no tenant "instalacje".')

  await seedInstalacjeCatalog(payload, tenant.id)

  const inTenant = { tenant: { equals: tenant.id } }
  const [solutions, services] = await Promise.all([
    payload.find({
      collection: 'inst-solutions',
      where: inTenant,
      limit: 0,
      pagination: false,
      draft: true,
      select: { legacyId: true },
      ...local,
    }),
    payload.find({
      collection: 'inst-services',
      pagination: false,
      where: inTenant,
      limit: 100,
      draft: true,
      ...local,
    }),
  ])
  const stored = new Set(solutions.docs.flatMap((doc) => (doc.legacyId ? [doc.legacyId] : [])))
  const serviceIds = new Map(services.docs.map((doc) => [doc.key, doc.id]))
  const missing = missingSolutions(solutionsToImport(), stored)
  if (missing.length) log(`inst-solutions to create: ${missing.map((i) => i.legacyId).join(', ')}`)
  for (const item of missing) {
    const service = serviceIds.get(item.serviceKey)
    if (service === undefined) {
      throw new Error(`Seed (Instalacje katalog): no service "${item.serviceKey}" in the panel.`)
    }
    await payload.create({
      collection: 'inst-solutions',
      data: {
        ...item.data,
        legacyId: item.legacyId,
        service,
        tenant: tenant.id,
        _status: 'published',
      },
      ...local,
    })
  }
  log(`inst-solutions: ${missing.length} created, the rest already in the panel (not changed).`)
} finally {
  await payload.destroy()
}
