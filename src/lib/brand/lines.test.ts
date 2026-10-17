import { existsSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { LINE_VALUES } from '@/lib/tenant/lines'

import { BRAND_ASSETS, brandAsset, brandIcons } from './lines'

const publicFile = (href: string) => path.join('public', ...href.split('/'))

describe('brandAsset', () => {
  it('uses the file names of the brand package (main line = "glowna")', () => {
    expect(brandAsset('prokom', 'poziome_kolor.svg')).toBe('/brand/prokom-glowna_poziome_kolor.svg')
    expect(brandAsset('biznes', 'favicon.ico')).toBe('/brand/prokom-biznes_favicon.ico')
  })

  it.each([...LINE_VALUES])('%s: every file is in public/brand', (line) => {
    for (const asset of BRAND_ASSETS) {
      expect(existsSync(publicFile(brandAsset(line, asset))), asset).toBe(true)
    }
  })
})

describe('brandIcons', () => {
  it('points the favicons of a site to its own line', () => {
    const icons = brandIcons('instalacje')
    const hrefs = JSON.stringify(icons)
    expect(hrefs).toContain('/brand/prokom-instalacje_favicon.svg')
    expect(hrefs).toContain('/brand/prokom-instalacje_apple-touch-icon-180.png')
    expect(hrefs).not.toMatch(/biznes|software|glowna/)
  })
})
