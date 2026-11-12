import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import file from '../../../seed/prokombiznes/k4/strony-k4.json'
import { isBlockAllowed } from '../../blocks/registry'
import { packageItems } from '../../lib/biznes/pages/gopos'
import { pickProgram } from '../../lib/biznes/pages/insert'
import {
  HERO_VARIANTS,
  isSectionVariant,
  parseSectionData,
  type SectionVariant,
} from '../../lib/biznes/pages/sections'
import { forbiddenContent } from '../../lib/catalog/contentRules'
import type { BzSectionBlock, FaqBlock } from '../../payload-types'
import {
  goposK4Layout,
  goposPhotoFiles,
  goposPhotoPath,
  upgradeCareIcons,
  upgradeCareSupplyLink,
  upgradeGoposPhotos,
  GOPOS_PHOTO_ALT,
  goposLead,
  goposPill,
  insertK4Layout,
  KSEF_SWITCH_DATE,
  ksefK4Layout,
  opiekaK4Layout,
  ulgaK4Layout,
  vendingK4Layout,
  sourceLink,
  type K4FirmaFile,
  type K4PagesFile,
  type K4VendingFile,
  venueHeading,
} from './k4Pages'
import type { PageBlock } from './page'

const pages = file as unknown as K4PagesFile
const firma = file as unknown as K4FirmaFile
const vending = file as unknown as K4VendingFile
/** Every board id is known (the seed maps them to slugs; here the id stands for the slug). */
const identity = (id: string) => id

const sections = (layout: PageBlock[]) =>
  layout.filter((block): block is BzSectionBlock => block.blockType === 'bzSection')

const dataOf = <V extends SectionVariant>(layout: PageBlock[], variant: V) => {
  const block = sections(layout).find((b) => b.variant === variant)
  return block ? parseSectionData(variant, block.data) : null
}

describe.each([
  ['gopos', goposK4Layout(pages, identity).layout],
  ['insert', insertK4Layout(pages, identity).layout],
  ['opieka-it', opiekaK4Layout(firma, identity).layout],
  ['automaty-vendingowe', vendingK4Layout(vending, identity).layout],
  ['ksef', ksefK4Layout(identity).layout],
  ['ulga-na-kase-fiskalna', ulgaK4Layout(identity).layout],
])('K4 layout of /%s (K4h)', (_page, layout) => {
  it('uses Biznes blocks only and opens with a hero kind (the H1)', () => {
    expect(layout.every((block) => isBlockAllowed('biznes', block.blockType))).toBe(true)
    const first = layout[0] as BzSectionBlock
    expect(HERO_VARIANTS.has(first.variant as SectionVariant)).toBe(true)
    expect(
      sections(layout).filter((b) => HERO_VARIANTS.has(b.variant as SectionVariant)),
    ).toHaveLength(1)
  })

  it('every section carries data that fits its kind', () => {
    for (const block of sections(layout)) {
      expect(isSectionVariant(block.variant)).toBe(true)
      expect(parseSectionData(block.variant, block.data), block.variant).not.toBeNull()
    }
  })

  it('has each anchor once', () => {
    const anchors = sections(layout).flatMap((b) => (b.anchor ? [b.anchor] : []))
    expect(new Set(anchors).size).toBe(anchors.length)
  })

  it('shows no prices, banned brands or „Aut.” (K4-FINAL §1)', () => {
    const text = JSON.stringify(layout)
    expect(forbiddenContent(text, { legalAmounts: true })).toEqual([])
    expect(text).not.toMatch(/\bAut\./)
  })

  it('gives every source a link', () => {
    for (const block of sections(layout)) {
      if (block.source) expect(block.sourceUrl, block.source).toMatch(/^https:\/\//)
    }
  })

  it('keeps SVG icon paths free of hard spaces (D13)', () => {
    const icons = JSON.stringify(layout).match(/"(?:iconPath|ic|ikona)":"[^"]*"/g) ?? []
    for (const icon of icons) expect(icon).not.toContain(String.fromCharCode(0xa0))
  })
})

/** `segImg` before 03.11: product ids. */
const OLD_SEG_IMG = { rest: 'd3', kaw: 'v3mix', dow: 'kds', ft: 'v3', hot: 'd3' }

describe('/gopos (K4h)', () => {
  const { layout, missing } = goposK4Layout(pages, identity)

  it('a package with 3 modules gives 3 positions', () => {
    const data = dataOf(layout, 'gopos-package')!
    expect(packageItems(data.modules, new Set(['gokds', 'emenu']))).toHaveLength(3)
  })

  it('starts with the restaurant package on every section that shows it', () => {
    for (const variant of ['gopos-areas', 'gopos-hub', 'gopos-package'] as const) {
      expect(dataOf(layout, variant)?.initial).toEqual(['gokds', 'emenu', 'gohub'])
    }
  })

  it('says the H1 short, keeps „GoPOS dla gastronomii” in the pill and lead (K31 §13.1)', () => {
    const hero = sections(layout).find((b) => b.variant === 'gopos-hero')!
    const plain = (value?: string | null) => value?.replace(/ /g, ' ')
    expect(plain(hero.heading)).toBe('Sala, kuchnia i dowozy.')
    expect(plain(hero.headingAccent)).toBe('Jeden system.')
    expect(dataOf(layout, 'gopos-hero')!.pill).toMatch(/^GoPOS dla gastronomii · /)
    expect(dataOf(layout, 'gopos-hero')!.pill).toContain('Autoryzowany partner GoPOS')
    expect(plain(hero.lead)).toContain('GoPOS dla gastronomii')
  })

  it('never repeats the H1 in a venue tab (PRODUKCJA-BIZNES-1211 §3 pkt 2)', () => {
    const hero = sections(layout).find((b) => b.variant === 'gopos-hero')!
    const h1 = `${hero.heading} ${hero.headingAccent}`
    const venues = dataOf(layout, 'gopos-venues')!.venues
    for (const venue of venues) {
      expect(`${venue.h1a} ${venue.h1b}`).not.toBe(h1)
      expect(venue.h1a).not.toMatch(/GoPOS dla gastronomii/)
    }
    expect(venues[0]!.h1a).toMatch(/^Restauracja/)
  })

  it('shows real screens on the cards and areas, plans and an axis (PRODUKCJA-BIZNES-1211 §3)', () => {
    const ids = new Map<string, number>()
    const mediaOf = (file: string) => {
      if (!ids.has(file)) ids.set(file, ids.size + 1)
      return ids.get(file)
    }
    const built = goposK4Layout(pages, identity, mediaOf).layout
    const areas = dataOf(built, 'gopos-areas')!.areas
    expect(areas.every((area) => typeof area.image === 'number')).toBe(true)
    const shots = dataOf(built, 'cards')!.shots!
    expect(shots.map((shot) => shot?.frame)).toEqual(['doc', 'screen', 'phone'])
    expect(shots[2]!.image).toBe(ids.get('ekran-gopos-now.webp'))
    const tiers = dataOf(built, 'gopos-package')!.tiers!
    expect(tiers.head).toEqual(['Basic', 'Pro', 'Unlimited'])
    expect(tiers.rows.map((row) => row.t)).toEqual(['GoOrder', 'GoHub', 'GoCRM'])
    expect(dataOf(built, 'steps')!.axis).toBe(true)
    expect(dataOf(built, 'chips')!.groups.every((group) => group.ic)).toBe(true)
    const stats = sections(built).find((block) => block.variant === 'stats')!
    expect(stats.items?.every((item) => item.icon)).toBe(true)
  })

  it('lights the KDS screen at the kitchen step', () => {
    const hero = dataOf(layout, 'gopos-hero')!
    expect(hero.flow[1]!.k).toBe('Kuchnia')
    expect(hero.stage.find((device) => device.step === 1)?.slug).toBe('kds')
  })

  it('puts the screen-on photos and their places on the stage (POPRAWKI-0311 §A)', () => {
    const ids = new Map<string, number>()
    const mediaOf = (file: string) => {
      if (!ids.has(file)) ids.set(file, ids.size + 1)
      return ids.get(file)
    }
    const hero = dataOf(goposK4Layout(pages, identity, mediaOf).layout, 'gopos-hero')!
    const kds = hero.stage.find((device) => device.slug === 'kds')!
    expect(kds.image).toBe(ids.get('kuchnia-kds.webp'))
    expect(kds.pos).toBe('right:0;top:4%;width:46%;height:36%')
    expect(kds.lab).toBe('right:4%;top:-14px')
    expect(hero.stage.every((device) => typeof device.image === 'number')).toBe(true)
  })

  it('gives every venue its GoPOS photo by file, a slug as before (POPRAWKI-0311 §B)', () => {
    const mediaOf = (file: string) => (file === 'kasa-d3.webp' ? undefined : 9)
    const venues = dataOf(goposK4Layout(pages, identity, mediaOf).layout, 'gopos-venues')!.venues
    expect(venues.find((venue) => venue.key === 'rest')?.image).toBe(9)
    // A photo not uploaded leaves the venue without a picture, never with a wrong one.
    expect(venues.find((venue) => venue.key === 'kaw')?.image).toBeUndefined()
    // Without a media resolver (older calls) the files are left out.
    const plain = dataOf(goposK4Layout(pages, identity).layout, 'gopos-venues')!.venues
    expect(plain.every((venue) => venue.image === undefined)).toBe(true)
  })

  it('brings an untouched page to the photos, keeping what the panel changed', () => {
    const mediaOf = (file: string) => file.length
    const fresh = goposK4Layout(pages, identity, mediaOf).layout
    const old = goposK4Layout(
      { ...pages, gopos: { ...pages.gopos, segImg: OLD_SEG_IMG } },
      identity,
    ).layout
    // The hero stage of the old seed: no photos, no placements.
    const stored = old.map((block) =>
      block.blockType === 'bzSection' && block.variant === 'gopos-hero'
        ? {
            ...block,
            lead: 'Zmienione w panelu',
            data: {
              ...(block.data as object),
              stage: (block.data as { stage: object[] }).stage.map(({ ...device }, i) => {
                delete (device as { image?: number }).image
                delete (device as { pos?: string }).pos
                delete (device as { lab?: string }).lab
                // A label edited in the panel stays.
                return i === 0 ? { ...device, label: 'Kuchnia (KDS)' } : device
              }),
            },
          }
        : block,
    )
    const upgraded = upgradeGoposPhotos(stored, fresh)!
    const stage = dataOf(upgraded, 'gopos-hero')!.stage
    expect(stage.map(({ image, pos, lab }) => ({ image, pos, lab }))).toEqual(
      dataOf(fresh, 'gopos-hero')!.stage.map(({ image, pos, lab }) => ({ image, pos, lab })),
    )
    expect(stage[0]!.label).toBe('Kuchnia (KDS)')
    expect(dataOf(upgraded, 'gopos-venues')!.venues.map((v) => v.image)).toEqual(
      dataOf(fresh, 'gopos-venues')!.venues.map((v) => v.image),
    )
    // Only the pictures change: the lead edited in the panel stays.
    expect(sections(upgraded).find((b) => b.variant === 'gopos-hero')?.lead).toBe(
      'Zmienione w panelu',
    )
    // Already upgraded: nothing to write.
    expect(upgradeGoposPhotos(upgraded, fresh)).toBeNull()
  })

  it('has alt text and a file for every GoPOS photo it names', () => {
    for (const file of goposPhotoFiles(pages)) {
      expect(GOPOS_PHOTO_ALT[file], file).toBeTruthy()
      expect(existsSync(goposPhotoPath(file)), file).toBe(true)
    }
    // 9 of the design package + 2 producer screens of PRODUKCJA-BIZNES-1211 §3.
    expect(goposPhotoFiles(pages)).toHaveLength(11)
  })

  it('leaves the device list out when no device is known (the panel needs one)', () => {
    const devices = new Set(pages.gopos.devs)
    const { layout: without } = goposK4Layout(pages, (id) => (devices.has(id) ? undefined : id))
    expect(dataOf(without, 'products')).toBeNull()
    for (const block of sections(without)) {
      expect(parseSectionData(block.variant, block.data), block.variant).not.toBeNull()
    }
  })

  it('shows the gastronomy bundles after the devices (PREMIUM-1011, reverses K32 §3)', () => {
    const variants = layout.flatMap((block) =>
      block.blockType === 'bzSection' ? [block.variant] : [],
    )
    expect(variants.indexOf('bundles')).toBe(variants.indexOf('products') + 1)
    expect(dataOf(layout, 'bundles')?.slugs).toEqual([
      'zestaw-gastro-foodtruck',
      'zestaw-kawiarnia-lada',
      'zestaw-restauracja-bistro',
    ])
  })

  it('knows every board id', () => {
    expect(missing).toEqual([])
  })
})

describe('/insert (K4h)', () => {
  it('„Który Subiekt”: 3 combinations give 123 / GT / nexo', () => {
    const data = dataOf(insertK4Layout(pages, identity).layout, 'insert-picker')!
    expect(pickProgram(data.questions, data.rules, [1, 0, 0]).slug).toBe('s123')
    expect(pickProgram(data.questions, data.rules, [0, 0, 1]).slug).toBe('gt')
    expect(pickProgram(data.questions, data.rules, [0, 0, 0]).slug).toBe('nexo')
  })

  it('InsPunkty start at 40 + 30', () => {
    const data = dataOf(insertK4Layout(pages, identity).layout, 'insert-points')!
    expect(data.defaults).toEqual([40, 30])
  })

  it('PREMIUM-1011: the box composition from `insert.orb`, nexo in the middle', () => {
    const data = dataOf(insertK4Layout(pages, identity).layout, 'insert-hero')!
    expect(data.orbit?.center).toBe('nexo')
    expect(data.orbit?.items.map((item) => item.slug)).toEqual([
      'rachmistrz',
      'rewizor',
      'gratyfikant',
      'gestor',
      'biuro',
      's123',
    ])
    // A program missing in the catalog drops out; without nexo the shelf stays.
    const noRewizor = insertK4Layout(pages, (id) => (id === 'rewizor' ? undefined : id))
    expect(dataOf(noRewizor.layout, 'insert-hero')!.orbit?.items).toHaveLength(5)
    const noNexo = insertK4Layout(pages, (id) => (id === 'nexo' ? undefined : id))
    expect(dataOf(noNexo.layout, 'insert-hero')!.orbit).toBeUndefined()
  })

  it('drops the KSeF sections and reports the ids when the database lacks them', () => {
    const { layout, missing } = insertK4Layout(pages, (id) =>
      id === 'ksef' || id === 'insert-inspunkty-ksef' ? undefined : id,
    )
    expect(dataOf(layout, 'insert-ksef')).toBeNull()
    expect(dataOf(layout, 'insert-points')).toBeNull()
    expect(missing).toEqual(['ksef', 'insert-inspunkty-ksef'])
  })
})

describe('sourceLink', () => {
  it('links the first domain of the caption', () => {
    expect(sourceLink('Integracje według gopos.pl/gohub · stan na 26.10.2026')).toBe(
      'https://gopos.pl/gohub',
    )
    expect(sourceLink('Źródło: ksef.podatki.gov.pl · stan na 25.10.2026')).toBe(
      'https://ksef.podatki.gov.pl',
    )
    expect(sourceLink('Dane producenta')).toBeUndefined()
  })
})

describe('upgradeCareIcons (D13)', () => {
  const fresh = opiekaK4Layout(firma, identity).layout
  const hard = String.fromCharCode(0xa0)
  const withAreas = (map: (area: Record<string, unknown>, i: number) => Record<string, unknown>) =>
    fresh.map((block) =>
      block.blockType === 'bzSection' && block.variant === 'care-areas'
        ? {
            ...block,
            data: {
              areas: (block.data as { areas: Record<string, unknown>[] }).areas.map(map),
            },
          }
        : block,
    )

  it('fills missing icons and repairs hard spaces, keeping what the panel changed', () => {
    const stored = withAreas((area, i) => {
      const { iconPath, ...rest } = area
      if (i === 0) return { ...rest, co: ['Zmienione w panelu'] }
      if (i === 1) return { ...rest, iconPath: String(iconPath).replaceAll(' ', hard) }
      return i === 2 ? { ...rest, iconPath: 'M1 1h2' } : rest
    })
    const upgraded = upgradeCareIcons(stored, fresh)!
    const areas = dataOf(upgraded, 'care-areas')!.areas
    const seedAreas = dataOf(fresh, 'care-areas')!.areas
    expect(areas[0]!.iconPath).toBe(seedAreas[0]!.iconPath)
    expect(areas[0]!.co).toEqual(['Zmienione w panelu'])
    expect(areas[1]!.iconPath).toBe(seedAreas[1]!.iconPath)
    // An icon chosen in the panel stays.
    expect(areas[2]!.iconPath).toBe('M1 1h2')
    for (const area of areas) expect(area.iconPath ?? '').not.toContain(hard)
    expect(upgradeCareIcons(upgraded, fresh)).toBeNull()
  })
})

describe('upgradeCareSupplyLink (plan 0611 §6.4 #9)', () => {
  const fresh = opiekaK4Layout(firma, identity).layout
  const seats = (layout: typeof fresh) =>
    dataOf(layout, 'seats') as unknown as { label: string; link?: { label: string; href: string } }

  it('the seed links „Ile masz stanowisk?” to the IT deliveries', () => {
    expect(seats(fresh).link).toEqual({
      label: 'Dostawy IT — gotowe do pracy',
      href: '/dostawy-it-dla-firm',
    })
  })

  it('adds the link to a stored section without one, keeping its texts; then nothing', () => {
    const stored = fresh.map((block) => {
      if (block.blockType !== 'bzSection' || block.variant !== 'seats') return block
      const { link: _link, ...data } = block.data as { link?: unknown }
      return { ...block, data: { ...data, label: 'Zmienione w panelu' } }
    })
    const upgraded = upgradeCareSupplyLink(stored, fresh)!
    expect(seats(upgraded).label).toBe('Zmienione w panelu')
    expect(seats(upgraded).link?.href).toBe('/dostawy-it-dla-firm')
    expect(upgradeCareSupplyLink(upgraded, fresh)).toBeNull()
  })
})

describe('/opieka-it (K4i)', () => {
  const { layout, missing } = opiekaK4Layout(firma, identity)
  const text = JSON.stringify(layout)

  it('gives every area its icon and device photo, and the comparison its colours (board W3)', () => {
    const areas = dataOf(layout, 'care-areas')?.areas ?? []
    expect(areas).toHaveLength(8)
    for (const area of areas) {
      expect(area.iconPath, area.t).toMatch(/^M/)
      expect(area.image, area.t).toBeTruthy()
    }
    const table = sections(layout).find((block) => block.variant === 'table')
    expect(table && parseSectionData('table', table.data)?.contrast).toBe(true)
  })

  it('has no price model and no downtime calculator (K4-FINAL §1, K35 §0)', () => {
    expect(text).not.toMatch(/abonament|stała opłata|paszport IT/i)
    expect(text).not.toMatch(/przestoju|kalkulator/i)
    expect(missing).toEqual([])
  })

  it('opens with the K34 H1 (decyzja Krystiana 01.11)', () => {
    const hero = layout[0] as BzSectionBlock
    expect(hero.variant).toBe('care-hero')
    expect(hero.heading).toBe('Opieka IT dla firm:')
    expect(hero.headingAccent).toContain('pod jedną opieką')
  })

  it('writes the hours as „pn–pt 9:00–17:00”, never „9–17”', () => {
    expect(text).not.toMatch(/9–17(?!:)/)
  })

  it('drops the review and care buttons when the database lacks the products', () => {
    const { layout: without } = opiekaK4Layout(firma, (id) => (id === 'przeglad' ? undefined : id))
    const kinds = sections(without).map((block) => block.variant)
    expect(kinds).not.toContain('care-hero')
    expect(kinds).not.toContain('seats')
  })
})

describe('/automaty-vendingowe (K4j)', () => {
  const { layout, missing } = vendingK4Layout(vending, identity)
  const text = JSON.stringify(layout)

  it('says „Partner Optivendi”, never „autoryzowany” or a discount', () => {
    expect(dataOf(layout, 'vending-hero')?.pill).toContain('Partner Optivendi')
    expect(text).not.toMatch(/autoryzowan|−20%|-20%/i)
    expect(missing).toEqual([])
  })

  it('lists the machines by product kind and the offer by subcategory', () => {
    expect(dataOf(layout, 'vending-picker')?.tabs).toHaveLength(7)
    const names = dataOf(layout, 'catalog-tabs')?.tabs.map((t) => t.subcategory.replace(/\s/g, ' '))
    expect(names).toEqual([
      'Automaty z windą i mikromarkety',
      'Automaty spożywcze',
      'Boxomaty i skrytki',
    ])
  })
})

describe('/ksef (K4j, D-K4-7)', () => {
  const { layout } = ksefK4Layout(identity)

  it('carries both versions with the switch day of 1.01.2027', () => {
    const hero = dataOf(layout, 'ksef-hero')!
    expect(hero.switchDate).toBe(KSEF_SWITCH_DATE)
    expect(hero.before.h1a).toContain('od 1')
    expect(hero.after.h1a).toContain('obowiązuje wszystkie firmy')
    const band = dataOf(layout, 'band')!
    expect(band.after?.heading).toBe('Sprawdźmy Twój KSeF.')
  })

  it('asks about the limit before the switch only', () => {
    const quiz = dataOf(layout, 'ksef-quiz')!
    expect(quiz.questions.find((q) => q.key === 'lim')?.beforeOnly).toBe(true)
  })

  it('has the FAQ (FAQPage) and the sources as links', () => {
    const faqBlock = layout.find((block) => block.blockType === 'faq') as FaqBlock
    expect(faqBlock.items).toHaveLength(5)
    expect(dataOf(layout, 'sources')?.items.every((item) => item.url.startsWith('https://'))).toBe(
      true,
    )
  })

  it('drops the hero and the band when the database lacks the KSeF service', () => {
    const { layout: without } = ksefK4Layout((id) => (id === 'ksef' ? undefined : id))
    const kinds = sections(without).map((block) => block.variant)
    expect(kinds).not.toContain('ksef-hero')
    expect(kinds).not.toContain('band')
  })
})

describe('/ulga-na-kase-fiskalna (K4j)', () => {
  const { layout } = ulgaK4Layout(identity)

  it('says that the accountant settles it, next to the amount', () => {
    const text = JSON.stringify(layout)
    expect(text).toMatch(/rozlicza Twoja księgowa/)
    expect(text).toMatch(/do 700/)
  })

  it('shows the 4 cash registers of the board', () => {
    expect(dataOf(layout, 'products')?.slugs).toEqual(['ergo', 'k10', 'minilt', 'pospay2'])
  })
})

describe('GoPOS H1 helpers (PRODUKCJA-BIZNES-1211 §3)', () => {
  it('puts the phrase in front of the pill once, keeps the partner status', () => {
    expect(goposPill('Autoryzowany partner GoPOS · Podhale i Małopolska')).toBe(
      'GoPOS dla gastronomii · Autoryzowany partner GoPOS',
    )
    expect(goposPill('GoPOS dla gastronomii · X')).toBe('GoPOS dla gastronomii · X')
  })

  it('names the phrase in the lead once', () => {
    expect(goposLead('Wdrażamy GoPOS w kawiarniach.')).toBe(
      'Wdrażamy GoPOS dla gastronomii w kawiarniach.',
    )
    expect(goposLead('GoPOS dla gastronomii w Rabce.')).toBe('GoPOS dla gastronomii w Rabce.')
  })

  it('gives a tab that repeats the old H1 its venue and own sentence; others stay', () => {
    const old = { t: 'Restauracja', h1a: 'GoPOS dla gastronomii:', h1b: 'sala…' }
    expect(
      venueHeading({ ...old, leadM: 'Zamówienie przy stoliku, kuchnia na ekranie, X.' }),
    ).toEqual({ h1a: 'Restauracja:', h1b: 'zamówienie przy stoliku, kuchnia na ekranie' })
    // Without `leadM` the second line stays as it was.
    expect(venueHeading(old)).toEqual({ h1a: 'Restauracja:', h1b: 'sala…' })
    expect(venueHeading({ t: 'Kawiarnia', h1a: 'Lada', h1b: 'w jednym systemie' })).toEqual({
      h1a: 'Lada',
      h1b: 'w jednym systemie',
    })
  })
})
