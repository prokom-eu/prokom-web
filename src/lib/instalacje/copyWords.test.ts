import { describe, expect, it } from 'vitest'

import { COPY_WORDS } from './copyWords'

describe('COPY_WORDS (runda v6 §2.2)', () => {
  it('catches the forbidden phrasings', () => {
    for (const bad of [
      'Alarm, który budzi złodzieja, a nie Ciebie.',
      'Zanim przyjadą goście, a nie po pierwszej awarii.',
      'Nie kamera, tylko cały system.',
      'Mocniejszy router nie pomaga, tylko plan.',
      'Twój inteligentny obiekt',
      'Na żywo · Dom',
      'podgląd na żywo',
      'Obsługujemy kompleksowo',
      'kompleksowa obsługa',
      'bez kompromisów',
      'innowacyjne rozwiązania',
      'najwyższa jakość',
    ])
      expect(bad).toMatch(COPY_WORDS)
  })

  it('leaves everyday sentences', () => {
    for (const ok of [
      'Gdy padnie internet, dom dalej działa.',
      'Nie wiesz, od czego zacząć? Tylko zadzwoń.',
      'Kamera nie nagrywa pokoi. Tylko parking i wejście.',
      'Na żywopłocie',
      'nagrania zostają w domu, a podgląd masz w telefonie',
    ])
      expect(ok).not.toMatch(COPY_WORDS)
  })
})
