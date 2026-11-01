import type { Payload, Where } from 'payload'

import { SETTINGS_DEFAULTS } from '../../lib/instalacje/options'
import { hasSameValues } from '../compare'
import { SEED_CONTEXT } from '../config'
import { lineSettingsUpdate, siteContactUpdate } from './contact'
import { FORM_PAGE_BLOCKS, needsFormBlock } from './formPages'
import { seedInstalacjeGuide } from './guide'
import { LEGAL_LINKS, seedInstalacjeLegal } from './legal'
import { seedInstalacjeHome } from './home'
import { SERVICE_PAGE_KEYS } from './servicePages'
import {
  archNewsToImport,
  objectData,
  objectsToImport,
  pagesToImport,
  realizationsToImport,
  serviceData,
  servicesToImport,
  solutionsToImport,
  type Refs,
} from './map'

const INSTALACJE_TENANT_SLUG = 'instalacje'

type Counter = { created: number; updated: number; skipped: number }

/**
 * Imports the Instalacje package (`seed/prokominstalacje/`, v4.0) into the local database (I2,
 * local only, like `seed:software`). Idempotent: a record is found by its key in the tenant
 * (`key` of a service or object, `legacyId` of a solution or realization, `slug` of a page) and
 * written only when it differs from the package, so a re-run makes no new versions.
 * - Services, objects, offer: every field the package provides wins over an edit in the panel;
 *   published. Services and objects point at each other, so missing ones are created first.
 * - Realizations: the clients agreed (boss 01.11.2026) — created published with the consent. A
 *   draft of an older seed (no consent, still exactly the package) is published; one an editor
 *   changed (texts, consent taken back) stays as it is — then they belong to the panel.
 * - Pages: missing ones as empty drafts with title and SEO (blocks come with their sessions);
 *   an existing page is never touched — except home, which gets its `instHome` block (I5).
 * - Settings: created while missing, then they belong to the panel. The line's real phone and
 *   e-mail (`SiteSettings`), WhatsApp and the architects' contact person replace only the sample
 *   or an empty field (`./contact`).
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
  const tenantId = tenant.id
  const inTenant = (where: Where): Where => ({ and: [{ tenant: { equals: tenantId } }, where] })

  const counters: Record<string, Counter> = {}
  const count = (name: string, result: 'created' | 'updated' | 'skipped') => {
    const counter = (counters[name] ??= { created: 0, updated: 0, skipped: 0 })
    counter[result] += 1
  }

  // --- settings ---
  const { totalDocs: settingsCount } = await payload.count({
    collection: 'instalacje-settings',
    where: { tenant: { equals: tenantId } },
    overrideAccess: true,
    context: SEED_CONTEXT,
  })
  if (settingsCount === 0) {
    // No prices, 24-month warranty, 24 h answer (spec §2).
    await payload.create({
      collection: 'instalacje-settings',
      data: { tenant: tenantId, showPrices: false, ...SETTINGS_DEFAULTS },
      ...local,
    })
  }
  count('instalacje-settings', settingsCount === 0 ? 'created' : 'skipped')

  // --- the line's contact (boss 01.11.2026): only over the sample or an empty field ---
  const {
    docs: [lineSettings],
  } = await payload.find({
    collection: 'instalacje-settings',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    ...local,
  })
  const lineUpdate = lineSettings ? lineSettingsUpdate(lineSettings) : null
  if (lineSettings && lineUpdate) {
    await payload.update({
      collection: 'instalacje-settings',
      id: lineSettings.id,
      data: lineUpdate,
      ...local,
    })
  }
  count('instalacje-settings contact', lineUpdate ? 'updated' : 'skipped')

  const {
    docs: [siteSettings],
  } = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    ...local,
  })
  const siteUpdate = siteSettings ? siteContactUpdate(siteSettings) : null
  // I13: the footer's legal links while the panel has none (the sample settings have none).
  const footer =
    siteSettings && !siteSettings.footer?.links?.length
      ? { ...siteSettings.footer, links: LEGAL_LINKS }
      : null
  if (siteSettings && (siteUpdate || footer)) {
    await payload.update({
      collection: 'site-settings',
      id: siteSettings.id,
      data: { ...siteUpdate, ...(footer && { footer }) },
      ...local,
    })
  }
  count('site-settings contact', siteUpdate || footer ? 'updated' : 'skipped')

  // --- services and objects: ids first, then full data with the relations ---
  const services = servicesToImport()
  const objects = objectsToImport()
  const noRefs: Refs = { service: () => undefined, object: () => undefined }
  const created = new Set<string>()

  async function idsByKey(collection: 'inst-services' | 'inst-objects') {
    const { docs } = await payload.find({
      collection,
      where: { tenant: { equals: tenantId } },
      limit: 100,
      draft: true,
      ...local,
    })
    return new Map<string, number>(docs.map((doc) => [doc.key, doc.id]))
  }

  let serviceIds = await idsByKey('inst-services')
  for (const item of services) {
    if (serviceIds.has(item.menu.k)) continue
    await payload.create({
      collection: 'inst-services',
      data: { ...serviceData(item, noRefs), tenant: tenantId, _status: 'published' },
      ...local,
    })
    created.add(`service:${item.menu.k}`)
    count('inst-services', 'created')
  }
  let objectIds = await idsByKey('inst-objects')
  for (const item of objects) {
    if (objectIds.has(item.page.k)) continue
    await payload.create({
      collection: 'inst-objects',
      data: { ...objectData(item, noRefs), tenant: tenantId, _status: 'published' },
      ...local,
    })
    created.add(`object:${item.page.k}`)
    count('inst-objects', 'created')
  }
  serviceIds = await idsByKey('inst-services')
  objectIds = await idsByKey('inst-objects')
  const refs: Refs = { service: (key) => serviceIds.get(key), object: (key) => objectIds.get(key) }

  /** Writes `data` as published when the stored record differs (or is not published). */
  async function publishIfChanged(
    collection: 'inst-services' | 'inst-objects' | 'inst-solutions' | 'inst-arch-news',
    id: number,
    data: object,
  ): Promise<boolean> {
    const existing = await payload.findByID({ collection, id, draft: true, ...local })
    if (existing._status === 'published' && hasSameValues(existing, data)) return false
    await payload.update({ collection, id, data: { ...data, _status: 'published' }, ...local })
    return true
  }

  // Records created above got their relations here: they still count as created.
  for (const item of services) {
    const id = serviceIds.get(item.menu.k)
    if (id === undefined) throw new Error(`Seed (Instalacje): service "${item.menu.k}" missing.`)
    const changed = await publishIfChanged('inst-services', id, serviceData(item, refs))
    if (!created.has(`service:${item.menu.k}`)) {
      count('inst-services', changed ? 'updated' : 'skipped')
    }
  }
  for (const item of objects) {
    const id = objectIds.get(item.page.k)
    if (id === undefined) throw new Error(`Seed (Instalacje): object "${item.page.k}" missing.`)
    const changed = await publishIfChanged('inst-objects', id, objectData(item, refs))
    if (!created.has(`object:${item.page.k}`)) {
      count('inst-objects', changed ? 'updated' : 'skipped')
    }
  }

  // --- offer ---
  for (const item of solutionsToImport()) {
    const service = refs.service(item.serviceKey)
    if (service === undefined)
      throw new Error(
        `Seed (Instalacje): no service "${item.serviceKey}" for solution ${item.legacyId}.`,
      )
    const data = { ...item.data, legacyId: item.legacyId, service }
    const {
      docs: [existing],
    } = await payload.find({
      collection: 'inst-solutions',
      where: inTenant({ legacyId: { equals: item.legacyId } }),
      limit: 1,
      draft: true,
      ...local,
    })
    if (!existing) {
      await payload.create({
        collection: 'inst-solutions',
        data: { ...data, tenant: tenantId, _status: 'published' },
        ...local,
      })
      count('inst-solutions', 'created')
    } else {
      const changed = await publishIfChanged('inst-solutions', existing.id, data)
      count('inst-solutions', changed ? 'updated' : 'skipped')
    }
  }

  // --- architects' „Nowe rozwiązania” (I16b): confirmed cards published, the package wins;
  // cards waiting for the boss (`internalNote`) created as drafts once, then left to the panel ---
  for (const item of archNewsToImport()) {
    const {
      docs: [existing],
    } = await payload.find({
      collection: 'inst-arch-news',
      where: inTenant({ legacyId: { equals: item.legacyId } }),
      limit: 1,
      draft: true,
      ...local,
    })
    if (!existing) {
      await payload.create({
        collection: 'inst-arch-news',
        data: { ...item.data, tenant: tenantId, _status: item.draft ? 'draft' : 'published' },
        draft: item.draft,
        ...local,
      })
      count('inst-arch-news', 'created')
    } else if (item.draft) {
      count('inst-arch-news', 'skipped')
    } else {
      const changed = await publishIfChanged('inst-arch-news', existing.id, item.data)
      count('inst-arch-news', changed ? 'updated' : 'skipped')
    }
  }

  // --- realizations: published with the clients' consent (boss 01.11.2026) ---
  for (const data of realizationsToImport()) {
    const {
      docs: [existing],
    } = await payload.find({
      collection: 'realizations',
      where: inTenant({ legacyId: { equals: data.legacyId } }),
      limit: 1,
      draft: true,
      ...local,
    })
    if (!existing) {
      await payload.create({
        collection: 'realizations',
        data: { ...data, tenant: tenantId, _status: 'published' },
        ...local,
      })
      count('realizations', 'created')
    } else if (
      existing._status !== 'published' &&
      hasSameValues(existing, { ...data, clientConsent: false })
    ) {
      // A draft of an older seed, untouched in the panel: published with the consent. The whole
      // package record goes with it, so nothing of the draft is lost.
      await payload.update({
        collection: 'realizations',
        id: existing.id,
        data: { ...data, _status: 'published' },
        ...local,
      })
      count('realizations', 'updated')
    } else if (existing._status === 'published' && (!existing.kind || !existing.services?.length)) {
      // I12: the filters of /realizacje (new fields) — only while the panel left them empty.
      await payload.update({
        collection: 'realizations',
        id: existing.id,
        data: {
          ...(!existing.kind && { kind: data.kind }),
          ...(!existing.services?.length && { services: data.services }),
        },
        ...local,
      })
      count('realizations', 'updated')
    } else {
      count('realizations', 'skipped')
    }
  }

  // --- guide posts (I12): `/poradnik/<slug>`, created while missing ---
  await seedInstalacjeGuide(payload, tenantId, count)

  // --- legal pages (I13): created while missing, then they belong to the panel ---
  await seedInstalacjeLegal(payload, tenantId, count)

  // --- home page (I5): the `instHome` block and SEO, also over the sample page ---
  await seedInstalacjeHome(payload, tenantId, count)

  // --- pages: missing ones as empty drafts with title and SEO; existing ones untouched ---
  // `kontakt` of an older `pnpm seed` is its sample page; the form pages below replace it (I11).
  for (const page of pagesToImport()) {
    const { totalDocs } = await payload.count({
      collection: 'pages',
      where: inTenant({ slug: { equals: page.slug } }),
      overrideAccess: true,
      context: SEED_CONTEXT,
    })
    if (totalDocs === 0) {
      await payload.create({
        collection: 'pages',
        data: {
          title: page.title,
          seo: page.seo,
          slug: page.slug,
          layout: [],
          tenant: tenantId,
          _status: 'draft',
        },
        draft: true,
        ...local,
      })
    }
    count('pages', totalDocs === 0 ? 'created' : 'skipped')
  }

  // --- service pages built in code (I4+): an empty page gets its `instService` block once and
  // is published (local seed only); a page an editor already laid out is left alone ---
  for (const key of SERVICE_PAGE_KEYS) {
    const service = services.find((item) => item.menu.k === key)
    const serviceId = serviceIds.get(key)
    if (!service || serviceId === undefined) continue
    const { docs } = await payload.find({
      collection: 'pages',
      where: inTenant({ slug: { equals: serviceData(service, noRefs).slug } }),
      draft: true,
      limit: 1,
      ...local,
    })
    const page = docs[0]
    if (!page || (page.layout ?? []).length > 0) {
      count('service-pages', 'skipped')
      continue
    }
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { layout: [{ blockType: 'instService', service: serviceId }], _status: 'published' },
      ...local,
    })
    count('service-pages', 'updated')
  }

  // --- form pages built in code (I11): a page without a block of the line (empty, or the sample
  // `kontakt` of `pnpm seed`) gets its block and the package's SEO once and is published; a page
  // with the line's block (laid out in the panel) is left alone ---
  const pageSeo = new Map(pagesToImport().map((page) => [page.slug, page.seo]))
  for (const [slug, block] of Object.entries(FORM_PAGE_BLOCKS)) {
    const { docs } = await payload.find({
      collection: 'pages',
      where: inTenant({ slug: { equals: slug } }),
      draft: true,
      limit: 1,
      ...local,
    })
    const page = docs[0]
    if (!page || !needsFormBlock(page.layout)) {
      count('form-pages', 'skipped')
      continue
    }
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { layout: [block()], seo: pageSeo.get(slug), _status: 'published' },
      ...local,
    })
    count('form-pages', 'updated')
  }

  for (const [name, c] of Object.entries(counters)) {
    log(`${name}: ${c.created} created, ${c.updated} updated, ${c.skipped} unchanged.`)
  }
}
