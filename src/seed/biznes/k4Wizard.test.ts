import { describe, expect, it } from 'vitest'

import file from '../../../seed/prokombiznes/k4/konfigurator-k4.json'
import { wizardSchema } from '../../lib/catalog/wizard'
import { k4Wizard, type K4WizardFile } from './k4Wizard'

const data = file as unknown as K4WizardFile
const { wizard } = k4Wizard(data, (key) => `karta-${key}`)

describe('k4Wizard (konfigurator-k4.json → BiznesSettings.wizard)', () => {
  it('gives rules the schema accepts: 9 firms, 4 situations, 4 scales, 16 needs', () => {
    expect(() => wizardSchema.parse(wizard)).not.toThrow()
    expect(wizard.firms).toHaveLength(9)
    expect(wizard.stages.map((s) => s.id)).toEqual(['nowa', 'wymiana', 'awaria', 'ksef'])
    expect(wizard.scales.map((s) => s.id)).toEqual(['1', '2', '4', '10'])
    expect(wizard.needs).toHaveLength(16)
  })

  it('names the backups need one way and orders the needs like the engine of the board', () => {
    const ids = wizard.needs.map((n) => n.id)
    expect(ids).not.toContain('kopie-zapasowe')
    expect(ids.slice(6, 10)).toEqual(['tel', 'siec', 'kopie', 'ups'])
    expect(wizard.presets.biuro).toEqual(['komp', 'ksef', 'druk', 'kopie', 'opieka'])
    expect(wizard.recommendations.kopie?.title).toBeTruthy()
    const serw = wizard.questions.produkcja?.find((q) => q.id === 'serw')
    expect(serw?.add).toContain('kopie')
    expect(Object.keys(serw?.overrides ?? {})).toEqual(['kopie'])
  })

  it('maps product keys to cards, lists by firm and by scale apart', () => {
    const kasa = wizard.recommendations.kasa!
    expect(kasa.products).toEqual(['karta-ergo', 'karta-minilt', 'karta-k10'])
    expect(kasa.byFirm.sklep).toEqual(['karta-neo', 'karta-jota', 'karta-bingo'])
    expect(kasa.byScale['10']).toEqual(['karta-neo', 'karta-jota', 'karta-hx'])
    expect(wizard.questions.gastro?.find((q) => q.id === 'dowozy')).toMatchObject({
      default: false,
      overrides: { prog: ['karta-gohub', 'karta-goorder', 'karta-gopos'] },
      tag: 'dowozy i zamówienia online',
    })
  })

  it('reports keys without a card and leaves them out', () => {
    const result = k4Wizard(data, (key) => (key === 'gohub' ? undefined : key))
    expect(result.missing).toEqual(['gohub'])
    const dowozy = result.wizard.questions.gastro?.find((q) => q.id === 'dowozy')
    expect(dowozy?.overrides.prog).toEqual(['goorder', 'gopos'])
  })

  it('maps bundle groups to areas, links to categories and keeps the scenes', () => {
    expect(wizard.bundleAreas).toEqual({
      sklep: 'sklep',
      gastro: 'gastronomia',
      hotel: 'noclegi',
      biuro: 'biuro',
      gabinet: 'gabinet',
      szkola: 'szkola',
    })
    expect(wizard.recommendations.waga?.links[0]).toEqual({
      label: 'Oferta: wagi',
      kind: 'oferta',
      target: 'wagi-sklepowe',
    })
    expect(wizard.scenes.gastro).toBe('gastro')
    expect(wizard.scenes.inna).toBeUndefined()
  })
})
