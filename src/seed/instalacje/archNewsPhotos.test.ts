import { existsSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { ARCH_NEWS_MEDIA_DIR, archNewsPhotos } from './archNewsPhotos'
import { archNewsToImport } from './map'

// RUNDA-V5 §7.2: product photos of „Nowe rozwiązania”, from the makers' official pages only.
describe('arch news photos', () => {
  const photos = archNewsPhotos()

  it('belong to cards of the import and have their file and an alt text', () => {
    const ids = new Set(archNewsToImport().map((card) => card.legacyId))
    expect(photos.length).toBe(13)
    for (const photo of photos) {
      expect(ids.has(photo.legacyId), `card ${photo.legacyId}`).toBe(true)
      expect(existsSync(path.join(ARCH_NEWS_MEDIA_DIR, photo.file)), photo.file).toBe(true)
      expect(photo.alt.length).toBeGreaterThan(10)
      expect(photo.source).toMatch(/^https:\/\/|repo/)
    }
  })

  it('leave the SVG to the cards without an official photo', () => {
    const withPhoto = new Set(photos.map((p) => p.legacyId))
    // 1 Amina, 3 KEF subwoofer (no image), 6 The Frame (official images too small), 14 ColorVu (only a graphic), 15 intercom (a face on
    // its screen), 19–20 presentation and offer for studios.
    for (const id of [1, 3, 6, 14, 15, 19, 20]) expect(withPhoto.has(id), `card ${id}`).toBe(false)
  })
})
