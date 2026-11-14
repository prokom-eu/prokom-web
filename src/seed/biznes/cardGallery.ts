import path from 'path'

import { k3GalleryFile, k3ImageKeys, type K3Gallery } from './k3'
import { k4ImageKeys, k4PhotoFile, type K4Card } from './k4Catalog'
import type { SeedMediaFile, SeedProduct } from './map'

/** Design files of the boards (`media.json`) and katalog v2 galleries (`media-produkty-v2.json`). */
export const MEDIA_DIR = path.join('docs', 'design', 'prokombiznes', 'boards', 'media')
export const SEED_MEDIA_DIR = path.join('seed', 'prokombiznes', 'media')

/**
 * Image keys of a card's gallery, in order (the first is the main photo):
 * - K4 `zdjecia_brak` — none: the card shows its tile (service or licence), never a photo of
 *   another product, a brand logo or a too small shop file (audit 14.11 P1-1);
 * - producer photos chosen for production (`zdjecia_premium`) replace the whole gallery;
 * - else K3 / K3.1 photos, else katalog v2 or design files, else the K4 photos of a new card.
 */
export function cardImageKeys(
  card: { slug_seed: string },
  k4: K4Card | undefined,
  k3Gallery: K3Gallery,
  v2: SeedProduct | undefined,
  designFiles: SeedMediaFile[],
  limit: number | null,
): string[] {
  if (k4?.zdjecia_brak) return []
  if (k4?.zdjecia_premium?.length) return k4ImageKeys(k4).slice(0, limit ?? undefined)
  const keys = k3ImageKeys(card, k3Gallery, v2, designFiles, limit)
  if (keys.length) return keys
  return k4 ? k4ImageKeys(k4).slice(0, limit ?? undefined) : []
}

/**
 * File on disk of an image key: a K3 / K3.1 or K4 package photo, a katalog v2 gallery file
 * (`produkty/<slug>/…`) or a design file of the boards.
 */
export function imageKeyFile(key: string): string {
  const packageFile = k3GalleryFile(key) ?? k4PhotoFile(key)
  if (packageFile) return packageFile.filePath
  return key.startsWith('produkty/') ? path.join(SEED_MEDIA_DIR, key) : path.join(MEDIA_DIR, key)
}
