import path from 'path'
import type { Payload, Where } from 'payload'

import icons from '../../../seed/prokombiznes/ikony.json'
import katalog from '../../../seed/prokombiznes/katalog.json'
import kreator from '../../../seed/prokombiznes/kreator.json'
import media from '../../../seed/prokombiznes/media.json'
import gallery from '../../../seed/prokombiznes/media-produkty-v2.json'
import search from '../../../seed/prokombiznes/wyszukiwarka.json'
import { wizardFromSeed, wizardSchema } from '../../lib/catalog/wizard'
import { mapConcurrent } from '../concurrency'
import { parseGalleryLimit } from '../config'
import {
  brandLogoFile,
  categoryData,
  galleryFileName,
  galleryFilesToImport,
  galleryMediaData,
  hasSameValues,
  groupData,
  industryData,
  isImportedFileName,
  mediaData,
  PREVIOUS_CATEGORY_SLUGS,
  productData,
  productLegacyIds,
  productUpdateData,
  searchData,
  skipMediaFile,
  slugFromName,
  type SeedCatalog,
} from './map'
import { FOOTER_LEGAL_LINKS, FOOTER_TEXT, footerData } from './footer'
import { seedBiznesCategoryContent } from './category'
import { seedBiznesIndustries } from './industries'
import { SERVICE_AREAS, seedBiznesContact } from './contact'
import { seedBiznesGopos } from './gopos'
import { seedBiznesInsert } from './insert'
import { seedBiznesOpiekaIt } from './opiekaIt'
import { seedBiznesHome } from './home'
import { navigationData } from './navigation'

/** Files of the design package, relative to the repo root (where `pnpm seed` runs). */
const MEDIA_DIR = path.join('docs', 'design', 'prokombiznes', 'boards', 'media')
/** Katalog v2 files: product galleries (`produkty/<slug>/`) and the logos of new brands. */
const SEED_MEDIA_DIR = path.join('seed', 'prokombiznes', 'media')
const BIZNES_TENANT_SLUG = 'biznes'
/** Gallery photos uploaded at once: resizing (sharp) is the slow part and uses several cores. */
const GALLERY_UPLOADS_AT_ONCE = 4

/**
 * The seed writes outside a Next.js request, where the catalog cache cannot be revalidated;
 * hooks see this flag and skip it (the cache expires on its own, `lib/catalog/data`).
 */
export const SEED_CONTEXT = { seed: true } as const

type Counter = { created: number; updated: number; skipped: number }

/**
 * Imports the Biznes catalog from `seed/prokombiznes/` into the local database (B2, local only).
 * Idempotent: a record is found by its key (slug in the tenant, `legacyIds`, file name).
 * Groups, industries, brands, images and settings are then left as they are.
 * Categories and products (katalog v2): every field the package provides wins over an edit made
 * in the panel (name, benefit, badge, images…) — the record is updated when it differs from the
 * package, and only then (no new version on a re-run). Fields the package does not provide
 * (descriptions, specs, hotspots, FAQ…) are never touched. The content status and check date
 * only move forward (`productUpdateData`).
 */
export async function seedBiznesCatalog(payload: Payload): Promise<void> {
  const catalog: SeedCatalog = katalog
  const galleryLimit = parseGalleryLimit(process.env.SEED_GALLERY_LIMIT)
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
  const count = (name: string, result: boolean | 'updated') => {
    const counter = (counters[name] ??= { created: 0, updated: 0, skipped: 0 })
    counter[result === 'updated' ? 'updated' : result ? 'created' : 'skipped'] += 1
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
    const slugs = [data.slug, ...(PREVIOUS_CATEGORY_SLUGS[data.slug] ?? [])]
    const {
      docs: [existing],
    } = await payload.find({
      collection: 'catalog-categories',
      where: inTenant({ slug: { in: slugs } }),
      limit: 1,
      ...local,
    })
    // Fields the package does not set (hero, FAQ…) are left out of `data`, so they survive.
    const full = { ...data, description: data.description ?? null }
    if (!existing) {
      const created = await payload.create({
        collection: 'catalog-categories',
        data: { ...full, tenant: tenant.id },
        ...local,
      })
      count('catalog-categories', true)
      categoryIds.set(category.slug, created.id)
    } else {
      const same = hasSameValues(existing, full)
      if (!same) {
        await payload.update({
          collection: 'catalog-categories',
          id: existing.id,
          data: full,
          ...local,
        })
      }
      count('catalog-categories', same ? false : 'updated')
      categoryIds.set(category.slug, existing.id)
    }
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

  // --- katalog v2 galleries: one query for the stored names, then create what is missing ---
  const { docs: storedMedia } = await payload.find({
    collection: 'media',
    where: { tenant: { equals: tenant.id } },
    pagination: false,
    select: { filename: true },
    ...local,
  })
  const wantedGallery = galleryFilesToImport(catalog.produkty, gallery.pliki, galleryLimit)
  if (galleryLimit !== null) log(`gallery limited to ${galleryLimit} photos per product`)
  await mapConcurrent(
    gallery.pliki.filter((file) => wantedGallery.has(file.plik)),
    GALLERY_UPLOADS_AT_ONCE,
    async (file) => {
      const name = galleryFileName(file.plik)
      const existing = storedMedia.find((doc) => isImportedFileName(doc.filename, name))
      count('media (katalog v2)', !existing)
      const id = existing
        ? existing.id
        : (
            await payload.create({
              collection: 'media',
              data: { ...galleryMediaData(file, catalog.produkty), tenant: tenant.id },
              filePath: path.resolve(SEED_MEDIA_DIR, file.plik),
              ...local,
            })
          ).id
      imageIds.set(file.plik, id)
    },
  )

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
    const logo = brandLogoFile(brand, media.pliki)
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
      ...(logo && {
        filePath: path.resolve(logo.from === 'design' ? MEDIA_DIR : SEED_MEDIA_DIR, logo.file),
      }),
      ...local,
    })
    brandIds.set(brand.nazwa, created.id)
  }

  // --- products, published; found by the short id or a sheet id, updated only on change ---
  // Ids by the package's short id (`d3`, `gopos`), for blocks that list products (B9b kits).
  const productIds = new Map<string, number>()
  for (const product of catalog.produkty) {
    const data = productData(
      product,
      catalog,
      media.pliki,
      {
        brand: (name) => brandIds.get(name),
        category: (slug) => categoryIds.get(slug),
        industry: (slug) => industryIds.get(slug),
        image: (file) => imageIds.get(file),
      },
      galleryLimit,
    )
    const { docs: found } = await payload.find({
      collection: 'products',
      where: inTenant({ legacyIds: { in: productLegacyIds(product) } }),
      limit: 2,
      ...local,
    })
    if (found.length > 1) {
      throw new Error(`Seed (Biznes): product "${product.slug}" matches ${found.length} records.`)
    }
    const [existing] = found
    if (!existing) {
      const created = await payload.create({
        collection: 'products',
        data: { ...data, tenant: tenant.id, _status: 'published' },
        ...local,
      })
      productIds.set(product.slug, created.id)
      count('products', true)
      continue
    }
    productIds.set(product.slug, existing.id)
    const update = productUpdateData(data, existing)
    const same = existing._status === 'published' && hasSameValues(existing, update)
    if (!same) {
      await payload.update({
        collection: 'products',
        id: existing.id,
        data: { ...update, _status: 'published' },
        ...local,
      })
    }
    count('products', same ? false : 'updated')
  }

  // --- search and wizard settings: one document per tenant ---
  const { totalDocs: settingsCount } = await payload.count({
    collection: 'biznes-settings',
    where: { tenant: { equals: tenant.id } },
    overrideAccess: true,
  })
  // Wizard proposals name products by their slug in the catalog (B10c).
  const productSlugs = new Map(
    catalog.produkty.map((product) => [product.slug, slugFromName(product.nazwa)]),
  )
  const wizard = wizardSchema.parse(wizardFromSeed(kreator, (shortId) => productSlugs.get(shortId)))
  count('biznes-settings', settingsCount === 0)
  if (settingsCount === 0) {
    await payload.create({
      collection: 'biznes-settings',
      data: { tenant: tenant.id, search: searchData(search), wizard },
      ...local,
    })
  } else {
    // Rules of an older format (before B10c) are replaced; valid ones belong to the panel.
    const {
      docs: [settings],
    } = await payload.find({
      collection: 'biznes-settings',
      where: { tenant: { equals: tenant.id } },
      limit: 1,
      ...local,
    })
    const outdated = settings && !wizardSchema.safeParse(settings.wizard).success
    count('biznes-settings wizard', outdated ? 'updated' : false)
    if (settings && outdated) {
      await payload.update({
        collection: 'biznes-settings',
        id: settings.id,
        data: { wizard },
        ...local,
      })
    }
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

  // --- WhatsApp: the line's own (sample) number, spec. §1 "ten sam numer na WhatsApp" ---
  if (siteSettings) {
    const current = await payload.findByID({
      collection: 'site-settings',
      id: siteSettings.id,
      ...local,
    })
    const whatsappMissing = !current.biznes?.whatsapp && Boolean(current.phone)
    count('site-settings whatsapp', whatsappMissing)
    if (whatsappMissing) {
      await payload.update({
        collection: 'site-settings',
        id: siteSettings.id,
        data: { biznes: { ...current.biznes, whatsapp: current.phone } },
        ...local,
      })
    }
  }

  // --- towns served (B8c): the footer and /kontakt list them ---
  if (siteSettings) {
    const current = await payload.findByID({
      collection: 'site-settings',
      id: siteSettings.id,
      ...local,
    })
    const areasMissing = !current.biznes?.serviceAreas?.length
    count('site-settings service areas', areasMissing)
    if (areasMissing) {
      await payload.update({
        collection: 'site-settings',
        id: siteSettings.id,
        data: { biznes: { ...current.biznes, serviceAreas: SERVICE_AREAS } },
        ...local,
      })
    }
  }

  // --- home page (B7): sections, department cards, the hero's trust line ---
  await seedBiznesHome(
    payload,
    tenant.id,
    groupIds,
    {
      image: (file) => imageIds.get(file),
      brand: (name) => brandIds.get(name),
      industry: (slug) => industryIds.get(slug),
    },
    (name, changed) => count(name, changed ? 'updated' : false),
  )

  // --- contact page (B8c): Biznes blocks instead of the sample ---
  await seedBiznesContact(payload, tenant.id, (name, changed) =>
    count(name, changed ? 'updated' : false),
  )

  // --- subpages from Biznes blocks (B9) ---
  await seedBiznesOpiekaIt(payload, tenant.id, (name, changed) =>
    count(name, changed ? 'updated' : false),
  )
  const pageRefs = {
    image: (file: string) => imageIds.get(file),
    brand: (name: string) => brandIds.get(name),
    product: (shortId: string) => productIds.get(shortId),
  }
  const pageReport = (name: string, changed: boolean) => count(name, changed ? 'updated' : false)
  await seedBiznesGopos(payload, tenant.id, pageRefs, pageReport)
  await seedBiznesInsert(payload, tenant.id, pageRefs, pageReport)

  // --- category page content (B10a): the cash registers from the board ---
  await seedBiznesCategoryContent(payload, tenant.id, pageRefs.product, pageReport)

  // --- industry pages (B10b): gastronomia from the board, drafts of handel and noclegi ---
  await seedBiznesIndustries(payload, tenant.id, pageRefs, pageReport)

  for (const [collection, { created, updated, skipped }] of Object.entries(counters)) {
    log(`${collection}: ${created} created, ${updated} updated, ${skipped} unchanged.`)
  }
}
