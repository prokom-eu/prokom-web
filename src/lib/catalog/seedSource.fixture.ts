import type {
  BiznesSetting,
  CatalogCategory,
  CatalogGroup,
  Industry,
  Media,
  Partner,
  Product,
} from '@/payload-types'

import icons from '../../../seed/prokombiznes/ikony.json'
import katalog from '../../../seed/prokombiznes/katalog.json'
import media from '../../../seed/prokombiznes/media.json'
import gallery from '../../../seed/prokombiznes/media-produkty-v2.json'
import search from '../../../seed/prokombiznes/wyszukiwarka.json'
import {
  categoryData,
  galleryFileName,
  galleryMediaData,
  groupData,
  industryData,
  mediaData,
  productData,
  searchData,
  skipMediaFile,
  type SeedCatalog,
} from '../../seed/biznes/map'
import type { CatalogSource } from './catalogIndex'

/** Test fixture: the seed package of the Biznes line as the catalog index reads it. */

export const TENANT = 1

export function image(id: number, file: string, overrides: Partial<Media> = {}): Media {
  const base = file.replace(/\.webp$/, '')
  return {
    id,
    tenant: TENANT,
    alt: `Obraz ${file}`,
    requiresConsent: false,
    url: `/api/media/file/${file}`,
    width: 1200,
    height: 900,
    sizes: {
      small: { url: `/api/media/file/${base}-480x360.webp`, width: 480, height: 360 },
      medium: { url: `/api/media/file/${base}-960x720.webp`, width: 960, height: 720 },
    },
    ...overrides,
  } as Media
}

/** The seed package as the database returns it after `pnpm seed` (populated relations). */
export function sourceFromSeed(): CatalogSource {
  const catalog: SeedCatalog = katalog
  let nextId = 1
  const groups = catalog.grupy.map((group) => ({ id: nextId++, ...groupData(group) }))
  const groupBySeed = new Map(catalog.grupy.map((group, index) => [group.slug, groups[index]!]))
  const categories = catalog.kategorie.map((category) => {
    const group = groupBySeed.get(category.grupa)!
    return {
      id: nextId++,
      ...categoryData(category, group.id, icons.kategoria_ikona),
      group,
      tenant: TENANT,
    }
  })
  const categoryBySeed = new Map(
    catalog.kategorie.map((category, index) => [category.slug, categories[index]!]),
  )
  const industries = catalog.branze.map((industry, index) => ({
    id: nextId++,
    ...industryData(industry, index),
    tenant: TENANT,
  }))
  const industryBySeed = new Map(
    catalog.branze.map((industry, index) => [industry.slug, industries[index]!]),
  )
  const brands = new Map(
    catalog.marki.map((brand) => [
      brand.nazwa,
      {
        id: nextId++,
        name: brand.nazwa,
        slug: brand.slug,
        partnerStatus: 'none',
        tenants: [TENANT],
      } as Partner,
    ]),
  )
  const images = new Map([
    ...media.pliki
      .filter((file) => !skipMediaFile(file))
      .map(
        (file) =>
          [file.plik, image(nextId++, file.plik, mediaData(file, catalog.produkty))] as const,
      ),
    ...gallery.pliki.map(
      (file) =>
        [
          file.plik,
          image(nextId++, galleryFileName(file.plik), galleryMediaData(file, catalog.produkty)),
        ] as const,
    ),
  ])
  const imageById = new Map([...images.values()].map((item) => [item.id, item]))
  const products = catalog.produkty.map((product) => {
    const data = productData(product, catalog, media.pliki, {
      brand: (name) => brands.get(name)?.id,
      category: (slug) => categoryBySeed.get(slug)?.id,
      industry: (slug) => industryBySeed.get(slug)?.id,
      image: (file) => images.get(file)?.id,
    })
    return {
      ...data,
      id: nextId++,
      brand: brands.get(product.marka),
      categories: [categoryBySeed.get(product.kategoria)],
      industries: (product.branze ?? []).map((slug) => industryBySeed.get(slug)),
      images: data.images.map((id) => imageById.get(id)),
    }
  })
  return {
    tenantId: TENANT,
    products: products as unknown as Product[],
    categories: categories as unknown as CatalogCategory[],
    groups: groups as unknown as CatalogGroup[],
    industries: industries as unknown as Industry[],
    pages: [
      { slug: 'home', title: 'Strona główna' },
      { slug: 'opieka-it', title: 'Opieka IT' },
    ],
    settings: { search: searchData(search) } as Pick<BiznesSetting, 'search' | 'wizard'>,
  }
}
