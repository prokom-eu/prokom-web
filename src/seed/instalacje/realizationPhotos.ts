import path from 'node:path'

import type { Payload } from 'payload'

import Zdjecia from '../../../seed/prokominstalacje/realizacje/zdjecia.json'
import { findImportedFile } from '../biznes/map'
import { SEED_CONTEXT } from '../config'

/** Photos of the realizations (RUNDA-V5 §4), next to the package data. */
export const REALIZATION_MEDIA_DIR = path.join('seed', 'prokominstalacje', 'realizacje', 'media')

export type RealizationPhoto = { file: string; alt: string }

/**
 * Photos of each realization by `legacyId`, the cover first (`zdjecia.json`: reviewed one by
 * one — no people, no faces, no number plates).
 */
export function realizationPhotos(): Map<number, RealizationPhoto[]> {
  return new Map(
    Object.entries(Zdjecia.zdjecia).map(([id, photos]) => [
      Number(id),
      photos.map((p) => ({ file: `${p.plik}.webp`, alt: p.alt })),
    ]),
  )
}

/** The year of the work from the photos' file names (`20160722_111814` → 2016), the earliest. */
export function yearFromPhotos(photos: readonly RealizationPhoto[]): number | undefined {
  const years = photos
    .map((p) => /^(20\d\d)\d{4}_/.exec(p.file)?.[1])
    .filter((y): y is string => Boolean(y))
    .map(Number)
  return years.length ? Math.min(...years) : undefined
}

type Count = (name: string, result: 'created' | 'updated' | 'skipped') => void
const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const

/**
 * Uploads the photos once (found again by file name) and gives them to a realization whose
 * photos are still empty — photos chosen in the panel stay. The year too, only when empty.
 */
export async function seedRealizationPhotos(payload: Payload, tenantId: number, count: Count) {
  for (const [legacyId, photos] of realizationPhotos()) {
    const {
      docs: [realization],
    } = await payload.find({
      collection: 'realizations',
      where: { and: [{ tenant: { equals: tenantId } }, { legacyId: { equals: legacyId } }] },
      limit: 1,
      ...local,
    })
    if (!realization || realization.photos?.length) {
      count('realization photos', 'skipped')
      continue
    }
    const ids: number[] = []
    for (const photo of photos) {
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
      ids.push(
        existing
          ? existing.id
          : (
              await payload.create({
                collection: 'media',
                data: {
                  alt: photo.alt,
                  source: 'pro-kom.eu — realizacje (PRO-KOM)',
                  tenant: tenantId,
                },
                filePath: path.resolve(REALIZATION_MEDIA_DIR, String(legacyId), photo.file),
                ...local,
              })
            ).id,
      )
      if (!existing) count('media', 'created')
    }
    const year = realization.year ? undefined : yearFromPhotos(photos)
    await payload.update({
      collection: 'realizations',
      id: realization.id,
      data: { photos: ids, ...(year && { year }) },
      ...local,
    })
    count('realization photos', 'updated')
  }
}
