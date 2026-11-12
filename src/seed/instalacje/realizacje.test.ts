import { existsSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { realizationsToImport } from './map'
import { formatRealizationReport, planRealizations } from './realizacje'
import { REALIZATION_MEDIA_DIR, realizationPhotos } from './realizationPhotos'

const wanted = [
  { legacyId: 1, title: 'Restauracja „Aleksandra”' },
  { legacyId: 2, title: 'Blachotrapez' },
  { legacyId: 3, title: 'Empik Zakopane i Kraków' },
  { legacyId: 4, title: 'Parafia św. Teresy' },
]
const photos = new Map([
  [1, [{ file: 'a.webp', alt: 'Sala' }]],
  [
    2,
    [
      { file: 'b.webp', alt: 'Biuro' },
      { file: 'c.webp', alt: 'Sala' },
    ],
  ],
  [4, [{ file: 'd.webp', alt: 'Chór' }]],
])

describe('planRealizations (production had none, 12.11)', () => {
  it('an empty database: every realization is created with its own photos', () => {
    const steps = planRealizations(wanted, [], photos)
    expect(steps.map((s) => s.kind)).toEqual(['create', 'create', 'create', 'create'])
    expect(steps[1]).toMatchObject({ kind: 'create', photos: photos.get(2) })
    expect(steps[2]).toMatchObject({ kind: 'create', photos: [] })
  })

  it('never overwrites the panel: present with photos → skipped; without → only photos', () => {
    const stored = [
      { id: 10, legacyId: 1, title: 'Zmieniony w panelu', photos: [99] },
      { id: 11, legacyId: 2, title: 'Blachotrapez', photos: [] },
      // Added by hand, no legacyId: the same title counts as present.
      { id: 12, legacyId: null, title: ' Parafia św. Teresy ', photos: null },
    ]
    const steps = planRealizations(wanted, stored, photos)
    expect(steps.map((s) => s.kind)).toEqual(['skip', 'photos', 'create', 'photos'])
    expect(steps[1]).toMatchObject({ id: 11, photos: photos.get(2) })
    expect(steps[3]).toMatchObject({ id: 12 })
  })

  it('a present realization with no photos in the repo is left alone', () => {
    const steps = planRealizations(
      wanted,
      [{ id: 13, legacyId: 3, title: 'Empik', photos: [] }],
      photos,
    )
    expect(steps[2]).toMatchObject({ kind: 'skip', reason: 'jest; w repo brak zdjęć' })
  })

  it('the report counts the work', () => {
    const report = formatRealizationReport(planRealizations(wanted, [], photos))
    expect(report).toContain('Do utworzenia: 4, do uzupełnienia zdjęć: 0, plików zdjęć: 4.')
    expect(report).toContain('| 2 | Blachotrapez | utworzyć | 2 |')
  })
})

describe('the package the script sends', () => {
  it('11 realizations with consent; every photo file of the repo exists', () => {
    const items = realizationsToImport()
    expect(items).toHaveLength(11)
    expect(items.every((r) => r.clientConsent === true)).toBe(true)
    for (const [id, list] of realizationPhotos())
      for (const p of list)
        expect(existsSync(path.join(REALIZATION_MEDIA_DIR, String(id), p.file)), p.file).toBe(true)
  })
})
