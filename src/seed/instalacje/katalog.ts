import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import path from 'path'
import type { Payload, Where } from 'payload'

import catalog from '../../../seed/prokominstalacje/katalog/katalog-inst.json'
import dictionaryFile from '../../../seed/prokominstalacje/katalog/slowniki-inst.json'
import { k4Relations } from '../biznes/k4Catalog'
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
    const saved = existing
      ? await payload.update({ collection: 'catalog-groups', id: existing.id, data, ...local })
      : await payload.create({
          collection: 'catalog-groups',
          data: { ...data, tenant: tenantId },
          ...local,
        })
    count(existing ? 'działy (aktualizacja)' : 'działy (nowe)')
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
    const saved = existing
      ? await payload.update({ collection: 'catalog-categories', id: existing.id, data, ...local })
      : await payload.create({
          collection: 'catalog-categories',
          data: { ...data, tenant: tenantId },
          ...local,
        })
    count(existing ? 'kategorie (aktualizacja)' : 'kategorie (nowe)')
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
  for (const [popularity, card] of cards.entries()) {
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
      _status: 'published' as const,
    }
    const {
      docs: [existing],
    } = await payload.find({
      collection: 'products',
      where: inTenant({ slug: { equals: card.slug_seed } }),
      limit: 1,
      ...local,
    })
    const saved = existing
      ? await payload.update({ collection: 'products', id: existing.id, data, ...local })
      : await payload.create({
          collection: 'products',
          data: { ...data, tenant: tenantId },
          ...local,
        })
    count(existing ? 'produkty (aktualizacja)' : 'produkty (nowe)')
    productIds.set(card.slug_seed, saved.id)
  }

  // --- relations, once every card has a record ---
  for (const card of cards) {
    const { recommended, alternatives, unknown } = k4Relations(card, (slug) => productIds.get(slug))
    if (unknown.length) log(`${card.slug_seed}: nieznane powiązania ${unknown.join(', ')}`)
    await payload.update({
      collection: 'products',
      id: productIds.get(card.slug_seed)!,
      data: { recommended, alternatives },
      ...local,
    })
  }

  log(
    Object.entries(counts)
      .map(([name, value]) => `${name}: ${value}`)
      .join(', '),
  )
}
