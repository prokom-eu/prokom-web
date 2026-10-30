import { describe, expect, it } from 'vitest'

import brandsFile from '../../../seed/prokombiznes/k4/marki-k4.json'
import {
  hasK4Logo,
  k4BrandSettings,
  k4BrandSlug,
  k4LogoUpload,
  k4PartnerFields,
  k4PartnerStatus,
  type K4BrandsFile,
} from './k4Brands'

const file: K4BrandsFile = brandsFile
const names = Object.keys(file.marki)

describe('k4PartnerStatus (K4-FINAL §1)', () => {
  it('gives a status to the six brands of the rules only', () => {
    const withStatus = Object.fromEntries(
      names.map((name) => [name, k4PartnerStatus(name, file)]).filter(([, s]) => s !== 'none'),
    )
    expect(withStatus).toEqual({
      COMEX: 'cooperation',
      Elzab: 'authorized-service',
      GoPOS: 'authorized-partner',
      InsERT: 'authorized-partner',
      Optivendi: 'partner',
      Posnet: 'authorized-service',
    })
    expect(names).toHaveLength(39)
  })

  it('stops on a brand whose entry disagrees with the rules', () => {
    const changed: K4BrandsFile = {
      ...file,
      marki: { ...file.marki, HP: { ...file.marki.HP!, status: 'Partner' } },
    }
    expect(() => k4PartnerStatus('HP', changed)).toThrow(/HP/)
  })
})

describe('k4BrandSlug', () => {
  it('takes the address from the logo, else from the name', () => {
    expect(k4BrandSlug('Sharp/NEC', file)).toBe('sharp-nec')
    expect(k4BrandSlug('Konica Minolta', file)).toBe('konica-minolta')
    expect(k4BrandSlug('APC', file)).toBe('apc')
    expect(k4BrandSlug('Adobe', file)).toBe('adobe')
  })
})

describe('k4LogoUpload', () => {
  it('rasterizes SVG to WebP and keeps PNG and WebP', () => {
    expect(k4LogoUpload('Brother', file)).toEqual({
      source: 'media/marki/logo-brother.svg',
      uploadName: 'k4-logo-brother.webp',
      mimetype: 'image/webp',
      rasterize: true,
    })
    expect(k4LogoUpload('Apple', file)).toMatchObject({
      uploadName: 'k4-logo-apple.png',
      mimetype: 'image/png',
      rasterize: false,
    })
    expect(k4LogoUpload('Posnet', file)).toMatchObject({ rasterize: false })
    expect(k4LogoUpload('APC', file)).toBeNull()
  })

  it('has a logo for 37 of the 39 brands', () => {
    expect(names.filter((name) => k4LogoUpload(name, file)).length).toBe(37)
  })
})

describe('hasK4Logo', () => {
  const upload = k4LogoUpload('Brother', file)!

  it('knows the K4 logo, also renamed by Payload with -N', () => {
    expect(hasK4Logo('k4-logo-brother.webp', upload)).toBe(true)
    expect(hasK4Logo('k4-logo-brother-1.webp', upload)).toBe(true)
    expect(hasK4Logo('k4-logo-brother-12.webp', upload)).toBe(true)
  })

  it('uploads over an older or different logo', () => {
    expect(hasK4Logo('logo-brother.webp', upload)).toBe(false)
    expect(hasK4Logo('k4-logo-brother-x.webp', upload)).toBe(false)
    expect(hasK4Logo('k4-logo-brother-1.png', upload)).toBe(false)
    expect(hasK4Logo(null, upload)).toBe(false)
  })
})

describe('k4PartnerFields', () => {
  it('fits the one-line description in the panel field (200)', () => {
    for (const name of names) {
      const { shortDescription } = k4PartnerFields(name, file)
      expect(shortDescription?.length ?? 0).toBeLessThanOrEqual(200)
    }
  })
})

describe('k4BrandSettings', () => {
  const ids = new Map(names.map((name, index) => [name, index + 1]))
  const settings = k4BrandSettings(file, (name) => ids.get(name))

  it('keeps the 16 homepage brands in the package order', () => {
    expect(settings.home).toHaveLength(16)
    expect(settings.home[0]).toBe(ids.get('Posnet'))
    expect(settings.home.at(-1)).toBe(ids.get('Brother'))
  })

  it('lists every brand in a group of /marki, Samsung in two', () => {
    expect(settings.groups).toHaveLength(6)
    const listed = settings.groups.flatMap((group) => group.partners)
    expect(new Set(listed).size).toBe(39)
    expect(listed.filter((id) => id === ids.get('Samsung'))).toHaveLength(2)
  })

  it('stops on a brand without a record', () => {
    expect(() => k4BrandSettings(file, (name) => (name === 'HP' ? undefined : 1))).toThrow(/HP/)
  })
})
