import path from 'path'
import type { Payload, Where } from 'payload'

import icons from '../../../seed/prokombiznes/ikony.json'
import katalog from '../../../seed/prokombiznes/katalog.json'
import kreator from '../../../seed/prokombiznes/kreator.json'
import media from '../../../seed/prokombiznes/media.json'
import search from '../../../seed/prokombiznes/wyszukiwarka.json'
import { wizardFromSeed, wizardSchema } from '../../lib/catalog/wizard'
import {
  categoryData,
  groupData,
  industryData,
  isImportedFileName,
  mediaData,
  productData,
  searchData,
  skipMediaFile,
  type SeedCatalog,
} from './map'
import { FOOTER_LEGAL_LINKS, FOOTER_TEXT, footerData } from './footer'
import { navigationData } from './navigation'

/** Files of the design package, relative to the repo root (where `pnpm seed` runs). */
const MEDIA_DIR = path.join('docs', 'design', 'prokombiznes', 'boards', 'media')
const BIZNES_TENANT_SLUG = 'biznes'

/**
 * The seed writes outside a Next.js request, where the catalog cache cannot be revalidated;
 * hooks see this flag and skip it (the cache expires on its own, `lib/catalog/data`).
 */
export const SEED_CONTEXT = { seed: true } as const

type Counter = { created: number; skipped: number }

/**
 * Imports the Biznes catalog from `seed/prokombiznes/` into the local database (B2, local only).
 * Idempotent: a record found by its key (slug in the tenant, `legacyId`, file name) is left as
 * it is — edits made in the panel survive another `pnpm seed`.
 */
export async function seedBiznesCatalog(payload: Payload): Promise<void> {
  const catalog: SeedCatalog = katalog
  const log = (message: string) => payload.logger.info(`Seed (Biznes): ${message}`)
  const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const

  const {
    docs: [tenant],
  } = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: BIZNES_TENANT_SLUG } },
    limit: 1,
    ...local,
  })
  if (!tenant) throw new Error('Seed (Biznes): tenant "biznes" missing — run `pnpm seed` first.')
  const inTenant = (where: Where): Where => ({ and: [{ tenant: { equals: tenant.id } }, where] })

  const counters: Record<string, Counter> = {}
  const count = (name: string, created: boolean) => {
    const counter = (counters[name] ??= { created: 0, skipped: 0 })
    counter[created ? 'created' : 'skipped'] += 1
  }

  // Each step: find by key → keep, otherwise create. Returns the id either way.
  async function ensure(
    collection: 'catalog-groups' | 'catalog-categories' | 'industries' | 'products',
    where: Where,
    create: () => Promise<{ id: number }>,
  ): Promise<number> {
    const {
      docs: [existing],
    } = await payload.find({ collection, where: inTenant(where), limit: 1, ...local })
    count(collection, !existing)
    return existing ? existing.id : (await create()).id
  }

  // --- groups, categories, industries ---
  const groupIds = new Map<string, number>()
  for (const group of catalog.grupy) {
    const data = groupData(group)
    groupIds.set(
      group.slug,
      await ensure('catalog-groups', { slug: { equals: data.slug } }, () =>
        payload.create({
          collection: 'catalog-groups',
          data: { ...data, tenant: tenant.id },
          ...local,
        }),
      ),
    )
  }

  const categoryIds = new Map<string, number>()
  for (const category of catalog.kategorie) {
    const groupId = groupIds.get(category.grupa)
    if (groupId === undefined) throw new Error(`Seed (Biznes): unknown group "${category.grupa}".`)
    const data = categoryData(category, groupId, icons.kategoria_ikona)
    categoryIds.set(
      category.slug,
      await ensure('catalog-categories', { slug: { equals: data.slug } }, () =>
        payload.create({
          collection: 'catalog-categories',
          data: { ...data, tenant: tenant.id },
          ...local,
        }),
      ),
    )
  }

  const industryIds = new Map<string, number>()
  for (const [index, industry] of catalog.branze.entries()) {
    const data = industryData(industry, index)
    industryIds.set(
      industry.slug,
      await ensure('industries', { slug: { equals: data.slug } }, () =>
        payload.create({
          collection: 'industries',
          data: { ...data, tenant: tenant.id },
          ...local,
        }),
      ),
    )
  }

  // --- images of the site (brand logos go to partners below) ---
  // Found by the file name Payload gave it: `x.webp`, or `x-1.webp` when `x.webp` was already
  // on disk (a database reset keeps `media/`) or used by another site — not by `alt` or
  // `source`, which the panel may change.
  const imageIds = new Map<string, number>()
  for (const file of media.pliki) {
    if (skipMediaFile(file)) continue
    const { docs: candidates } = await payload.find({
      collection: 'media',
      where: inTenant({ filename: { like: path.parse(file.plik).name } }),
      limit: 50,
      ...local,
    })
    const existing = candidates.find((doc) => isImportedFileName(doc.filename, file.plik))
    count('media', !existing)
    const id = existing
      ? existing.id
      : (
          await payload.create({
            collection: 'media',
            data: { ...mediaData(file, catalog.produkty), tenant: tenant.id },
            filePath: path.resolve(MEDIA_DIR, file.plik),
            ...local,
          })
        ).id
    imageIds.set(file.plik, id)
  }

  // --- brands: shared `Partners`, shown on the Biznes site; a brand without a logo has no file ---
  const brandIds = new Map<string, number>()
  for (const [index, brand] of catalog.marki.entries()) {
    const {
      docs: [existing],
    } = await payload.find({
      collection: 'partners',
      where: { slug: { equals: brand.slug } },
      limit: 1,
      ...local,
    })
    count('partners', !existing)
    if (existing) {
      brandIds.set(brand.nazwa, existing.id)
      continue
    }
    const logo = media.pliki.find(
      (file) => file.rola === 'logo marki' && file.klucz === brand.nazwa,
    )
    const created = await payload.create({
      collection: 'partners',
      data: {
        name: brand.nazwa,
        slug: brand.slug,
        // Statuses (authorized service / partner) are [SZEF] facts, set in the panel.
        partnerStatus: 'none',
        tenants: [tenant.id],
        order: index,
      },
      ...(logo && { filePath: path.resolve(MEDIA_DIR, logo.plik) }),
      ...local,
    })
    brandIds.set(brand.nazwa, created.id)
  }

  // --- products, published (local data for B3–B10) ---
  for (const product of catalog.produkty) {
    await ensure('products', { legacyId: { equals: product.slug } }, () =>
      payload.create({
        collection: 'products',
        data: {
          ...productData(product, catalog, media.pliki, {
            brand: (name) => brandIds.get(name),
            category: (slug) => categoryIds.get(slug),
            industry: (slug) => industryIds.get(slug),
            image: (file) => imageIds.get(file),
          }),
          tenant: tenant.id,
          _status: 'published',
        },
        ...local,
      }),
    )
  }

  // --- search and wizard settings: one document per tenant ---
  const { totalDocs: settingsCount } = await payload.count({
    collection: 'biznes-settings',
    where: { tenant: { equals: tenant.id } },
    overrideAccess: true,
  })
  count('biznes-settings', settingsCount === 0)
  if (settingsCount === 0) {
    await payload.create({
      collection: 'biznes-settings',
      data: {
        tenant: tenant.id,
        search: searchData(search),
        wizard: wizardSchema.parse(wizardFromSeed(kreator)),
      },
      ...local,
    })
  }

  // --- header navigation in the site settings (created by `pnpm seed`), only while empty ---
  const {
    docs: [siteSettings],
  } = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: tenant.id } },
    limit: 1,
    ...local,
  })
  if (!siteSettings) {
    log('site-settings navigation: skipped — no settings of the tenant yet, run `pnpm seed`.')
  }
  const navigationMissing = Boolean(siteSettings && !siteSettings.biznes?.navigation?.menu?.length)
  if (siteSettings) count('site-settings navigation', navigationMissing)
  if (siteSettings && navigationMissing) {
    await payload.update({
      collection: 'site-settings',
      id: siteSettings.id,
      data: {
        biznes: {
          ...siteSettings.biznes,
          navigation: navigationData({
            group: (slug) => groupIds.get(slug),
            industry: (slug) => industryIds.get(slug),
            partner: (name) => brandIds.get(name),
            image: (file) => imageIds.get(file),
          }),
        },
      },
      ...local,
    })
  }

  // --- footer columns, the same way: only while the first column is empty ---
  const footerMissing = Boolean(siteSettings && !siteSettings.biznes?.footer?.important?.length)
  if (siteSettings) count('site-settings footer', footerMissing)
  if (siteSettings && footerMissing) {
    const activeIndustries = catalog.branze
      .map((industry, index) => industryData(industry, index))
      .filter((industry) => industry.active)
    // Read again: the navigation update above may have changed the document.
    const current = await payload.findByID({
      collection: 'site-settings',
      id: siteSettings.id,
      ...local,
    })
    await payload.update({
      collection: 'site-settings',
      id: siteSettings.id,
      data: {
        footer: {
          text: FOOTER_TEXT,
          links: current.footer?.links?.length ? current.footer.links : FOOTER_LEGAL_LINKS,
        },
        biznes: { ...current.biznes, footer: footerData(activeIndustries) },
      },
      ...local,
    })
  }

  for (const [collection, { created, skipped }] of Object.entries(counters)) {
    log(`${collection}: ${created} created, ${skipped} already there.`)
  }
}
