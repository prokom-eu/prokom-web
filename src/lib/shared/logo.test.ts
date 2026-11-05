import { existsSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { SHARED_LINE_KEYS } from './lines'
import { lineLogoFile } from './logo'

const inPublic = (src: string) => existsSync(path.join('public', ...src.split('/')))

describe('lineLogoFile', () => {
  it.each(SHARED_LINE_KEYS.filter((key) => key !== 'zakopane'))(
    '%s: both tones point to files in public/brand',
    (key) => {
      for (const tone of ['kolor', 'negatyw'] as const) {
        const file = lineLogoFile(key, tone)
        expect(file, tone).not.toBeNull()
        expect(inPublic(file!.src), file!.src).toBe(true)
      }
    },
  )

  it('the main line uses the "glowna" mark (green rule, no line name)', () => {
    expect(lineLogoFile('prokom', 'kolor')?.src).toBe('/brand/prokom-glowna_poziome_kolor.svg')
  })

  it('Gaming has its own dark mark in both tones; Zakopane has no file yet', () => {
    expect(lineLogoFile('gaming', 'kolor')).toEqual(lineLogoFile('gaming', 'negatyw'))
    expect(lineLogoFile('zakopane', 'kolor')).toBeNull()
  })
})
