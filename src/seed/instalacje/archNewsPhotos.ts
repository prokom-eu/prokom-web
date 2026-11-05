import path from 'node:path'

import type { Payload } from 'payload'

import noweRozwiazania from '../../../seed/prokominstalacje/architekci/nowe-rozwiazania.json'
import { findImportedFile } from '../biznes/map'
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
    if (!card || card.image) {
      count('arch news photos', 'skipped')
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
              source: `materiały producenta: ${photo.source}`,
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
