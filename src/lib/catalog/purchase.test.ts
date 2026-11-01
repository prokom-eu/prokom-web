import { describe, expect, it } from 'vitest'

import { purchaseSentence, serviceStrip, type PurchaseInput } from './purchase'

const card = (category: string | null, fields: Partial<PurchaseInput> = {}): PurchaseInput => ({
  category,
  subcategory: null,
  brand: 'lenovo',
  ...fields,
})
const ready = (input: PurchaseInput) => serviceStrip(input)[1]!.text

describe('serviceStrip (K36 §13)', () => {
  it('data transfer only where it makes sense', () => {
    expect(ready(card('laptopy'))).toBe('konfiguracja i przeniesienie danych')
    expect(ready(card('programy-sprzedazowe-erp'))).toBe('konfiguracja i przeniesienie danych')
    expect(ready(card('serwery-nas-ups', { subcategory: 'Serwery plików NAS' }))).toBe(
      'konfiguracja i przeniesienie danych',
    )
    expect(ready(card('serwery-nas-ups', { subcategory: 'Zasilacze UPS' }))).toBe(
      'uruchomienie i szkolenie na miejscu',
    )
    expect(ready(card('niszczarki'))).toBe('uruchomienie i szkolenie na miejscu')
  })

  it('cash registers: fiscalisation; vending: Optivendi', () => {
    expect(ready(card('kasy-fiskalne'))).toBe('fiskalizacja i szkolenie na miejscu')
    expect(ready(card('drukarki-fiskalne'))).toBe('fiskalizacja i szkolenie na miejscu')
    const vending = serviceStrip(card('automaty-vendingowe', { brand: 'optivendi' }))
    expect(vending.map((item) => item.title)).toEqual([
      'Gwarancja producenta',
      'Gotowe do pracy',
      'Serwis Optivendi',
    ])
    expect(vending[1]!.text).toBe('dobór i uruchomienie z Optivendi')
  })

  it('a PRO-KOM service: no producer warranty (K36 §5)', () => {
    const strip = serviceStrip(card('serwis-przeglady', { brand: 'pro-kom' }))
    expect(strip.map((item) => item.title)).toEqual([
      'Usługa PRO-KOM',
      'Oddzwaniamy w 60 min',
      'Na miejscu',
    ])
  })
})

describe('purchaseSentence', () => {
  it('follows the category', () => {
    expect(purchaseSentence(card('telefony'))).toMatch(/przeniesienie danych/)
    expect(purchaseSentence(card('kasy-fiskalne'))).toBe(
      'Dobór, fiskalizacja, szkolenie i serwis — w jednej ofercie.',
    )
    expect(purchaseSentence(card('automaty-vendingowe'))).toMatch(/Optivendi/)
    expect(purchaseSentence(card('monitory'))).toBe(
      'Dobór, dostawa, uruchomienie, szkolenie i serwis — w jednej ofercie.',
    )
    expect(purchaseSentence(card(null))).not.toMatch(/przeniesienie danych/)
  })
})
