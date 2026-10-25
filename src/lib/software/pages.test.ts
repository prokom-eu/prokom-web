import { describe, expect, it } from 'vitest'

import {
  inquiryNumberParam,
  notFoundSchema,
  thanksSchema,
  validateNotFound,
  validateThanks,
} from './pages'

// Start texts from the boards `Dziekujemy` and `NieZnaleziono` (the package has no JSON for them).
const thanks = {
  title: 'Dziękujemy, mamy to.',
  lead: 'Twoja wiadomość trafiła prosto do zespołu PRO-KOM Software.',
  numberLabel: 'Numer zgłoszenia',
  stepsTitle: 'Co dalej',
  steps: [
    'W ciągu [CZAS ODPOWIEDZI] oddzwonimy albo odpiszemy, jak wolisz. Dopytamy o szczegóły.',
    '**Krótka rozmowa, 30 minut**: u Ciebie, w salonie w Rabce albo online.',
    '**Szkic do klikania i wycena na piśmie**, ważna 30 dni. Decydujesz Ty, bez zobowiązań.',
  ],
  urgent: 'Pilna sprawa? Zadzwoń:',
  hours: '[GODZINY]',
  more: {
    eyebrow: 'Zanim się odezwiemy',
    title: 'Zobacz, jak to wygląda u innych.',
    cards: [
      {
        title: 'Podglądy do klikania',
        text: 'Przykładowe strony i panele, które możesz przeklikać na telefonie.',
        cta: 'Otwórz podglądy →',
        href: '/#podglady',
      },
    ],
  },
}

const notFound = {
  title: 'Tej strony tu nie ma. Reszta jest.',
  lead: 'Adres mógł się zmienić albo w linku wkradła się literówka.',
  search: { label: 'Czego szukasz?', button: 'Szukaj', popularLabel: 'Często szukane:' },
  wizard: {
    title: 'Nie wiesz, czego szukać?',
    text: 'Kreator dobierze rozwiązanie w 60 sekund: 5 krótkich kroków i cena od razu.',
    cta: 'Uruchom kreator →',
    href: '/dobierz',
  },
  places: {
    eyebrow: 'Popularne miejsca',
    title: 'Dokąd chcesz pójść?',
    tiles: [{ title: 'Cennik', note: 'ceny „od”, na piśmie', href: '/cennik' }],
  },
  brokenLink: {
    text: 'Kliknąłeś zepsuty link na naszej stronie? Daj znać, poprawimy.',
    cta: 'Zgłoś błędny link',
    href: '/kontakt',
  },
}

describe('thanks page texts', () => {
  it('accept the texts of the board', () => {
    expect(thanksSchema.safeParse(thanks).error?.issues).toBeUndefined()
  })

  it('reject a mistyped key', () => {
    expect(validateThanks({ ...thanks, titel: 'x' })).toMatch(/^Strona „Dziękujemy”/)
  })

  it('allow at most 3 cards', () => {
    const cards = Array.from({ length: 4 }, () => thanks.more.cards[0])
    expect(validateThanks({ ...thanks, more: { ...thanks.more, cards } })).toMatch(/more\.cards/)
  })
})

describe('404 page texts', () => {
  it('accept the texts of the board', () => {
    expect(notFoundSchema.safeParse(notFound).error?.issues).toBeUndefined()
  })

  it('allow at most 6 tiles', () => {
    const tiles = Array.from({ length: 7 }, () => notFound.places.tiles[0])
    expect(validateNotFound({ ...notFound, places: { ...notFound.places, tiles } })).toMatch(
      /places\.tiles/,
    )
  })

  it('reject an unsafe link', () => {
    const wizard = { ...notFound.wizard, href: 'javascript:alert(1)' }
    expect(validateNotFound({ ...notFound, wizard })).toMatch(/wizard\.href/)
  })
})

describe('inquiryNumberParam', () => {
  it('takes a Software inquiry number', () => {
    expect(inquiryNumberParam('PKS-2026-0142')).toBe('PKS-2026-0142')
    expect(inquiryNumberParam('PKS-2026-1234567')).toBe('PKS-2026-1234567')
    expect(inquiryNumberParam(['PKS-2026-0001', 'PKS-2026-0002'])).toBe('PKS-2026-0001')
  })

  it('ignores anything else, so the page never echoes the address', () => {
    for (const value of [undefined, '', 'PKB-2026-0142', 'PKS-2026-01', '<b>PKS-2026-0142</b>']) {
      expect(inquiryNumberParam(value)).toBeNull()
    }
  })
})
