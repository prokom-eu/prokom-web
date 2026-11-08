import { readFile } from 'node:fs/promises'
import path from 'node:path'

import type { Payload } from 'payload'

import file from '../../../seed/prokombiznes/k4/strony-k4.json'
import { hasSameValues } from '../compare'
import { upsertBiznesPage, type PageBlock } from './page'

type Report = (name: string, changed: boolean) => void
type Variant = 'agd' | 'it'

const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

/** Packshots and logos of the procurement pages (ZAOPATRZENIE §11). */
export const PROCUREMENT_MEDIA_DIR = 'seed/prokombiznes/zaopatrzenie/media'
const MEDIA_SOURCE =
  'paczka 06.11.2026 (prototyp Zaopatrzenia: packshoty i logo producentów), prawo użycia do potwierdzenia'

/** The two pages (ZAOPATRZENIE §1); the title gets „ | PRO-KOM Biznes” from the layout. */
export const PROCUREMENT_PAGES: {
  slug: string
  variant: Variant
  title: string
  seoTitle: string
  description: string
}[] = [
  {
    slug: 'agd-rtv-dla-firm',
    variant: 'agd',
    title: 'AGD i RTV dla firm',
    seoTitle: 'AGD i RTV dla firm, deweloperów i hoteli',
    description:
      'AGD i RTV dla deweloperów, apartamentów na wynajem, hoteli i biur z Podhala. Jedno zapytanie, jedna faktura na firmę, dostawa na termin — także etapami.',
  },
  {
    slug: 'dostawy-it-dla-firm',
    variant: 'it',
    title: 'Dostawy IT dla firm',
    seoTitle: 'Dostawy komputerów i laptopów dla firm',
    description:
      'Laptopy, komputery i monitory dla firm z Podhala i Małopolski — od kilku do kilkudziesięciu stanowisk, gotowe do pracy w dniu dostawy.',
  },
]

/** Package image name → file in the media folder and the Media upload name (`zaop-*`). */
export function procurementMediaFile(name: string): { file: string; upload: string } {
  const upload = name.startsWith('zaop-') ? `${name}.webp` : `zaop-${name}.webp`
  return { file: path.join(PROCUREMENT_MEDIA_DIR, `${name}.webp`), upload }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Every image name the page data uses (`image` and `images` keys). */
export function procurementImageNames(data: unknown): string[] {
  const names = new Set<string>()
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) return value.forEach(walk)
    if (!isRecord(value)) return
    for (const [key, item] of Object.entries(value)) {
      if (key === 'image' && typeof item === 'string') names.add(item)
      else if (key === 'images' && Array.isArray(item)) {
        item.forEach((name) => typeof name === 'string' && names.add(name))
      } else walk(item)
    }
  }
  walk(data)
  return [...names]
}

/** Swaps package image names for Media ids; an unknown name becomes `null` and is reported. */
export function resolveProcurementImages(
  data: unknown,
  mediaId: (name: string) => number | undefined,
): { data: unknown; missing: string[] } {
  const missing = new Set<string>()
  const resolve = (name: unknown) => {
    if (typeof name !== 'string') return name
    const id = mediaId(name)
    if (id === undefined) missing.add(name)
    return id ?? null
  }
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(walk)
    if (!isRecord(value)) return value
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        if (key === 'image') return [key, resolve(item)]
        if (key === 'images' && Array.isArray(item)) return [key, item.map(resolve)]
        return [key, walk(item)]
      }),
    )
  }
  return { data: walk(data), missing: [...missing] }
}

/** Alt text of a package image: the configurator item using it, or the brand of a logo. */
function altOf(data: unknown, name: string): string {
  const logo = name.match(/^zaop-logo-(.+)$/)
  if (logo) return `Logo ${logo[1]!.charAt(0).toUpperCase()}${logo[1]!.slice(1)}`
  let alt: string | undefined
  const walk = (value: unknown): void => {
    if (alt) return
    if (Array.isArray(value)) return value.forEach(walk)
    if (!isRecord(value)) return
    if (value.image === name && typeof (value.name ?? value.title) === 'string') {
      alt = String(value.name ?? value.title)
      return
    }
    Object.values(value).forEach(walk)
  }
  walk(data)
  return alt ?? 'Sprzęt dla firm'
}

/** Pages the seed creates: the IT page comes with its template sections in B2-2. */
const SEEDED: ReadonlySet<Variant> = new Set(['agd'])

const packageData = (file as unknown as { zaopatrzenie: Record<Variant, unknown> }).zaopatrzenie

/**
 * `/agd-rtv-dla-firm` and `/dostawy-it-dla-firm` (BIZ-2): uploads the missing `zaop-*` media,
 * creates a missing page and keeps the stored page's JSON equal to the package (the package
 * wins). The §0 fields (flags, services, class hints) are the boss's: never touched, empty on a
 * new page.
 */
export async function seedBiznesProcurementPages(
  payload: Payload,
  tenantId: number,
  storedMediaId: (upload: string) => number | undefined,
  report: Report,
  note: (what: string, item: string) => void,
): Promise<void> {
  const ids = new Map<string, number>()
  for (const variant of SEEDED) {
    for (const name of procurementImageNames(packageData[variant])) {
      if (ids.has(name)) continue
      const { file: filePath, upload } = procurementMediaFile(name)
      const stored = storedMediaId(upload)
      report('media (Zaopatrzenie)', stored === undefined)
      if (stored !== undefined) {
        ids.set(name, stored)
        continue
      }
      const bytes = await readFile(path.resolve(filePath))
      const created = await payload.create({
        collection: 'media',
        data: {
          alt: altOf(packageData[variant], name),
          source: MEDIA_SOURCE,
          requiresConsent: false,
          tenant: tenantId,
        },
        file: { data: bytes, mimetype: 'image/webp', name: upload, size: bytes.length },
        ...local,
      })
      ids.set(name, created.id)
    }
  }

  for (const page of PROCUREMENT_PAGES.filter((item) => SEEDED.has(item.variant))) {
    const { data, missing } = resolveProcurementImages(packageData[page.variant], (name) =>
      ids.get(name),
    )
    missing.forEach((name) => note('Zaopatrzenie: brak zdjęcia', name))
    const block = { blockType: 'bzProcurementPage', variant: page.variant, data }
    const {
      docs: [stored],
    } = await payload.find({
      collection: 'pages',
      where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: page.slug } }] },
      limit: 1,
      ...local,
    })
    if (!stored) {
      await upsertBiznesPage(
        payload,
        tenantId,
        {
          slug: page.slug,
          title: page.title,
          description: page.description,
          seoTitle: page.seoTitle,
          layout: [block] as PageBlock[],
        },
        report,
      )
      continue
    }
    const layout = stored.layout ?? []
    const index = layout.findIndex((item) => item.blockType === 'bzProcurementPage')
    const current = index >= 0 ? layout[index] : undefined
    const changed =
      current?.blockType === 'bzProcurementPage' &&
      // jsonb reorders keys: compare values both ways (a key dropped from the package counts).
      !(hasSameValues(current.data, data) && hasSameValues(data, current.data))
    report(`pages ${page.slug}`, changed)
    if (!changed) continue
    await payload.update({
      collection: 'pages',
      id: stored.id,
      data: {
        layout: layout.map((item, i) => (i === index ? { ...item, data } : item)) as PageBlock[],
        _status: stored._status ?? 'published',
      },
      ...local,
    })
  }
}
