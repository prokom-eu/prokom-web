import { existsSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { ARCH_NEWS_MEDIA_DIR, archNewsPhotos, mediaFileMissing } from './archNewsPhotos'
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

// Runda v6 §1.7.2: a media record whose file is gone from this folder gets the file again.
describe('mediaFileMissing', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'inst-media-'))
  writeFileSync(path.join(dir, 'nowosc-04.webp'), 'x')

  it('is true only when the stored file is not on the disk', () => {
    expect(mediaFileMissing(dir, 'nowosc-04.webp')).toBe(false)
    expect(mediaFileMissing(dir, 'nowosc-07.webp')).toBe(true)
  })

  it('a record without a file name is not a missing file', () => {
    expect(mediaFileMissing(dir, null)).toBe(false)
    expect(mediaFileMissing(dir, undefined)).toBe(false)
  })
})
