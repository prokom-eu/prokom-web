import { existsSync } from 'node:fs'
import path from 'node:path'

import type { Payload } from 'payload'

import noweRozwiazania from '../../../seed/prokominstalacje/architekci/nowe-rozwiazania.json'
import { findImportedFile } from '../biznes/map'
import { getEnv } from '../../lib/env'
import { SEED_CONTEXT } from '../config'

/** Product photos of „Nowe rozwiązania” (RUNDA-V5 §7.2), next to the package data. */
export const ARCH_NEWS_MEDIA_DIR = path.join('seed', 'prokominstalacje', 'architekci', 'media')

export type ArchNewsPhoto = { legacyId: number; file: string; alt: string; source: string }

type Position = { zdjecie?: { plik: string; alt: string; zrodlo: string } }

/** The cards with a photo from the maker's official page, by position (= `legacyId`). */
export function archNewsPhotos(): ArchNewsPhoto[] {
  return (noweRozwiazania.pozycje as Position[]).flatMap((p, index) =>
    p.zdjecie
      ? [
          {
            legacyId: index + 1,
            file: p.zdjecie.plik,
            alt: p.zdjecie.alt,
            source: p.zdjecie.zrodlo,
          },
        ]
      : [],
  )
}

/**
 * Runda v6 §1.7.2: the media record exists, but its file is not in this folder's media directory
 * (e.g. a database copied from another worktree) — the card would show a broken image.
 */
export function mediaFileMissing(dir: string, filename: string | null | undefined): boolean {
  return Boolean(filename) && !existsSync(path.join(dir, filename as string))
}

/** Where Payload keeps the uploads (`Media.upload.staticDir`). */
const mediaDir = () => path.resolve(getEnv().MEDIA_DIR, 'media')

type Count = (name: string, result: 'created' | 'updated' | 'skipped') => void
const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const

/**
 * Uploads each photo once (found again by file name) and gives it to its card while the card's
 * photo is empty — a photo chosen in the panel stays. The card keeps its status: drafts waiting
 * for the boss stay drafts.
 */
export async function seedArchNewsPhotos(payload: Payload, tenantId: number, count: Count) {
  for (const photo of archNewsPhotos()) {
    const {
      docs: [card],
    } = await payload.find({
      collection: 'inst-arch-news',
      where: { and: [{ tenant: { equals: tenantId } }, { legacyId: { equals: photo.legacyId } }] },
      limit: 1,
      draft: true,
      ...local,
    })
    if (!card) {
      count('arch news photos', 'skipped')
      continue
    }
    if (card.image) {
      // The card has its photo: only put the file back when it is gone from the disk.
      const id = typeof card.image === 'object' ? card.image.id : card.image
      const media = await payload.findByID({ collection: 'media', id, ...local })
      if (mediaFileMissing(mediaDir(), media.filename)) {
        await payload.update({
          collection: 'media',
          id,
          data: {},
          filePath: path.resolve(ARCH_NEWS_MEDIA_DIR, photo.file),
          ...local,
        })
        count('arch news photos', 'updated')
      } else count('arch news photos', 'skipped')
      continue
    }
    const name = photo.file
    const { docs } = await payload.find({
      collection: 'media',
      where: {
        and: [{ tenant: { equals: tenantId } }, { filename: { like: path.parse(name).name } }],
      },
      limit: 20,
      ...local,
    })
    const existing = findImportedFile(docs, name)
    const imageId = existing
      ? existing.id
      : (
          await payload.create({
            collection: 'media',
            data: {
              alt: photo.alt,
              source: photo.source.startsWith('https://')
                ? `materiały producenta: ${photo.source}`
                : photo.source,
              tenant: tenantId,
            },
            filePath: path.resolve(ARCH_NEWS_MEDIA_DIR, photo.file),
            ...local,
          })
        ).id
    if (!existing) count('media', 'created')
    await payload.update({
      collection: 'inst-arch-news',
      id: card.id,
      data: { image: imageId, _status: card._status ?? 'draft' },
      draft: card._status !== 'published',
      ...local,
    })
    count('arch news photos', 'updated')
  }
}
