import { describe, expect, it } from 'vitest'

import forBusiness from '../../../seed/prokomeu/model/DlaFirm.json'
import deliveries from '../../../seed/prokomeu/model/Dostawy.json'
import home from '../../../seed/prokomeu/model/Main.json'
import { hubTrust } from '../../seed/prokom/map'
import { PROKOM_SHARED } from '../../seed/shared/prokom'
import { SOFTWARE_SHARED } from '../../seed/shared/software'
import { HUB_CLIENT_COUNT, replaceStrings, SOFTWARE_CLIENT_COUNT } from './klienci_10000'

const N = '10 000+'

describe('klienci_10000 (23.11)', () => {
  it('replaces whole strings anywhere in a document, and only those', () => {
    const doc = {
      counters: [{ value: '100+', label: 'klientów firmowych', facts: ['100+', 'Posnet'] }],
      text: 'Ponad 100 klientów firmowych z Podhala i Małopolski',
      other: 'Mamy 100+ urządzeń',
      n: 5,
    }
    expect(replaceStrings(doc, HUB_CLIENT_COUNT)).toEqual({
      counters: [{ value: N, label: 'klientów', facts: [N, 'Posnet'] }],
      text: 'Ponad 10 000 klientów z Podhala i Małopolski',
      other: 'Mamy 100+ urządzeń',
      n: 5,
    })
    expect(replaceStrings({ a: 'x', b: [1, null] }, HUB_CLIENT_COUNT)).toBeNull()
  })

  it('is idempotent: a second run changes nothing', () => {
    const once = replaceStrings({ v: '100+' }, HUB_CLIENT_COUNT)
    expect(replaceStrings(once, HUB_CLIENT_COUNT)).toBeNull()
  })

  it('leaves the seeds as they are (they already have the new count)', () => {
    for (const doc of [home, forBusiness, deliveries, hubTrust(), PROKOM_SHARED]) {
      expect(replaceStrings(doc, HUB_CLIENT_COUNT)).toBeNull()
    }
    expect(replaceStrings(SOFTWARE_SHARED, SOFTWARE_CLIENT_COUNT)).toBeNull()
  })
})
