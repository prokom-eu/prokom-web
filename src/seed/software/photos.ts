import path from 'node:path'

import type { Payload } from 'payload'

import { ENTRANCE_CAPTION } from '../../sites/software/blocks/SwContactPage/config'
import { findImportedFile } from '../biznes/map'
import { SOFTWARE_ABOUT_SLUG, SOFTWARE_ONE_FIRM_SLUG } from './about'
import { SOFTWARE_CONTACT_SLUG } from './contact'
import type { PageBlock } from './page'

type Count = (name: string, result: boolean | 'updated') => void

/** Photos of the line (SWV4, ZMIANY-v23 §7), kept next to the package data. */
export const SOFTWARE_MEDIA_DIR = path.join('seed', 'prokomsoftware', 'media')

/**
 * Each photo with the captions it belongs to: a photo field whose caption matches gets it. Only
 * the entrance since SWV6 (audyt 01.11: no portraits on the site).
 */
export const SOFTWARE_PHOTOS = [
  {
    file: 'wejscie.jpg',
    alt: 'Wejście do PRO-KOM przy ul. Orkana 16B w Rabce-Zdroju',
    match: /wejście/i,
  },
] as const

export type PhotoFile = (typeof SOFTWARE_PHOTOS)[number]['file']

const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

/** Media id of the photo whose pattern matches the caption. */
function photoFor(caption: string | null | undefined, ids: Map<PhotoFile, number>) {
  if (!caption) return undefined
  const photo = SOFTWARE_PHOTOS.find((item) => item.match.test(caption))
  return photo ? ids.get(photo.file) : undefined
}

/**
 * The layout with the line's photos in its **empty** photo fields (`swPageHero` photos, `swTeam`
 * members, the entrance of `swContactPage`), matched by caption; `null` when nothing changes. A
 * photo already chosen in the panel stays.
 */
export function layoutWithPhotos(
  layout: PageBlock[] | null | undefined,
  ids: Map<PhotoFile, number>,
): PageBlock[] | null {
  let changed = false
  const fill = <T extends { photo?: unknown; photoCaption: string }>(item: T): T => {
    if (item.photo) return item
    const id = photoFor(item.photoCaption, ids)
    if (id === undefined) return item
    changed = true
    return { ...item, photo: id }
  }
  const next = (layout ?? []).map((block): PageBlock => {
    if (block.blockType === 'swPageHero' && block.photos)
      return { ...block, photos: block.photos.map(fill) }
    if (block.blockType === 'swTeam' && block.members)
      return { ...block, members: block.members.map(fill) }
    if (block.blockType === 'swContactPage' && !block.entrancePhoto) {
      const id = photoFor(block.entranceCaption ?? ENTRANCE_CAPTION, ids)
      if (id === undefined) return block
      changed = true
      return { ...block, entrancePhoto: id }
    }
    return block
  })
  return changed ? next : null
}

/** Uploads the photos once (found again by file name) and puts them on the three pages. */
export async function seedSoftwarePhotos(payload: Payload, tenantId: number, count: Count) {
  const ids = new Map<PhotoFile, number>()
  for (const photo of SOFTWARE_PHOTOS) {
    const { docs } = await payload.find({
      collection: 'media',
      where: {
        and: [
          { tenant: { equals: tenantId } },
          { filename: { like: path.parse(photo.file).name } },
        ],
      },
      limit: 20,
      ...local,
    })
    const existing = findImportedFile(docs, photo.file)
    count('media', !existing)
    const id = existing
      ? existing.id
      : (
          await payload.create({
            collection: 'media',
            data: { alt: photo.alt, source: 'własne (PRO-KOM)', tenant: tenantId },
            filePath: path.resolve(SOFTWARE_MEDIA_DIR, photo.file),
            ...local,
          })
        ).id
    ids.set(photo.file, id)
  }

  for (const slug of [SOFTWARE_ABOUT_SLUG, SOFTWARE_ONE_FIRM_SLUG, SOFTWARE_CONTACT_SLUG]) {
    const {
      docs: [page],
    } = await payload.find({
      collection: 'pages',
      where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }] },
      limit: 1,
      ...local,
    })
    const layout = page ? layoutWithPhotos(page.layout, ids) : null
    count(`pages ${slug} photos`, layout ? 'updated' : false)
    if (!page || !layout) continue
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { layout, _status: 'published' },
      ...local,
    })
  }
}
