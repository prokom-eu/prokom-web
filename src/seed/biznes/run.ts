import { readFile } from 'fs/promises'
import path from 'path'
import type { Payload, Where } from 'payload'

import icons from '../../../seed/prokombiznes/ikony.json'
import katalog from '../../../seed/prokombiznes/katalog.json'
import k3Dictionaries from '../../../seed/prokombiznes/k3/slowniki-k3.json'
import k3Removed from '../../../seed/prokombiznes/k3/usuniete.json'
import k3Bundles from '../../../seed/prokombiznes/k3/zestawy.json'
import k4Catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import k4Brands from '../../../seed/prokombiznes/k4/marki-k4.json'
import k4PlansFile from '../../../seed/prokombiznes/k4/plany-k4.json'
import k4BundlesFile from '../../../seed/prokombiznes/k4/zestawy-k4.json'
import k4HomeFile from '../../../seed/prokombiznes/k4/strona-glowna-k4.json'
import k4SalonsFile from '../../../seed/prokombiznes/k4/salony-k4.json'
import k4SlugMap from '../../../seed/prokombiznes/k4/mapa-slugow-k4.json'
import k4Slowniki from '../../../seed/prokombiznes/k4/slowniki-k4.json'
import kreator from '../../../seed/prokombiznes/kreator.json'
import media from '../../../seed/prokombiznes/media.json'
import gallery from '../../../seed/prokombiznes/media-produkty-v2.json'
import search from '../../../seed/prokombiznes/wyszukiwarka.json'
import { wizardFromSeed, wizardSchema } from '../../lib/catalog/wizard'
import { mapConcurrent } from '../concurrency'
import { parseGalleryLimit, SEED_CONTEXT } from '../config'
import {
  allowedBadge,
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
  SUBCATEGORY_PAGES,
  type K3RemovedCard,
} from './k3'
import { k31Dictionaries, k31ProductFields, k31Retired, type K31Card } from './k31'
import {
  k4Aliases,
  k4BrandRecord,
  k4ColorKeys,
  k4Colors,
  k4ImageKeys,
  k4NewCards,
  k4PhotoFile,
  k4PhotoMediaData,
  k4ProductFields,
  k4Relations,
  k4SlugRedirects,
  withK4Content,
  type K4Card,
} from './k4Catalog'
import {
  k4CardPlacement,
  k4CategoryData,
  k4CategoryIcons,
  k4CategoryRedirects,
  k4Dictionaries,
  isRetiredTarget,
} from './k4Categories'
import {
  K31_DIR,
  k31Scenes,
  k31Series,
  k31SeriesVideos,
  k31Showrooms,
  k31Videos,
  loadK31Catalog,
} from './k31Data'
import { cardsOf, floorPlanData, seriesMismatches, showroomData } from './k31Plans'
import { bundleData, nextBundleStatus, sceneBundles, type K3Bundle } from './k3Bundles'
import {
  hasK4Logo,
  k4BrandSettings,
  k4LogoUpload,
  k4PartnerFields,
  readK4Logo,
  type K4BrandsFile,
} from './k4Brands'
import { k4ShowroomData, type K4Showroom } from './k4Showrooms'
import { k4Bundle, k4Scene, k4ServiceSlugs, type K4Bundle, type K4Scene } from './k4Plans'
import { K4_FEATURED, k4CategoryOrder, k4GroupProducts, k4HomeProductFields } from './k4Home'
import {
  brandLogoFile,
  galleryFileName,
  galleryMediaData,
  groupData,
  industryData,
  findImportedFile,
  mediaData,
  PREVIOUS_CATEGORY_SLUGS,
  productUpdateData,
  searchData,
  skipMediaFile,
  type SeedCatalog,
} from './map'
import { hasSameValues } from '../compare'
import {
  FOOTER_LEGAL_LINKS,
  FOOTER_TEXT,
  footerData,
  upgradedCompany,
  upgradedImportant,
} from './footer'
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
import { navigationData, upgradedColumnLimit, upgradedMenu } from './navigation'

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
 * brand pages come from the K3 package (`seed/prokombiznes/k3/`, K3-KATALOG §4) with K3.1 on
 * top (`k31.ts`: new cards, series, films, supplements, split cards, homepage list) and the
 * content of the K4 cards on top of that (`k4Catalog.ts`); katalog v2 (`katalog.json`) still
 * gives groups' order, industries, design images and what K3 lacks.
 * Idempotent: a record is found by its key (slug in the tenant, `legacyIds`, file name).
 * Groups, industries, images and settings are then left as they are.
 * Categories, brand pages and products: every field K3 provides wins over an edit made in the
 * panel — the record is updated when it differs, and only then (no new version on a re-run).
 * Panel fields K3 lacks (kind, popularity, badge, register type…) are written on create only —
 * except on K4 cards, where kind, „Nowość” (`isNew`) and the short name come from the package
 * on every run, like the rest of the card (K4-FINAL §4.3 pkt 1).
 * The content status and check date only move forward (`productUpdateData`). Removed and
 * replaced cards are hidden (draft) with a 301 rule; nothing is deleted.
 */
export async function seedBiznesCatalog(payload: Payload): Promise<void> {
  const catalog: SeedCatalog = katalog
  // „O to firmy pytają najczęściej”: the 16 of K4 (K35 §7a) in place of the K3.1 list (K4a-2).
  const k31Dicts = k31Dictionaries(
    k3Dictionaries,
    K4_FEATURED.map((item) => item.slug),
  )
  const k4Order = k4CategoryOrder(k4HomeFile, k4SlugMap.niepodzielone)
  // K4 departments and categories (D-K4-2); the content of a card comes from K4 (K4a-1b).
  const dictionaries = k4Dictionaries(k31Dicts, k4Slowniki)
  const k4Cards = new Map<string, K4Card>(k4Catalog.produkty.map((card) => [card.slug_seed, card]))
  const { catalog: k31, gallery: k3Gallery } = loadK31Catalog()
  // Repo cards (K3 + K3.1) and the 162 new K4 cards; K4 hides the cards of its slug map.
  const cards = [...k31.cards, ...k4NewCards([...k4Cards.values()], k31.cards)]
  const k4Hidden = new Set(Object.keys(k4SlugMap.ukryj))
  const removed: K3RemovedCard[] = k3Removed.produkty
  // Only repo cards pair with katalog v2: a new K4 card has no record there, by definition.
  const matches = matchCards(k31.cards, catalog.produkty)
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

  // A 301 rule by its source; one changed in the panel stays and the report shows it, one an
  // earlier import pointed to a retired category is moved to the new target.
  async function ensureRedirect(from: string, to: string): Promise<void> {
    const {
      docs: [rule],
    } = await payload.find({
      collection: 'redirects',
      where: inTenant({ from: { equals: from } }),
      limit: 1,
      ...local,
    })
    if (!rule) {
      await payload.create({
        collection: 'redirects',
        data: { from, to, tenant: tenant.id },
        ...local,
      })
      count('redirects', true)
    } else if (rule.to !== to && isRetiredTarget(rule.to)) {
      // Written by an earlier import to a category K4 retired: one hop to the new target.
      await payload.update({ collection: 'redirects', id: rule.id, data: { to }, ...local })
      count('redirects', 'updated')
    } else {
      if (rule.to !== to) note('301 zmienione w panelu', `${from} → ${rule.to}`)
      count('redirects', false)
    }
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
    const data = k4CategoryData(category, groupId, k4CategoryIcons(icons.kategoria_ikona))
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

  // K3 category addresses K4 retired (D-K4-2): "Komputery i monitory" and its pages.
  for (const rule of k4CategoryRedirects(
    k31Dicts.kategorie,
    dictionaries.kategorie,
    SUBCATEGORY_PAGES,
  )) {
    await ensureRedirect(rule.from, rule.to)
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
    const existing = findImportedFile(candidates, file.plik)
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

  // --- galleries: K3 photos (uploaded as `k3-<file>`), else katalog v2 or design files; a new
  // K4 card has its K4 photos (`k4-<file>`) ---
  const imageKeys = new Map(
    cards.map((card) => {
      const keys = k3ImageKeys(
        card,
        k3Gallery,
        matches.get(card.slug_seed),
        media.pliki,
        galleryLimit,
      )
      const k4 = k4Cards.get(card.slug_seed)
      const k4Keys = k4 && !keys.length ? k4ImageKeys(k4).slice(0, galleryLimit ?? undefined) : []
      return [card.slug_seed, keys.length ? keys : k4Keys]
    }),
  )
  if (galleryLimit !== null) log(`gallery limited to ${galleryLimit} photos per product`)
  const { docs: storedMedia } = await payload.find({
    collection: 'media',
    where: { tenant: { equals: tenant.id } },
    pagination: false,
    select: { filename: true },
    ...local,
  })
  const storedId = (name: string) => findImportedFile(storedMedia, name)?.id

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

  // Package photos: K3 / K3.1 galleries, K4 galleries of new cards and K4 color photos.
  const packagePhotos = cards.flatMap((card) => {
    const k4 = k4Cards.get(card.slug_seed)
    const keys = [...(imageKeys.get(card.slug_seed) ?? []), ...(k4 ? k4ColorKeys(k4) : [])]
    return keys.flatMap((key) => {
      const k3File = k3GalleryFile(key)
      if (k3File) return [{ card, key, k4: undefined, ...k3File }]
      const k4File = k4 ? k4PhotoFile(key) : null
      return k4File ? [{ card, key, k4, ...k4File }] : []
    })
  })
  await mapConcurrent(
    packagePhotos,
    GALLERY_UPLOADS_AT_ONCE,
    async ({ card, key, k4, filePath, uploadName }) => {
      const existing = storedId(uploadName)
      count(k4 ? 'media (K4)' : 'media (K3)', existing === undefined)
      if (existing !== undefined) {
        imageIds.set(key, existing)
        return
      }
      const data = await readFile(path.resolve(filePath))
      const created = await payload.create({
        collection: 'media',
        data: {
          ...(k4 ? k4PhotoMediaData(k4, key) : k3GalleryMediaData(card, key, k3Gallery)),
          tenant: tenant.id,
        },
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
  const k4BrandFile: K4BrandsFile = k4Brands
  for (const [index, brand] of dictionaries.marki.entries()) {
    const existing = await findPartner(brand.slug)
    const { brandPage, website } = k3PartnerData(brand)
    // K4 one-line description wins (K4a-2), so K3 and K4 do not rewrite each other on a re-run.
    if (k4BrandFile.marki[brand.marka]) {
      brandPage.shortDescription = k4PartnerFields(brand.marka, k4BrandFile).shortDescription
    }
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
  // Brands of new K4 cards without a record (Apple, HP…): name and address only — logo,
  // description and status come with the K4 brands (K4a-2).
  for (const name of new Set(cards.map((card) => card.marka ?? ''))) {
    if (!name || brandIds.has(name)) continue
    const record = k4BrandRecord(name, k4Brands.marki)
    const existing = await findPartner(record.slug)
    const shownOn = (existing?.tenants ?? []).map((item) =>
      typeof item === 'number' ? item : item.id,
    )
    if (existing && !shownOn.includes(tenant.id)) {
      throw new Error(
        `Seed (Biznes): partner "${record.slug}" is not on the Biznes line — add it in the panel.`,
      )
    }
    const id =
      existing?.id ??
      (
        await payload.create({
          collection: 'partners',
          data: { ...record, partnerStatus: 'none', tenants: [tenant.id] },
          ...local,
        })
      ).id
    count('partners (K4)', !existing)
    brandIds.set(name, id)
  }
  // --- K4 brands (K4a-2): status (K4-FINAL §1), one-line description and logo of the package.
  // A logo stored as `k4-logo-…` is already the K4 one: a re-run uploads nothing. ---
  for (const name of Object.keys(k4BrandFile.marki)) {
    const partnerId = brandIds.get(name)
    if (partnerId === undefined) {
      note('K4: marka bez rekordu', name)
      continue
    }
    const existing = await payload.findByID({
      collection: 'partners',
      id: partnerId,
      ...local,
    })
    const { partnerStatus, shortDescription } = k4PartnerFields(name, k4BrandFile)
    const update = { partnerStatus, brandPage: { ...existing.brandPage, shortDescription } }
    const logo = k4LogoUpload(name, k4BrandFile)
    if (!logo) note('K4: marka bez logo', name)
    const file = logo && !hasK4Logo(existing.filename, logo) ? await readK4Logo(logo) : null
    const same = !file && hasSameValues(existing, update)
    if (!same) {
      await payload.update({
        collection: 'partners',
        id: partnerId,
        data: update,
        ...(file && { file }),
        ...local,
      })
    }
    count('partners (K4 marki)', same ? false : 'updated')
  }

  // --- products from K3: found by `legacyIds` (K3 ids + those of the katalog v2 product) ---
  // Ids by every key (short id, sheet id, slug_seed), for blocks that list products (B9b kits).
  const productIds = new Map<string, number>()
  const slugByKey = new Map<string, string>()
  const k3Keys = new Set<string>()
  // Paired cards first: the XL2 record gives up the sheet ids of XL2 A and B before those
  // cards look for a record by them.
  let withFilms = 0
  const k4Changes: Record<string, number> = {}
  const paired = (card: K31Card) => (matches.has(card.slug_seed) ? 0 : 1)
  for (const source of [...cards].sort((a, b) => paired(a) - paired(b))) {
    // K4 category and subcategory (D-K4-2) in place of the K3 ones.
    const { unknownSubcategory, ...placement } = k4CardPlacement(
      source,
      k4Cards,
      dictionaries.kategorie,
    )
    if (unknownSubcategory) {
      note('podkategoria spoza słownika K4', `${source.slug_seed}: ${unknownSubcategory}`)
    }
    const k4 = k4Cards.get(source.slug_seed)
    const card: K31Card = withK4Content({ ...source, ...placement }, k4)
    const v2 = matches.get(card.slug_seed)
    const k3Data = k3ProductData(
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
    // K4 fields (K4-FINAL §4.2): the whole configurator, labelled sources, short name, kind and
    // premiere — the K4 package wins over the panel like the rest of the card.
    const k4Fields = k4 ? k4ProductFields(k4, k3Data.name) : null
    const data = k4Fields
      ? {
          ...k3Data,
          configurator: k4Fields.configurator,
          sources: { ...k3Data.sources, links: k4Fields.sourceLinks },
        }
      : k3Data
    const k4Panel =
      k4 && k4Fields
        ? {
            shortName: k4Fields.shortName,
            kind: k4Fields.kind,
            isNew: k4Fields.isNew,
            colors: k4Colors(k4, (key) => imageIds.get(key)),
          }
        : {}
    if (k4) k4Changes[k4.zmiana_k4] = (k4Changes[k4.zmiana_k4] ?? 0) + 1
    if (k4?.zdjecia_brak) note('K4: karta bez zdjęcia (kafel usługi — K4e)', card.slug_seed)
    // A card of the K4 slug map stays a draft here, so a re-run does not publish it again.
    const status = k4Hidden.has(card.slug_seed) ? 'draft' : k3PublishStatus(card)
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
    const k31Fields = k31ProductFields(card, k31Series, k31Videos, existing)
    // A new K4 card has no K3.1 series: the K4 one (`seria`).
    const fields = {
      ...k31Fields,
      series: k31Fields.series ?? card.seria ?? null,
      ...k4HomeProductFields(card.slug_seed, k4Order),
    }
    if (fields.videos.length) withFilms += 1
    if ((card.marka === 'Lenovo' || card.marka === 'Dell') && !fields.series) {
      note('Lenovo/Dell bez serii', card.slug_seed)
    }
    if (card.zrodlo_podzialu) note('karty z podziału (do sprawdzenia)', card.slug_seed)
    let id: number
    if (!existing) {
      const created = await payload.create({
        collection: 'products',
        data: {
          ...data,
          ...fields,
          ...k3CreateFields(card, v2, dictionaries),
          ...k4Panel,
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
        ...fields,
        ...k4Panel,
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

  log(`products with films (K3.1): ${withFilms}`)

  // --- K4 slug map: hidden card → its new card or page (301); page seeds that name the hidden
  // card get its new card (K3 bundles, wizard, industries) until K4a-2 / K4g replace them ---
  const k4Redirects = k4SlugRedirects(k4SlugMap, (key) => slugByKey.get(key))
  for (const [old, target] of Object.entries(k4Aliases(k4SlugMap))) {
    const id = productIds.get(target)
    const slug = slugByKey.get(target)
    if (id === undefined || slug === undefined) {
      throw new Error(`Seed (Biznes): new card "${target}" of mapa-slugow-k4.json missing.`)
    }
    productIds.set(old, id)
    slugByKey.set(old, slug)
  }

  // Page seeds may name a replaced product (`nas` on the noclegi page): its successor stands in.
  for (const [shortId, target] of Object.entries(REPLACED_PRODUCTS)) {
    if (!('product' in target) || productIds.has(shortId)) continue
    const id = productIds.get(target.product)
    const slug = slugByKey.get(target.product)
    if (id !== undefined) productIds.set(shortId, id)
    if (slug !== undefined) slugByKey.set(shortId, slug)
  }

  // --- K4 departments (K4a-2): first cards under „Polecane” (dzTop9) and the wheel products ---
  for (const [slug, products] of k4GroupProducts(k4HomeFile, (key) => productIds.get(key))) {
    const groupId = groupIds.get(slug)
    if (groupId === undefined) throw new Error(`Seed (Biznes): department "${slug}" missing.`)
    const existing = await payload.findByID({ collection: 'catalog-groups', id: groupId, ...local })
    const same = hasSameValues(existing, products)
    if (!same) {
      await payload.update({ collection: 'catalog-groups', id: groupId, data: products, ...local })
    }
    count('catalog-groups K4 lists', same ? false : 'updated')
  }

  // --- K4 polecane and podobne (ADR-017 pkt 10), once every card has its record ---
  log(`products with K4 content: ${JSON.stringify(k4Changes)}`)
  const linked = [...k4Cards.values()].filter((card) => productIds.has(card.slug_seed))
  const { docs: linkedDocs } = await payload.find({
    collection: 'products',
    where: inTenant({ id: { in: linked.map((card) => productIds.get(card.slug_seed)) } }),
    pagination: false,
    select: { recommended: true, alternatives: true, _status: true },
    ...local,
  })
  const unknownLinks = new Set<string>()
  for (const card of linked) {
    const stored = linkedDocs.find((doc) => doc.id === productIds.get(card.slug_seed))
    if (!stored) continue
    const { unknown, ...relations } = k4Relations(card, (slug) => productIds.get(slug))
    unknown.forEach((slug) => unknownLinks.add(slug))
    const same = hasSameValues(stored, relations)
    if (!same) {
      await payload.update({
        collection: 'products',
        id: stored.id,
        data: { ...relations, _status: stored._status ?? 'draft' },
        ...local,
      })
    }
    count('products K4 polecane/podobne', same ? false : 'updated')
  }
  for (const slug of unknownLinks) note('K4: polecane/podobne bez karty w bazie', slug)

  // --- removed and replaced cards: hidden (draft, records stay), old address → 301 ---
  const retired = [
    ...k3Retired(cards, removed, catalog.produkty),
    ...k31Retired(k31, catalog.produkty),
  ]
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
      // A hidden card leaves „O to firmy pytają najczęściej” too (K4a-2: exactly the 16).
      const featured = record?.featured === true
      count('products hidden', hide)
      if (record && (hide || featured)) {
        await payload.update({
          collection: 'products',
          id: record.id,
          data: { _status: 'draft', featured: false, featuredOrder: null },
          ...local,
        })
      }
    }
    await ensureRedirect(item.from, item.to)
  }
  for (const rule of k4Redirects) await ensureRedirect(rule.from, rule.to)

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
  // --- K3.1 showrooms (Lenovo, Dell) and floor plans, after the cards they link to ---
  const cardsFor = cardsOf(k31)
  const productId = (slug: string) => productIds.get(slug)
  for (const [brand, showroom] of Object.entries(k31Showrooms)) {
    const partnerId = brandIds.get(brand)
    if (partnerId === undefined) throw new Error(`Seed (Biznes): partner "${brand}" missing.`)
    const existing = await payload.findByID({ collection: 'partners', id: partnerId, ...local })
    const data = showroomData(
      brand,
      showroom,
      k31SeriesVideos[brand] ?? {},
      cardsFor,
      productId,
      existing.showroom,
    )
    for (const item of seriesMismatches(showroom, k31Series))
      note('seria karty ≠ seria salonu', item)
    const same = hasSameValues(existing.showroom, data)
    if (!same) {
      await payload.update({
        collection: 'partners',
        id: partnerId,
        data: { showroom: data },
        ...local,
      })
    }
    count('partners showroom', same ? false : 'updated')
  }
  // --- K4 showrooms 2.0 (D-K4-3) → `Showrooms`; Lenovo and Dell from K4 too. `Partners.showroom`
  // stays as it is until K4f-2 (the brand page still renders it). ---
  const k4Salons = k4SalonsFile.salony as unknown as Record<string, K4Showroom>
  for (const [index, [key, salon]] of Object.entries(k4Salons).entries()) {
    const { data, unknown } = k4ShowroomData(key, salon, index, {
      brands: k4BrandFile,
      partner: (name) => brandIds.get(name),
      product: productId,
    })
    for (const slug of unknown) note('K4: salon — karta bez rekordu', `${key}: ${slug}`)
    const {
      docs: [existing],
    } = await payload.find({
      collection: 'showrooms',
      where: inTenant({ slug: { equals: data.slug } }),
      limit: 1,
      ...local,
    })
    if (!existing) {
      await payload.create({
        collection: 'showrooms',
        data: { ...data, tenant: tenant.id },
        ...local,
      })
      count('showrooms', true)
    } else {
      const same = hasSameValues(existing, data)
      if (!same) {
        await payload.update({ collection: 'showrooms', id: existing.id, data, ...local })
      }
      count('showrooms', same ? false : 'updated')
    }
  }
  const hiddenCards = new Set(
    cards.filter((card) => k3PublishStatus(card) === 'draft').map((card) => card.slug_seed),
  )
  // --- ready bundles (K3c), after the cards they list; the floor plans name them below ---
  const bundleIds = new Map<string, number>()
  // K4a-2: texts and items of zestawy-k4.json over K3c (series, industries, notes stay). Cards of
  // K4 data include the new K4 cards, which K3.1 does not know.
  const k4CardsFor = cardsOf({ ...k31, cards })
  const serviceSlug = k4ServiceSlugs(k4Catalog.produkty)
  const k4BundleData = k4BundlesFile.zestawy as Record<string, K4Bundle>
  const bundles: K3Bundle[] = k3Bundles.zestawy.map((base) => {
    const k4 = k4BundleData[base.slug]
    if (!k4) throw new Error(`Seed (Biznes): bundle "${base.slug}" missing in zestawy-k4.json.`)
    return k4Bundle(base.slug, k4, base, serviceSlug)
  })
  for (const bundle of bundles) {
    const data = bundleData(bundle, k3Bundles.sprawdzone_zgodnosci, {
      cards: k4CardsFor,
      product: productId,
      industry: (slug) => industryIds.get(slug),
      category: (code) => categoryIds.get(code),
      hidden: hiddenCards,
    })
    for (const item of bundle.elementy) {
      if (k4CardsFor(item.slug).some((slug) => hiddenCards.has(slug))) {
        note('element zestawu z ukrytą kartą', `${bundle.slug}: ${item.slug}`)
      }
    }
    const {
      docs: [existing],
    } = await payload.find({
      collection: 'bundles',
      where: inTenant({ slug: { equals: data.slug } }),
      limit: 1,
      ...local,
    })
    const full = {
      ...data,
      contentStatus: nextBundleStatus(data.contentStatus, existing?.contentStatus),
    }
    if (full.contentStatus !== data.contentStatus) note('zestaw „Gotowe” z panelu', bundle.slug)
    if (!existing) {
      const created = await payload.create({
        collection: 'bundles',
        data: { ...full, tenant: tenant.id },
        ...local,
      })
      bundleIds.set(bundle.slug, created.id)
      count('bundles', true)
    } else {
      const same = hasSameValues(existing, full)
      if (!same)
        await payload.update({ collection: 'bundles', id: existing.id, data: full, ...local })
      bundleIds.set(bundle.slug, existing.id)
      count('bundles', same ? false : 'updated')
    }
  }
  log(
    `bundles (K4): ${bundles.length}, „Gotowe” in the package: ${bundles.filter((b) => b.status === 'gotowe').length}`,
  )

  let planPoints = 0
  // K4a-2: points, labels and texts of plany-k4.json over the K3.1 scenes (drawing stays).
  const scenes = (k4PlansFile.sceny as K4Scene[]).map((scene) => {
    const base = k31Scenes.find((item) => item.id === scene.id)
    if (!base) throw new Error(`Seed (Biznes): scene "${scene.id}" has no K3.1 drawing.`)
    return k4Scene(scene, base)
  })
  for (const [index, scene] of scenes.entries()) {
    const svg = await readFile(path.join(K31_DIR, scene.svg), 'utf8')
    const data = {
      ...floorPlanData(scene, index, svg, k4CardsFor, productId),
      bundles: sceneBundles(scene.zestawy, (slug) => bundleIds.get(slug), scene.id),
    }
    planPoints += data.points.length
    for (const point of scene.punkty) {
      if (k4CardsFor(point.slug).some((slug) => hiddenCards.has(slug))) {
        note('punkt planu z ukrytą kartą', `${scene.id}: ${point.slug}`)
      }
    }
    const {
      docs: [existing],
    } = await payload.find({
      collection: 'floor-plans',
      where: inTenant({ slug: { equals: data.slug } }),
      limit: 1,
      ...local,
    })
    count('floor-plans', !existing)
    if (!existing) {
      await payload.create({
        collection: 'floor-plans',
        data: { ...data, tenant: tenant.id },
        ...local,
      })
    } else if (!hasSameValues(existing, data)) {
      await payload.update({ collection: 'floor-plans', id: existing.id, data, ...local })
      count('floor-plans changed', 'updated')
    }
  }
  log(`floor plans (K4): ${scenes.length} scenes, ${planPoints} points`)

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

  // --- K4 brands of the site (K4a-2): homepage order and the groups of /marki; package wins ---
  const brandSettings = k4BrandSettings(k4BrandFile, (name) => brandIds.get(name))
  const {
    docs: [settingsDoc],
  } = await payload.find({
    collection: 'biznes-settings',
    where: { tenant: { equals: tenant.id } },
    limit: 1,
    ...local,
  })
  if (settingsDoc) {
    const same = hasSameValues(settingsDoc.brands, brandSettings)
    if (!same) {
      await payload.update({
        collection: 'biznes-settings',
        id: settingsDoc.id,
        data: { brands: brandSettings },
        ...local,
      })
    }
    count('biznes-settings brands', same ? false : 'updated')
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

  // --- menu K3c: „Gotowe zestawy” in a menu still as the first seed wrote it ---
  if (siteSettings && !navigationMissing) {
    const current = await payload.findByID({
      collection: 'site-settings',
      id: siteSettings.id,
      ...local,
    })
    const menu = upgradedMenu(current.biznes?.navigation?.menu)
    // K4a-1b-2: the K4 menu shows every category of a department (v147c).
    const columnLimit = upgradedColumnLimit(current.biznes?.navigation?.columnLimit)
    count('site-settings menu K4', menu ? 'updated' : false)
    count('site-settings menu K4 (column)', columnLimit ? 'updated' : false)
    if ((menu || columnLimit) && current.biznes?.navigation) {
      const navigation = {
        ...current.biznes.navigation,
        ...(menu && { menu }),
        ...(columnLimit && { columnLimit }),
      }
      await payload.update({
        collection: 'site-settings',
        id: siteSettings.id,
        data: { biznes: { ...current.biznes, navigation } },
        ...local,
      })
    }
  }

  // --- footer columns, the same way: only while the first column is empty ---
  const footerMissing = Boolean(siteSettings && !siteSettings.biznes?.footer?.important?.length)
  if (siteSettings) count('site-settings footer', footerMissing)
  if (siteSettings && footerMissing) {
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
        biznes: { ...current.biznes, footer: footerData() },
      },
      ...local,
    })
  }

  // --- footer K4: columns still as earlier seeds wrote them → „Usługi”, „Systemy i tematy” ---
  if (siteSettings && !footerMissing) {
    const current = await payload.findByID({
      collection: 'site-settings',
      id: siteSettings.id,
      ...local,
    })
    const important = upgradedImportant(current.biznes?.footer?.important)
    const company = upgradedCompany(current.biznes?.footer?.company)
    count('site-settings footer K4', important || company ? 'updated' : false)
    if ((important || company) && current.biznes?.footer) {
      const footer = {
        ...current.biznes.footer,
        ...(important && { important }),
        ...(company && { company }),
      }
      await payload.update({
        collection: 'site-settings',
        id: siteSettings.id,
        data: { biznes: { ...current.biznes, footer } },
        ...local,
      })
    }
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
