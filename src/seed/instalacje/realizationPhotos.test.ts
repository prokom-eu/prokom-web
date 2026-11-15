import { existsSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { realizationsToImport } from './map'
import { REALIZATION_MEDIA_DIR, realizationPhotos, yearFromPhotos } from './realizationPhotos'

// RUNDA-V5 §4: photos of the realizations from pro-kom.eu, reviewed one by one.
describe('realization photos', () => {
  const photos = realizationPhotos()

  it('belong to realizations of the import', () => {
    const ids = new Set(realizationsToImport().map((r) => r.legacyId))
    for (const id of photos.keys()) expect(ids.has(id), `legacyId ${id}`).toBe(true)
  })

  it('have their WebP file on disk and an alt text', () => {
    for (const [id, list] of photos) {
      expect(list.length).toBeGreaterThan(0)
      for (const photo of list) {
        expect(
          existsSync(path.join(REALIZATION_MEDIA_DIR, String(id), photo.file)),
          photo.file,
        ).toBe(true)
        expect(photo.alt.length).toBeGreaterThan(10)
        expect(photo.alt.length).toBeLessThanOrEqual(200)
      }
    }
  })

  it('leave out the rejected ones (people on them)', () => {
    const files = [...photos.values()].flat().map((p) => p.file)
    for (const rejected of [
      '20161005_153257',
      '20161222_002846',
      '20161222_002804',
      '20161121_124218',
    ])
      expect(files).not.toContain(`${rejected}.webp`)
    expect(new Set(files).size).toBe(files.length)
  })

  it('give the year of the work from the file names', () => {
    expect(
      yearFromPhotos([
        { file: '20170419_153352.webp', alt: '' },
        { file: '20160318_095642.webp', alt: '' },
      ]),
    ).toBe(2016)
    expect(yearFromPhotos([{ file: 'zbkrk.webp', alt: '' }])).toBeUndefined()
  })
})
