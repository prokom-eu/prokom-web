import { describe, expect, it } from 'vitest'

import {
  autoStep,
  builderHint,
  buildItem,
  scope,
  moduleCountLabel,
  toggleModule,
} from './heroBuilder'

const ALL = ['www', 'zlec', 'app', 'fv', 'sms', 'rap', 'ai']

describe('hero „Twój system” mock-up', () => {
  it('keeps the modules in list order whatever the click order', () => {
    expect(toggleModule(['app'], 'www', ALL)).toEqual(['www', 'app'])
    expect(toggleModule(['www', 'app'], 'www', ALL)).toEqual(['app'])
  })

  it('assembles itself one module at a time, rests two steps, then starts over', () => {
    let state = { count: 3, hold: 0 }
    const counts: number[] = []
    for (let i = 0; i < 8; i++) {
      state = autoStep(state, ALL.length)
      counts.push(state.count)
    }
    expect(counts).toEqual([4, 5, 6, 7, 7, 7, 1, 2])
  })

  it('names the count, scope and hint as the board does (v21: „Zakres”)', () => {
    expect([1, 3, 5].map(moduleCountLabel)).toEqual(['moduł', 'moduły', 'modułów'])
    expect(scope(2)).toEqual({ level: 'na start', width: 36 })
    expect(scope(4).level).toBe('średni')
    expect(scope(7)).toEqual({ level: 'etapami', width: 100 })
    expect([0, 1, 3, 5, 7].map(builderHint)).toEqual([
      'dodaj pierwszy moduł',
      'może wystarczyć gotowe rozwiązanie',
      'mały system szyty na miarę',
      'własny system firmy',
      'duży system, budowany w etapach',
    ])
  })

  it('adds one project item per set of modules', () => {
    expect(buildItem(['www', 'zlec', 'app'])).toEqual({
      id: 'build-www-zlec-app',
      name: 'system z 3 modułów',
    })
    expect(buildItem(['ai']).name).toBe('system z 1 modułu')
  })
})
