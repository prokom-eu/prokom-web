import { existsSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { softwareAboutLayout, softwareOneCompanyLayout } from './about'
import { softwareContactLayout } from './contact'
import type { PageBlock } from './page'
import { layoutWithPhotos, SOFTWARE_MEDIA_DIR, SOFTWARE_PHOTOS, type PhotoFile } from './photos'

// SWV4 (ZMIANY-v23 §7): portraits and the entrance photo in Media, on `/o-firmie`,
// `/jedna-firma` and `/kontakt`.

const IDS = new Map<PhotoFile, number>([
  ['krystian.jpg', 11],
  ['tadeusz.jpg', 12],
  ['wejscie.jpg', 13],
])

const photosOf = (layout: PageBlock[] | null) =>
  (layout ?? []).flatMap((block) => {
    if (block.blockType === 'swPageHero') return (block.photos ?? []).map((p) => p.photo)
    if (block.blockType === 'swTeam') return (block.members ?? []).map((m) => m.photo)
    if (block.blockType === 'swContactPage') return [block.entrancePhoto]
    return []
  })

describe('layoutWithPhotos', () => {
  it('puts both portraits in the hero and the team, and the entrance in the places', () => {
    expect(photosOf(layoutWithPhotos(softwareAboutLayout(), IDS))).toEqual([11, 12, 11, 12, 13])
  })

  it('gives the entrance to `/jedna-firma` and the contact page', () => {
    expect(photosOf(layoutWithPhotos(softwareOneCompanyLayout(), IDS))).toContain(13)
    expect(photosOf(layoutWithPhotos(softwareContactLayout() as PageBlock[], IDS))).toEqual([13])
  })

  it('keeps a photo chosen in the panel and reports no change', () => {
    const once = layoutWithPhotos(softwareAboutLayout(), IDS)
    expect(layoutWithPhotos(once, IDS)).toBeNull()
    expect(layoutWithPhotos(once, new Map([['krystian.jpg', 99]]))).toBeNull()
  })

  it('has every photo file in the package', () => {
    for (const photo of SOFTWARE_PHOTOS)
      expect(existsSync(path.join(SOFTWARE_MEDIA_DIR, photo.file)), photo.file).toBe(true)
  })
})
