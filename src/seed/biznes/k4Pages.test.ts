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
import type { BzSectionBlock } from '../../payload-types'
import { goposK4Layout, insertK4Layout, sourceLink, type K4PagesFile } from './k4Pages'
import type { PageBlock } from './page'

const pages = file as unknown as K4PagesFile
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
