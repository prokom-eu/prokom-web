import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import path from 'path'
import type { Payload, Where } from 'payload'

import catalog from '../../../seed/prokominstalacje/katalog/katalog-inst.json'
import brandFile from '../../../seed/prokominstalacje/katalog/marki-inst.json'
import salonFile from '../../../seed/prokominstalacje/katalog/salony-inst.json'
import dictionaryFile from '../../../seed/prokominstalacje/katalog/slowniki-inst.json'
import type { K4BrandsFile } from '../biznes/k4Brands'
import { k4Relations } from '../biznes/k4Catalog'
import { k4ShowroomData, type K4Showroom } from '../biznes/k4Showrooms'
import { productUpdateData } from '../biznes/map'
import { hasSameValues } from '../compare'
import { parseGalleryLimit, SEED_CONTEXT } from '../config'
import {
  brandSlug,
  instCategoryData,
  instGroupData,
  instPhotoFile,
  instPhotoMediaData,
  instProductData,
  type InstCard,
  type InstDictionaries,
} from './katalogMap'

/**
 * Catalog of prokominstalacje.pl (INST-K1, ADR-029): departments → `catalog-groups`,
 * categories → `catalog-categories`, brands → shared `partners` (the Instalacje tenant added to
 * an existing record), photos → `media`, cards → `products`. Idempotent: a record is found by
 * its slug in the tenant; the package's fields win (like `seed:biznes`), so a re-run brings a
 * changed card in. Fields the package does not carry (hero, menu images…) stay as edited.
 */
/** Eight cards of „Najczęściej wybierane” on the home page until the panel sets its own. */
export const HOME_FEATURED = [
  'dahua-ipc-hfw2x49s-s-il',
  'hikvision-ds-2cd2387g3-lis2uy',
  'dahua-nvr21xxhs-4ks3',
  'ajax-hub-2',
  'ajax-motionprotect',
  'satel-integra-plus',
  'hikvision-ds-kis604-s-d',
  'dahua-asi1201e-v1',
] as const

export async function seedInstalacjeCatalog(payload: Payload, tenantId: number): Promise<void> {
  const log = (message: string) => payload.logger.info(`Seed (Instalacje katalog): ${message}`)
  const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const
  const inTenant = (where: Where): Where => ({ and: [{ tenant: { equals: tenantId } }, where] })
  const dictionaries = dictionaryFile as unknown as InstDictionaries
  // CI keeps the seed fast with a few photos per card (`SEED_GALLERY_LIMIT`, like Biznes).
  const limit = parseGalleryLimit(process.env.SEED_GALLERY_LIMIT) ?? Infinity
  const cards = (catalog as unknown as { produkty: InstCard[] }).produkty.map((card) => ({
    ...card,
    zdjecia_premium: (card.zdjecia_premium ?? []).slice(0, limit),
  }))
  const counts: Record<string, number> = {}
  const count = (name: string) => (counts[name] = (counts[name] ?? 0) + 1)

  // --- departments and categories ---
  const groupIds = new Map<string, number>()
  for (const [order, department] of dictionaries.dzialy.entries()) {
    const data = instGroupData(department, order)
    const {
      docs: [existing],
    } = await payload.find({
      collection: 'catalog-groups',
      where: inTenant({ slug: { equals: data.slug } }),
      limit: 1,
      ...local,
    })
    const changed = existing && !hasSameValues(existing, data)
    const saved = !existing
      ? await payload.create({
          collection: 'catalog-groups',
          data: { ...data, tenant: tenantId },
          ...local,
        })
      : changed
        ? await payload.update({ collection: 'catalog-groups', id: existing.id, data, ...local })
        : existing
    count(!existing ? 'działy (nowe)' : changed ? 'działy (aktualizacja)' : 'działy (bez zmian)')
    groupIds.set(department.slug, saved.id)
  }

  const categoryIds = new Map<string, number>()
  for (const [order, category] of dictionaries.kategorie.entries()) {
    const groupId = groupIds.get(category.dzial)
    if (groupId === undefined)
      throw new Error(`Seed (Instalacje katalog): unknown department "${category.dzial}".`)
    const data = instCategoryData(category, groupId, order)
    const {
      docs: [existing],
    } = await payload.find({
      collection: 'catalog-categories',
      where: inTenant({ slug: { equals: data.slug } }),
      limit: 1,
      ...local,
    })
    const changed = existing && !hasSameValues(existing, data)
    const saved = !existing
      ? await payload.create({
          collection: 'catalog-categories',
          data: { ...data, tenant: tenantId },
          ...local,
        })
      : changed
        ? await payload.update({
            collection: 'catalog-categories',
            id: existing.id,
            data,
            ...local,
          })
        : existing
    count(
      !existing
        ? 'kategorie (nowe)'
        : changed
          ? 'kategorie (aktualizacja)'
          : 'kategorie (bez zmian)',
    )
    categoryIds.set(category.kod, saved.id)
  }

  // --- brands: shared partners, the tenant added to an existing record ---
  const brandIds = new Map<string, number>()
  for (const name of [...new Set(cards.map((card) => card.marka))]) {
    const slug = brandSlug(name)
    const {
      docs: [existing],
    } = await payload.find({
      collection: 'partners',
      where: { slug: { equals: slug } },
      limit: 1,
      ...local,
    })
    if (existing) {
      const tenants = (existing.tenants ?? []).map((t) => (typeof t === 'number' ? t : t.id))
      if (!tenants.includes(tenantId)) {
        await payload.update({
          collection: 'partners',
          id: existing.id,
          data: { tenants: [...tenants, tenantId] },
          ...local,
        })
        count('marki (dopisany tenant)')
      }
      brandIds.set(name, existing.id)
    } else {
      const created = await payload.create({
        collection: 'partners',
        data: { name, slug, partnerStatus: 'none', tenants: [tenantId] },
        ...local,
      })
      count('marki (nowe)')
      brandIds.set(name, created.id)
    }
  }

  // --- photos ---
  const imageIds = new Map<string, number>()
  for (const card of cards) {
    for (const [index, photo] of (card.zdjecia_premium ?? []).entries()) {
      const { filePath, uploadName } = instPhotoFile(photo.plik)
      const {
        docs: [existing],
      } = await payload.find({
        collection: 'media',
        where: inTenant({ filename: { equals: uploadName } }),
        limit: 1,
        ...local,
      })
      if (existing) {
        imageIds.set(photo.plik, existing.id)
        continue
      }
      if (!existsSync(filePath)) {
        count('zdjęcia (brak pliku)')
        continue
      }
      const data = await readFile(path.resolve(filePath))
      const created = await payload.create({
        collection: 'media',
        data: { ...instPhotoMediaData(card, index), tenant: tenantId },
        file: { data, mimetype: 'image/webp', name: uploadName, size: data.length },
        ...local,
      })
      count('zdjęcia (nowe)')
      imageIds.set(photo.plik, created.id)
    }
  }

  // --- products ---
  const productIds = new Map<string, number>()
  // „Polecane” order: the dictionary's category order (cameras first, accessories last within a
  // department), then the package order within a category — the package files come in any order.
  const categoryRank = new Map(dictionaries.kategorie.map((category, rank) => [category.kod, rank]))
  const ranked = cards
    .map((card, position) => ({ card, position }))
    .sort(
      (a, b) =>
        (categoryRank.get(a.card.kategoria) ?? 99) - (categoryRank.get(b.card.kategoria) ?? 99) ||
        a.position - b.position,
    )
  const rankOf = new Map(ranked.map(({ card }, rank) => [card.slug_seed, rank]))
  for (const card of cards) {
    const popularity = rankOf.get(card.slug_seed)!
    const category = categoryIds.get(card.kategoria)
    if (category === undefined)
      throw new Error(`Seed (Instalacje katalog): no category "${card.kategoria}".`)
    const images = (card.zdjecia_premium ?? [])
      .map((photo) => imageIds.get(photo.plik))
      .filter((id): id is number => id !== undefined)
    const data = {
      ...instProductData(card, { brand: brandIds.get(card.marka), category, images }, dictionaries),
      // Package order = the default „Polecane” order of the listing, on the field's 0–100 scale.
      popularity: Math.max(1, Math.round(100 - (popularity * 99) / Math.max(1, cards.length - 1))),
    }
    const {
      docs: [existing],
    } = await payload.find({
      collection: 'products',
      where: inTenant({ slug: { equals: card.slug_seed } }),
      limit: 1,
      ...local,
    })
    if (!existing) {
      const created = await payload.create({
        collection: 'products',
        data: { ...data, tenant: tenantId, _status: 'published' },
        ...local,
      })
      count('produkty (nowe)')
      productIds.set(card.slug_seed, created.id)
      continue
    }
    // Like `seed:biznes`: the package wins, but a card taken down in the panel stays down and the
    // content status only moves forward („Gotowe” from the panel is never undone); saved only
    // when something changed, so a re-run adds no versions.
    const update = {
      ...productUpdateData(data, existing),
      _status: existing._status ?? 'published',
    }
    if (!hasSameValues(existing, update)) {
      await payload.update({ collection: 'products', id: existing.id, data: update, ...local })
      count('produkty (aktualizacja)')
    } else count('produkty (bez zmian)')
    productIds.set(card.slug_seed, existing.id)
  }

  // --- relations, once every card has a record ---
  for (const card of cards) {
    const { recommended, alternatives, unknown } = k4Relations(card, (slug) => productIds.get(slug))
    if (unknown.length) log(`${card.slug_seed}: nieznane powiązania ${unknown.join(', ')}`)
    const id = productIds.get(card.slug_seed)!
    const stored = await payload.findByID({
      collection: 'products',
      id,
      select: { recommended: true, alternatives: true },
      ...local,
    })
    if (!hasSameValues(stored, { recommended, alternatives })) {
      await payload.update({
        collection: 'products',
        id,
        data: { recommended, alternatives },
        ...local,
      })
    }
  }

  // --- „Najczęściej wybierane” on the home page (INST-K2): filled only while empty — then the
  // panel's choice wins ---
  const {
    docs: [settings],
  } = await payload.find({
    collection: 'instalacje-settings',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    ...local,
  })
  if (settings && !(settings.homeFeatured ?? []).length) {
    const featured = HOME_FEATURED.flatMap((slug) => productIds.get(slug) ?? [])
    await payload.update({
      collection: 'instalacje-settings',
      id: settings.id,
      data: { homeFeatured: featured },
      ...local,
    })
    count('najczęściej wybierane (ustawione)')
  }

  // --- salons 2.0 of the brands (INST-K2): only brands marked `salon` in marki-inst.json ---
  const brands = brandFile as unknown as K4BrandsFile & {
    marki: Record<string, { salon?: boolean }>
  }
  const salons = salonFile.salony as unknown as Record<string, K4Showroom>
  for (const [order, [key, salon]] of Object.entries(salons).entries()) {
    if (!brands.marki[key]?.salon) continue
    const { data, unknown } = k4ShowroomData(key, salon, order, {
      brands,
      partner: (name) => brandIds.get(name),
      product: (slug) => productIds.get(slug),
    })
    if (unknown.length) log(`salon ${key}: nieznane karty ${unknown.join(', ')}`)
    const {
      docs: [existing],
    } = await payload.find({
      collection: 'showrooms',
      where: inTenant({ slug: { equals: data.slug } }),
      limit: 1,
      ...local,
    })
    if (existing) {
      if (!hasSameValues(existing, data)) {
        await payload.update({ collection: 'showrooms', id: existing.id, data, ...local })
        count('salony (aktualizacja)')
      } else count('salony (bez zmian)')
    } else {
      await payload.create({
        collection: 'showrooms',
        data: { ...data, tenant: tenantId },
        ...local,
      })
      count('salony (nowe)')
    }
  }

  log(
    Object.entries(counts)
      .map(([name, value]) => `${name}: ${value}`)
      .join(', '),
  )
}
