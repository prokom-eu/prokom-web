import { readFile } from 'fs/promises'
import path from 'path'
import type { Payload, Where } from 'payload'

import icons from '../../../seed/prokombiznes/ikony.json'
import katalog from '../../../seed/prokombiznes/katalog.json'
import k3Catalog from '../../../seed/prokombiznes/k3/katalog-k3.json'
import k3Dictionaries from '../../../seed/prokombiznes/k3/slowniki-k3.json'
import k3Media from '../../../seed/prokombiznes/k3/media-k3.json'
import k3Removed from '../../../seed/prokombiznes/k3/usuniete.json'
import kreator from '../../../seed/prokombiznes/kreator.json'
import media from '../../../seed/prokombiznes/media.json'
import gallery from '../../../seed/prokombiznes/media-produkty-v2.json'
import search from '../../../seed/prokombiznes/wyszukiwarka.json'
import { wizardFromSeed, wizardSchema } from '../../lib/catalog/wizard'
import { mapConcurrent } from '../concurrency'
import { parseGalleryLimit, SEED_CONTEXT } from '../config'
import {
  allowedBadge,
  k3CategoryData,
  k3CreateFields,
  k3GalleryFile,
  k3GalleryMediaData,
  k3ImageKeys,
  k3PartnerData,
  k3BrandNeedsRecord,
  k3ProductData,
  k3PublishStatus,
  k3Retired,
  matchCards,
  REPLACED_PRODUCTS,
  SKIPPED_INDUSTRIES,
  type K3Card,
  type K3Dictionaries,
  type K3RemovedCard,
  type K3Gallery,
} from './k3'
import {
  brandLogoFile,
  galleryFileName,
  galleryMediaData,
  groupData,
  industryData,
  isImportedFileName,
  mediaData,
  PREVIOUS_CATEGORY_SLUGS,
  productUpdateData,
  searchData,
  skipMediaFile,
  type SeedCatalog,
} from './map'
import { hasSameValues } from '../compare'
import { FOOTER_LEGAL_LINKS, FOOTER_TEXT, footerData } from './footer'
import { seedBiznesCategoryContent } from './category'
import { seedBiznesIndustries } from './industries'
import { seedBiznesNews } from './posts'
import { seedBiznesLegal } from './legal'
import { seedBiznesAbout } from './about'
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

type Counter = { created: number; updated: number; skipped: number }

/**
 * Imports the Biznes catalog into the local database (B2, local only). Products, categories and
 * brand pages come from the K3 package (`seed/prokombiznes/k3/`, K3-KATALOG §4); katalog v2
 * (`katalog.json`) still gives groups' order, industries, design images and what K3 lacks.
 * Idempotent: a record is found by its key (slug in the tenant, `legacyIds`, file name).
 * Groups, industries, images and settings are then left as they are.
 * Categories, brand pages and products: every field K3 provides wins over an edit made in the
 * panel — the record is updated when it differs, and only then (no new version on a re-run).
 * Panel fields K3 lacks (kind, popularity, badge, register type…) are written on create only.
 * The content status and check date only move forward (`productUpdateData`). Removed and
 * replaced cards are hidden (draft) with a 301 rule; nothing is deleted.
 */
export async function seedBiznesCatalog(payload: Payload): Promise<void> {
  const catalog: SeedCatalog = katalog
  const dictionaries: K3Dictionaries = k3Dictionaries
  const cards: K3Card[] = k3Catalog.produkty
  const removed: K3RemovedCard[] = k3Removed.produkty
  const k3Gallery: K3Gallery = k3Media.zdjecia
  const matches = matchCards(cards, catalog.produkty)
  const report: Record<string, string[]> = {}
  const note = (what: string, item: string) => (report[what] ??= []).push(item)
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
  for (const group of dictionaries.grupy) {
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
  for (const category of dictionaries.kategorie) {
    const groupId = groupIds.get(category.grupa)
    if (groupId === undefined) throw new Error(`Seed (Biznes): unknown group "${category.grupa}".`)
    const data = k3CategoryData(category, groupId, icons.kategoria_ikona)
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
    const id = await ensure('industries', { slug: { equals: data.slug } }, () =>
      payload.create({
        collection: 'industries',
        data: { ...data, tenant: tenant.id },
        ...local,
      }),
    )
    // Page seeds use the short slug of katalog v2, K3 cards the address.
    industryIds.set(industry.slug, id)
    industryIds.set(data.slug, id)
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

  // --- galleries: K3 photos (uploaded as `k3-<file>`), else katalog v2 or design files ---
  const imageKeys = new Map(
    cards.map((card) => [
      card.slug_seed,
      k3ImageKeys(card, k3Gallery, matches.get(card.slug_seed), media.pliki, galleryLimit),
    ]),
  )
  if (galleryLimit !== null) log(`gallery limited to ${galleryLimit} photos per product`)
  const { docs: storedMedia } = await payload.find({
    collection: 'media',
    where: { tenant: { equals: tenant.id } },
    pagination: false,
    select: { filename: true },
    ...local,
  })
  const storedId = (name: string) =>
    storedMedia.find((doc) => isImportedFileName(doc.filename, name))?.id

  // Katalog v2 gallery files still used by a card without K3 photos.
  const wantedV2 = new Set([...imageKeys.values()].flat())
  await mapConcurrent(
    gallery.pliki.filter((file) => wantedV2.has(file.plik)),
    GALLERY_UPLOADS_AT_ONCE,
    async (file) => {
      const existing = storedId(galleryFileName(file.plik))
      count('media (katalog v2)', existing === undefined)
      const id =
        existing ??
        (
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

  const k3Photos = cards.flatMap((card) =>
    (imageKeys.get(card.slug_seed) ?? []).flatMap((key) => {
      const file = k3GalleryFile(key)
      return file ? [{ card, key, ...file }] : []
    }),
  )
  await mapConcurrent(
    k3Photos,
    GALLERY_UPLOADS_AT_ONCE,
    async ({ card, key, filePath, uploadName }) => {
      const existing = storedId(uploadName)
      count('media (K3)', existing === undefined)
      if (existing !== undefined) {
        imageIds.set(key, existing)
        return
      }
      const data = await readFile(path.resolve(filePath))
      const created = await payload.create({
        collection: 'media',
        data: { ...k3GalleryMediaData(card, key, k3Gallery), tenant: tenant.id },
        file: { data, mimetype: 'image/webp', name: uploadName, size: data.length },
        ...local,
      })
      imageIds.set(key, created.id)
    },
  )

  // --- brands: shared `Partners`; K3 fills the brand page (`brandPage`, K3-KATALOG §6) ---
  const brandIds = new Map<string, number>()
  const findPartner = async (slug: string) =>
    (
      await payload.find({
        collection: 'partners',
        where: { slug: { equals: slug } },
        limit: 1,
        ...local,
      })
    ).docs[0]
  for (const [index, brand] of dictionaries.marki.entries()) {
    const existing = await findPartner(brand.slug)
    const { brandPage, website } = k3PartnerData(brand)
    if (!existing) {
      // No products and no page (Ingenico: a paragraph on the PolCard page) — no record.
      if (!k3BrandNeedsRecord(brand, cards)) {
        note('marki bez rekordu', brand.slug)
        continue
      }
      const v2Brand = catalog.marki.find((item) => item.slug === brand.slug)
      const logo = v2Brand ? brandLogoFile(v2Brand, media.pliki) : null
      const created = await payload.create({
        collection: 'partners',
        data: {
          name: brand.marka,
          slug: brand.slug,
          website,
          // Statuses (authorized service / partner) are [SZEF] facts, set in the panel.
          partnerStatus: 'none',
          tenants: [tenant.id],
          order: index,
          brandPage,
        },
        ...(logo && {
          filePath: path.resolve(logo.from === 'design' ? MEDIA_DIR : SEED_MEDIA_DIR, logo.file),
        }),
        ...local,
      })
      count('partners', true)
      brandIds.set(brand.marka, created.id)
      continue
    }
    const shownOn = (existing.tenants ?? []).map((item) =>
      typeof item === 'number' ? item : item.id,
    )
    if (!shownOn.includes(tenant.id)) {
      // A shared record of another line: a product saves only with a brand shown on Biznes.
      throw new Error(
        `Seed (Biznes): partner "${brand.slug}" is not on the Biznes line — add it in the panel.`,
      )
    }
    brandIds.set(brand.marka, existing.id)
    // The producer's site only while empty: the brand bar links there until K3b′.
    const update = { brandPage, ...(!existing.website && website ? { website } : {}) }
    const same = hasSameValues(existing, update)
    if (!same) {
      await payload.update({ collection: 'partners', id: existing.id, data: update, ...local })
    }
    count('partners', same ? false : 'updated')
  }
  // Page seeds name brands of katalog v2 (the same names as in K3).
  for (const brand of catalog.marki) {
    if (brandIds.has(brand.nazwa)) continue
    const existing = await findPartner(brand.slug)
    if (existing) brandIds.set(brand.nazwa, existing.id)
  }

  // --- products from K3: found by `legacyIds` (K3 ids + those of the katalog v2 product) ---
  // Ids by every key (short id, sheet id, slug_seed), for blocks that list products (B9b kits).
  const productIds = new Map<string, number>()
  const slugByKey = new Map<string, string>()
  const k3Keys = new Set<string>()
  // Paired cards first: the XL2 record gives up the sheet ids of XL2 A and B before those
  // cards look for a record by them.
  const paired = (card: K3Card) => (matches.has(card.slug_seed) ? 0 : 1)
  for (const card of [...cards].sort((a, b) => paired(a) - paired(b))) {
    const v2 = matches.get(card.slug_seed)
    const data = k3ProductData(
      card,
      v2,
      dictionaries,
      {
        brand: (name) => brandIds.get(name),
        category: (code) => categoryIds.get(code),
        industry: (slug) => industryIds.get(slug),
        image: (key) => imageIds.get(key),
      },
      imageKeys.get(card.slug_seed) ?? [],
    )
    const status = k3PublishStatus(card)
    if (card.branze.some((slug) => SKIPPED_INDUSTRIES.has(slug))) {
      note('branża pominięta (magazyn-produkcja)', card.slug_seed)
    }
    const { docs: found } = await payload.find({
      collection: 'products',
      where: inTenant({ legacyIds: { in: data.legacyIds } }),
      limit: 2,
      ...local,
    })
    if (found.length > 1) {
      throw new Error(`Seed (Biznes): card "${card.slug_seed}" matches ${found.length} records.`)
    }
    const [existing] = found
    let id: number
    if (!existing) {
      const created = await payload.create({
        collection: 'products',
        data: {
          ...data,
          ...k3CreateFields(card, v2, dictionaries),
          tenant: tenant.id,
          _status: status,
        },
        ...local,
      })
      id = created.id
      count('products', true)
    } else {
      id = existing.id
      const priceBadge = Boolean(existing.badge) && !allowedBadge(existing.badge)
      const update = {
        ...productUpdateData(data, existing),
        // A card waiting for the boss is a draft „Do sprawdzenia” (ADR-012 rozstrz. 15).
        ...(status === 'draft' ? { contentStatus: data.contentStatus } : {}),
        // A katalog v2 badge with a price goes (K3-KATALOG §10); other badges are the panel's.
        ...(priceBadge ? { badge: null } : {}),
      }
      if (update.contentStatus !== data.contentStatus) {
        note('status K3 nie zastosowany', card.slug_seed)
      }
      if (priceBadge) note('odznaka z ceną usunięta', card.slug_seed)
      const same = existing._status === status && hasSameValues(existing, update)
      if (!same) {
        await payload.update({
          collection: 'products',
          id: existing.id,
          data: { ...update, _status: status },
          ...local,
        })
      }
      count('products', same ? false : 'updated')
    }
    for (const key of data.legacyIds) {
      productIds.set(key, id)
      slugByKey.set(key, data.slug)
      k3Keys.add(key)
    }
  }

  // Page seeds may name a replaced product (`nas` on the noclegi page): its successor stands in.
  for (const [shortId, target] of Object.entries(REPLACED_PRODUCTS)) {
    if (!('product' in target) || productIds.has(shortId)) continue
    const id = productIds.get(target.product)
    const slug = slugByKey.get(target.product)
    if (id !== undefined) productIds.set(shortId, id)
    if (slug !== undefined) slugByKey.set(shortId, slug)
  }

  // --- removed and replaced cards: hidden (draft, records stay), old address → 301 ---
  const retired = k3Retired(cards, removed, catalog.produkty)
  for (const item of retired) {
    if (item.unpublish) {
      const {
        docs: [record],
      } = await payload.find({
        collection: 'products',
        where: inTenant({ legacyIds: { in: item.legacyIds } }),
        limit: 1,
        ...local,
      })
      const hide = record?._status === 'published'
      count('products hidden', hide)
      if (record && hide) {
        await payload.update({
          collection: 'products',
          id: record.id,
          data: { _status: 'draft' },
          ...local,
        })
      }
    }
    const {
      docs: [rule],
    } = await payload.find({
      collection: 'redirects',
      where: inTenant({ from: { equals: item.from } }),
      limit: 1,
      ...local,
    })
    count('redirects', !rule)
    if (!rule) {
      await payload.create({
        collection: 'redirects',
        data: { from: item.from, to: item.to, tenant: tenant.id },
        ...local,
      })
    } else if (rule.to !== item.to) {
      // A rule changed in the panel stays; the report shows it.
      note('301 zmienione w panelu', `${item.from} → ${rule.to}`)
    }
  }

  // Brands PRO-KOM no longer sells (Honeywell, StorageCraft): off the Biznes line, record kept.
  // After hiding their products: a product saves only with a brand shown on its line.
  for (const slug of dictionaries.marki_usuniete) {
    const existing = await findPartner(slug)
    const tenants = (existing?.tenants ?? []).map((item) =>
      typeof item === 'number' ? item : item.id,
    )
    const shown = tenants.includes(tenant.id)
    count('partners hidden', shown)
    if (existing && shown) {
      await payload.update({
        collection: 'partners',
        id: existing.id,
        data: { tenants: tenants.filter((id) => id !== tenant.id) },
        ...local,
      })
    }
  }
  // --- report: products of the tenant that neither K3 nor the retired list knows (§4 pkt 2) ---
  const retiredKeys = new Set(retired.flatMap((item) => item.legacyIds))
  const { docs: allProducts } = await payload.find({
    collection: 'products',
    where: { tenant: { equals: tenant.id } },
    pagination: false,
    select: { slug: true, legacyIds: true },
    ...local,
  })
  for (const product of allProducts) {
    const keys = product.legacyIds ?? []
    if (!keys.some((key) => k3Keys.has(key) || retiredKeys.has(key))) {
      note('bez dopasowania', product.slug)
    }
  }

  // --- search and wizard settings: one document per tenant ---
  const { totalDocs: settingsCount } = await payload.count({
    collection: 'biznes-settings',
    where: { tenant: { equals: tenant.id } },
    overrideAccess: true,
  })
  // Wizard proposals name products by their slug in the catalog (B10c).
  const wizard = wizardSchema.parse(wizardFromSeed(kreator, (shortId) => slugByKey.get(shortId)))
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

  // --- news (B11): the KSeF post from the board and the KSeF panel of the list ---
  await seedBiznesNews(payload, tenant.id, pageRefs, pageReport)

  // --- legal pages (B11b): privacy policy, cookies, accessibility (drafts to approve) ---
  await seedBiznesLegal(payload, tenant.id, pageReport)

  // --- about page (B11c) ---
  await seedBiznesAbout(payload, tenant.id, pageReport)

  for (const [collection, { created, updated, skipped }] of Object.entries(counters)) {
    log(`${collection}: ${created} created, ${updated} updated, ${skipped} unchanged.`)
  }
  for (const [what, items] of Object.entries(report)) {
    log(`report — ${what} (${items.length}): ${items.join(', ')}`)
  }
}
