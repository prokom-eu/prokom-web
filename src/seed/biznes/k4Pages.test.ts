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
import { hardSpaces } from '../../lib/text/hardSpace'
import type { BzSectionBlock, FaqBlock } from '../../payload-types'
import {
  aboutK4Layout,
  contactK4Layout,
  goposK4Layout,
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
  ['o-firmie', aboutK4Layout(firma).layout],
  ['kontakt', contactK4Layout(firma).layout],
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
})

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

  it('lights the KDS screen at the kitchen step', () => {
    const hero = dataOf(layout, 'gopos-hero')!
    expect(hero.flow[1]!.k).toBe('Kuchnia')
    expect(hero.stage.find((device) => device.step === 1)?.slug).toBe('kds')
  })

  it('leaves the device list out when no device is known (the panel needs one)', () => {
    const devices = new Set(pages.gopos.devs)
    const { layout: without } = goposK4Layout(pages, (id) => (devices.has(id) ? undefined : id))
    expect(dataOf(without, 'products')).toBeNull()
    for (const block of sections(without)) {
      expect(parseSectionData(block.variant, block.data), block.variant).not.toBeNull()
    }
  })

  it('leaves the gastronomy bundles out (K32 §3) and knows every board id', () => {
    expect(JSON.stringify(layout)).not.toContain('zestaw-gastro')
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

describe('/opieka-it (K4i)', () => {
  const { layout, missing } = opiekaK4Layout(firma, identity)
  const text = JSON.stringify(layout)

  it('has no price model and no downtime calculator (K4-FINAL §1, K35 §0)', () => {
    expect(text).not.toMatch(/abonament|stała opłata|paszport IT/i)
    expect(text).not.toMatch(/przestoju|kalkulator/i)
    expect(missing).toEqual([])
  })

  it('opens with the K34 H1 (decyzja Krystiana 01.11)', () => {
    const hero = layout[0] as BzSectionBlock
    expect(hero.variant).toBe('care-hero')
    expect(hero.heading).toContain('pod jedną opieką')
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

describe('/o-firmie (K4i)', () => {
  const { layout } = aboutK4Layout(firma)

  it('shows 4 lines (decyzja Krystiana 01.11) and „100+ klientów firmowych”', () => {
    expect(dataOf(layout, 'lines')?.lines).toHaveLength(4)
    const lines = sections(layout).find((block) => block.variant === 'lines')
    expect(lines?.heading).toBe('Jedna firma, cztery linie.')
    expect(JSON.stringify(layout)).toContain('100+')
    expect(JSON.stringify(layout)).not.toContain('firm i instytucji pod opieką')
  })

  it('names the statuses in full words and groups the other brands', () => {
    const hero = dataOf(layout, 'about-hero')!
    expect(hero.authorizations.map((a) => a.status)).toEqual([
      'Autoryzowany serwis',
      'Autoryzowany serwis',
      'Autoryzowany partner',
      'Autoryzowany partner',
    ])
    expect(dataOf(layout, 'brands')?.groups.map((g) => g.k)).toContain(
      hardSpaces('Pozostałe marki w ofercie'),
    )
  })
})

describe('/kontakt (K4i)', () => {
  const { layout } = contactK4Layout(firma)

  it('has the form with the topic chips at #formularz', () => {
    const form = sections(layout).find((block) => block.variant === 'contact-form')
    expect(form?.anchor).toBe('formularz')
    expect(dataOf(layout, 'contact-form')?.topics).toContain('Kasa fiskalna')
  })

  it('names only Rabka and biznes@ (K4-FINAL §1)', () => {
    const emails = JSON.stringify(layout).match(/[w.+-]+@[w.-]+/g) ?? []
    expect(emails.every((email) => email === 'biznes@pro-kom.eu')).toBe(true)
    expect(JSON.stringify(layout)).not.toMatch(/ul. [^"]*Zakopane/)
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
