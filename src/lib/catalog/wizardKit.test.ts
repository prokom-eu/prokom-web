import { describe, expect, it } from 'vitest'

import kreator from '../../../seed/prokombiznes/kreator.json'
import { wizardFromSeed, wizardSchema } from './wizard'
import {
  buildKit,
  defaultAnswers,
  parseWizardAnswers,
  proposedSlugs,
  wizardSummary,
  type KitProduct,
  type WizardAnswers,
} from './wizardKit'

const rules = wizardSchema.parse(
  wizardFromSeed(
    kreator,
    (id) =>
      ({
        hx: 'hx-slug',
        pol: 'pol-slug',
        ergo: 'ergo-slug',
        d3: 'd3-slug',
        gopos: 'gopos',
        u7: 'u7-slug',
      })[id],
  ),
)

const products: Record<string, KitProduct> = {
  'hx-slug': { slug: 'hx-slug', name: 'Posnet Thermal HX Online', benefit: 'Szybki wydruk' },
  'pol-slug': { slug: 'pol-slug', name: 'Terminal płatniczy PolCard' },
  gopos: { slug: 'gopos', name: 'GoPOS' },
}
const lookup = (slug: string) => products[slug]

const answers = (fields: Partial<WizardAnswers> = {}): WizardAnswers => ({
  ...defaultAnswers(rules, 'gastro'),
  ...fields,
})

describe('defaultAnswers', () => {
  it('starts with the needs of the business type and the defaults of the scale', () => {
    expect(defaultAnswers(rules, 'gastro')).toEqual({
      businessType: 'gastro',
      salesPoints: '1',
      computers: '1–3',
      premises: 'nowy',
      needs: ['pos', 'kasa', 'term', 'siec'],
    })
  })
})

describe('buildKit', () => {
  it('proposes a product per chosen need, in the order ticked, with its name and benefit', () => {
    const kit = buildKit(rules, answers(), lookup)
    expect(kit.items.map((item) => [item.need, item.slug, item.name])).toEqual([
      ['pos', 'gopos', 'GoPOS'],
      ['kasa', 'hx-slug', 'Posnet Thermal HX Online'],
      ['term', 'pol-slug', 'Terminal płatniczy PolCard'],
      // A proposal whose product is not published here: the need itself, without a product.
      ['siec', null, 'Sieć i Wi-Fi'],
    ])
    expect(kit.items[1]).toMatchObject({ caption: 'Szybki wydruk', quantity: 1 })
  })

  it('counts the register and POS per sales point („4+” as 4)', () => {
    const kit = buildKit(rules, answers({ salesPoints: '4+' }), lookup)
    expect(kit.items.find((item) => item.need === 'kasa')?.quantity).toBe(4)
    expect(kit.items.find((item) => item.need === 'term')?.quantity).toBe(1)
    expect(buildKit(rules, answers({ salesPoints: '0' }), lookup).items[1]?.quantity).toBe(1)
  })

  it('lists the services of the chosen needs (menu for gastronomy) and the ones always included', () => {
    expect(buildKit(rules, answers(), lookup).services).toEqual([
      'Fiskalizacja i programowanie',
      'Wgranie menu',
      'Konfiguracja przed dostawą',
      'Szkolenie zespołu',
      'Serwis z Rabki',
    ])
    expect(
      buildKit(rules, answers({ businessType: 'sklep', needs: ['pos'] }), lookup).services,
    ).toContain('Wgranie towarów')
  })

  it('shows a badge only when its needs and premises match', () => {
    expect(buildKit(rules, answers(), lookup).badges.map((badge) => badge.value)).toEqual(['700'])
    expect(buildKit(rules, answers({ premises: 'dziala' }), lookup).badges).toEqual([])
    expect(
      buildKit(rules, answers({ needs: ['ksef'] }), lookup).badges.map((badge) => badge.value),
    ).toEqual(['KSeF'])
  })
})

describe('proposedSlugs', () => {
  it('lists the proposed products of the chosen needs once, before they are looked up', () => {
    expect(proposedSlugs(rules, answers())).toEqual(['gopos', 'hx-slug', 'pol-slug', 'u7-slug'])
  })
})

describe('parseWizardAnswers', () => {
  it('accepts answers made of the ids and options of the rules', () => {
    expect(parseWizardAnswers(rules, answers({ when: 'Przed sezonem' }))).toMatchObject({
      businessType: 'gastro',
      when: 'Przed sezonem',
    })
  })

  it('rejects answers outside the rules (another site, an old form, a forged body)', () => {
    for (const bad of [
      answers({ businessType: 'kosmos' as WizardAnswers['businessType'] }),
      answers({ needs: ['kasa', 'drukarka-3d'] }),
      answers({ needs: ['kasa', 'kasa'] }),
      answers({ salesPoints: '17' }),
      answers({ premises: 'zamek' }),
      answers({ when: 'Kiedyś' }),
      { businessType: 'gastro' },
      'gastro',
    ]) {
      expect(parseWizardAnswers(rules, bad)).toBeNull()
    }
  })
})

describe('wizardSummary', () => {
  it('names the answers and the kit in Polish for the e-mail and the panel', () => {
    const chosen = answers({ salesPoints: '2', when: 'Przed sezonem' })
    const summary = wizardSummary(rules, chosen, buildKit(rules, chosen, lookup))
    expect(summary).toMatchObject({
      'Rodzaj firmy': 'Gastronomia',
      'Stanowiska sprzedaży': '2',
      Lokal: 'Nowy lokal / nowa firma',
    })
    expect(summary).not.toHaveProperty('Na kiedy')
    expect(summary.Zestaw).toEqual([
      '2 × GoPOS',
      '2 × Posnet Thermal HX Online',
      'Terminal płatniczy PolCard',
      'Sieć i Wi-Fi',
    ])
    expect(summary['W cenie']).toContain('Wgranie menu')
  })
})
