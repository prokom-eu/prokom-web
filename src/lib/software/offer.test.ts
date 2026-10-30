import { gzipSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import okno from '../../../seed/prokomsoftware/okno-oferty.json'
import { solutionData, solutionsToImport } from '../../seed/software/map'
import {
  buildOfferView,
  type OfferSolution,
  offerSolutionOf,
  type OfferSolutionDoc,
  relatedCard,
  softwareOfferSchema,
  validateSoftwareOffer,
} from './offer'
import { DEFAULT_PRICE_DISPLAY } from './solutionsIndex'

const offer = softwareOfferSchema.parse(okno)
const display = DEFAULT_PRICE_DISPLAY
const NBSP = String.fromCharCode(0xa0)
const zl = (value: string) => value.replace(/ (?=\d{3}\b)/g, NBSP)

const solutions = new Map<string, OfferSolution>(
  solutionsToImport().map((item) => {
    const solution = offerSolutionOf(solutionData(item) as OfferSolutionDoc)
    return [solution.slug, solution]
  }),
)
const prices = Object.fromEntries([...solutions].map(([slug, s]) => [slug, s.priceFrom]))

/** Page tokens as `fillText` fills them: `{termin}` and `{cena:<slug>}`. */
const fill = (value: string, term: string | null) =>
  value
    .replace('{termin}', term ?? '{termin}')
    .replace(/\{cena:([a-z0-9-]+)\}/g, (token, slug: string) =>
      prices[slug] === null || prices[slug] === undefined ? token : `${prices[slug]} zł`,
    )

function viewOf(slug: string, change: Partial<OfferSolution> = {}) {
  const solution = solutions.get(slug)
  if (!solution) throw new Error(`no ${slug}`)
  return buildOfferView({ ...solution, ...change }, { offer, display, related: [], fill })
}

describe('SoftwareSettings.offer schema', () => {
  it('accepts the seed package', () => {
    expect(validateSoftwareOffer(okno)).toBe(true)
  })

  it('points only to solutions of the seed', () => {
    for (const slug of Object.keys(offer.solutions)) expect(solutions.has(slug)).toBe(true)
  })

  it('rejects a mistyped key with a readable message', () => {
    const broken = { ...okno, common: { ...okno.common, quot: 'x' } }
    expect(validateSoftwareOffer(broken)).toMatch(/^Teksty okna oferty: common/)
  })

  it('needs a template for every category', () => {
    const { opieka: _dropped, ...categories } = okno.categories
    expect(validateSoftwareOffer({ ...okno, categories })).not.toBe(true)
  })
})

describe('offer window (board Katalog, stany/okno-90…98)', () => {
  it('strona firmowa: „W cenie” card with the „od” price, examples and guarantees', () => {
    const view = viewOf('strona-firmowa-z-panelem')
    expect(view.categoryName).toBe('Strony')
    expect(view.tone).toBe('www')
    expect(view.termLabel).toBe('Termin')
    expect(view.term).toBe('od 2 tygodni')
    expect(view.price).toEqual({
      kind: 'included',
      head: { before: 'od', amount: zl('2 490'), after: 'zł netto' },
      items: [
        'Do 5 podstron: oferta, realizacje, opinie, kontakt',
        'Panel do zmian i formularz prosto do Ciebie',
        'Gotowa pod Google i AI',
      ],
      more: 'Potrzebujesz więcej? Np. więcej niż 5 podstron, aktualności i blog, kolejny język — wycenimy na piśmie w 5–7 dni.',
    })
    expect(view.guarantees).toEqual([
      'Wycena na piśmie, ważna 30 dni',
      '30% zaliczki, reszta po odbiorze',
      'Kod, domena i dane są Twoje',
    ])
    expect(view.forWhomShort).toBe('każda firma usługowa, handlowa')
    expect(view.bar).toEqual({ label: 'Termin od 2 tygodni', price: `od ${zl('2 490')} zł netto` })
  })

  it('strona firmowa: „W cenie każdego projektu” without repeating the price card', () => {
    const { benefits } = viewOf('strona-firmowa-z-panelem')
    expect(benefits.title).toBe('W cenie każdego projektu')
    expect(benefits.items).toEqual([
      'Działa na telefonie i komputerze',
      'Podstawy SEO i widoczność w Google i AI',
      'Szkolenie z panelu na Twoich treściach',
      'Kod, domena i dane są Twoje',
    ])
  })

  it('strona firmowa: steps with the build term and the care price from Solutions', () => {
    const { steps } = viewOf('strona-firmowa-z-panelem')
    expect(steps.map((step) => step.time)).toEqual([
      'dziś lub jutro',
      '5–7 dni',
      'od 2 tygodni',
      'od 149 zł / mies.',
    ])
  })

  it('strona firmowa: questions with the price, the included points and the payment', () => {
    const { faq } = viewOf('strona-firmowa-z-panelem')
    expect(faq.map((item) => item.q)).toEqual([
      `Co jest w cenie od ${zl('2 490')} zł?`,
      'A jeśli potrzebuję więcej?',
      'Ile płacę i kiedy?',
    ])
    expect(faq[0]?.a).toMatch(
      /^Do 5 podstron: oferta, realizacje, opinie, kontakt, panel do zmian i formularz prosto do Ciebie, gotowa pod Google i AI\. Do tego projekt/,
    )
    expect(faq[1]?.a).toMatch(/^Np\. więcej niż 5 podstron/)
    expect(faq[2]?.a).toMatch(/^30% zaliczki po podpisaniu umowy, reszta \(70%\)/)
  })

  it('no examples: the „więcej” note goes, the question takes its fallback answer', () => {
    const view = viewOf('strona-firmowa-z-panelem', { moreExamples: [] })
    expect(view.price).toMatchObject({ kind: 'included', more: null })
    expect(view.faq[1]?.a).toMatch(/^Większy zakres wycenimy/)
  })

  it('pensjonat: the remark under the price and its own situation text', () => {
    const view = viewOf('strona-dla-hotelu-lub-pensjonatu')
    expect(view.note).toBe(
      'Zapytanie o termin jest w cenie. Rezerwacja z zaliczką online to osobna wycena.',
    )
    expect(view.situations).toEqual([
      'Goście znajdują Cię dziś tylko przez portale, które biorą prowizję',
    ])
  })

  it('system: payment in stages, panel ownership, four questions', () => {
    const view = viewOf('system-zlecen-i-grafik-ekip')
    expect(view.guarantees.slice(1)).toEqual([
      '30% zaliczki, reszta ratami po etapach',
      'Kod, panel i dane są Twoje',
    ])
    expect(view.faq).toHaveLength(4)
    expect(view.needs[0]).toBe('15 min rozmowy o tym, jak pracuje Twoja firma')
  })

  it('aplikacja without a price: the ask text, no price question, „Cena i termin” bar', () => {
    const view = viewOf('aplikacja-dla-ekip-w-terenie')
    expect(view.price).toEqual({
      kind: 'ask',
      title: 'Zapytaj o wycenę',
      note: 'Odpowiadamy w ciągu [CZAS ODPOWIEDZI].',
      text: 'Cena zależy od ekranów i programów, które już masz. Po krótkiej rozmowie dostajesz cenę i termin na piśmie.',
    })
    expect(view.term).toBe('po krótkiej rozmowie')
    expect(view.steps[1]?.name).toBe('Wycena na piśmie')
    expect(view.steps[2]?.time).toBe('po wycenie')
    expect(view.bar).toEqual({ label: 'Cena i termin', price: 'po rozmowie' })
    expect(view.faq[0]?.q).toBe('Dlaczego nie ma ceny?')
  })

  it('automatyzacja: its own „Co dostajesz” points from Solutions win over the category', () => {
    const view = viewOf('powiadomienia-sms-i-e-mail')
    expect(view.benefits.items).toContain(
      'Koszty SMS według zużycia widzisz w wycenie, zanim cokolwiek uruchomimy',
    )
  })

  it('opieka: levels with the recommended one first chosen, the table, no guarantees', () => {
    const view = viewOf('opieka-nad-strona-i-systemem')
    expect(view.termLabel).toBe('Czas reakcji')
    expect(view.guarantees).toEqual([])
    if (view.price.kind !== 'levels') throw new Error('levels expected')
    expect(view.price.title).toBe('Wybierz poziom opieki')
    expect(view.price.defaultIndex).toBe(1)
    expect(view.price.levels.map((level) => [level.amount, level.suffix, level.price])).toEqual([
      ['149 zł', '/ mies.', '149 zł / mies.'],
      ['299 zł', '/ mies.', '299 zł / mies.'],
      ['790 zł', '/ mies.', '790 zł / mies.'],
    ])
    expect(view.price.levels[1]).toMatchObject({
      barLabel: 'Opieka · poziom Rozszerzona',
      projectName: 'Opieka nad stroną i systemem · poziom Rozszerzona',
      recommended: true,
    })
    expect(view.price.rows[3]).toEqual({
      label: 'Monitoring 24/7',
      cells: [{ kind: 'no' }, { kind: 'more' }, { kind: 'yes' }],
    })
    expect(view.price.rows.at(-1)?.cells[1]).toEqual({ kind: 'text', text: '8 h roboczych' })
    // Everything „Co dostajesz” would say is already in the table (board: no section).
    expect(view.benefits.items).toEqual([])
    expect(view.note).toMatch(/^Opieka nie jest obowiązkowa/)
    expect(view.faq.map((item) => item.q)[0]).toBe('Czy opieka jest obowiązkowa?')
  })

  it('przejęcie: one price, its own „więcej”, steps with its term, payment after the work', () => {
    const view = viewOf('przejecie-po-innym-wykonawcy')
    expect(view.price).toMatchObject({
      kind: 'included',
      more: 'Dokumentacja i przeniesienie na nasz serwer? Wycenimy po sprawdzeniu, co zastaliśmy.',
    })
    expect(view.guarantees).toEqual([
      'Wycena na piśmie, ważna 30 dni',
      'Płacisz po wykonaniu',
      'Dostępy zapisane na Twoją firmę',
    ])
    expect(view.steps[1]).toEqual({
      name: 'Dostępy',
      text: 'Odzyskujemy dostęp do serwera, domeny i panelu.',
      time: 'od 2 dni',
    })
    expect(view.benefits.items).toEqual([
      'Lista dostępów dla Ciebie',
      'Pomagamy, nawet jeśli nie masz żadnych haseł',
      'Rozmowa jeszcze dziś albo jutro',
      'Potem opieka od 149 zł / mies., jeśli chcesz',
    ])
  })

  it('audyt: the quick one chosen, 0 zł is a price (not „Zapytaj”), steps per kind', () => {
    const view = viewOf('audyt-strony-lub-programu')
    expect(view.termLabel).toBe('Wynik')
    expect(view.tone).toBe('aud')
    if (view.price.kind !== 'levels') throw new Error('levels expected')
    expect(view.price.defaultIndex).toBe(0)
    expect(view.price.levels[0]).toMatchObject({
      amount: '0 zł',
      suffix: 'za darmo',
      price: '0 zł',
      barLabel: 'Audyt szybki',
    })
    expect(view.price.levels[1]?.price).toBe('990 zł netto')
    expect(view.price.levels[2]?.columnName).toBe('Strona + program / dostępność')
    expect(view.price.levels.map((level) => level.steps[1]?.time)).toEqual([
      '2 dni robocze',
      '1 tydzień',
      '2 tygodnie',
    ])
    expect(view.benefits.title).toBe('Przy każdym audycie')
    expect(view.benefits.items[0]).toBe('Zgłoszenie bez logowania i zobowiązań')
    expect(view.needs).toEqual(['Adres strony lub programu', 'Telefon albo e-mail do raportu'])
  })

  it('leaves empty sections out instead of rendering them empty', () => {
    const view = viewOf('strona-firmowa-z-panelem', {
      included: [],
      example: undefined,
      situations: [],
    })
    expect(view.price).toMatchObject({ kind: 'included', items: [] })
    expect(view.example).toBeNull()
    expect(view.situations).toEqual([])
  })

  it('drops a text whose page value is missing (production `fillText` returns null)', () => {
    const solution = solutions.get('strona-firmowa-z-panelem')!
    const strict = (value: string) => (value.includes('{cena:') ? null : value)
    const view = buildOfferView(solution, { offer, display, related: [], fill: strict })
    expect(view.steps.at(-1)).toMatchObject({ name: 'Odbiór i opieka', time: '' })
  })

  it('a level without a price goes with its table column (no shifted columns)', () => {
    const doc = solutionData(
      solutionsToImport().find((item) => item.slug === 'opieka-nad-strona-i-systemem')!,
    ) as OfferSolutionDoc
    const broken = offerSolutionOf({
      ...doc,
      levels: (doc.levels ?? []).map((level, i) =>
        i === 0 ? { ...level, price: null as unknown as number } : level,
      ),
    })
    expect(broken.levels.map((level) => level.name)).toEqual(['Rozszerzona', 'Systemy'])
    expect(broken.levelRows.find((row) => row.label === 'Monitoring 24/7')?.cells).toEqual([
      'dochodzi',
      'tak',
    ])
  })

  it('related cards carry the one-line price', () => {
    const care = solutions.get('opieka-nad-strona-i-systemem')!
    const app = solutions.get('aplikacja-dla-ekip-w-terenie')!
    expect(relatedCard(care, display).price).toBe('od 149 zł / mies.')
    expect(relatedCard(app, display).price).toBe('Zapytaj o wycenę')
  })
})

describe('offer windows sent with the catalog page', () => {
  // All windows go with the page (no request on opening, ADR-014 doprecyzowania SWR3 pkt 3):
  // 30.10.2026 ≈ 85 KB raw, 12 KB gzip for 29 solutions. Over the limit → load them per window.
  it('stay under 20 KB gzip for the seed', () => {
    const views = [...solutions.keys()].map((slug) => viewOf(slug))
    expect(gzipSync(JSON.stringify(views)).length).toBeLessThan(20 * 1024)
  })
})

describe('offer texts of the seed', () => {
  it('every published solution gets an example, situations and steps (SWD2 decyzja 3)', () => {
    for (const slug of solutions.keys()) {
      const view = viewOf(slug)
      expect(view.example, slug).toBeTruthy()
      expect(view.situations.length, slug).toBeGreaterThan(0)
      const steps = view.price.kind === 'levels' ? (view.price.levels[0]?.steps ?? []) : view.steps
      expect(steps.length, slug).toBe(4)
      expect(view.faq.length, slug).toBeGreaterThanOrEqual(3)
      if (view.price.kind === 'included') expect(view.price.items.length, slug).toBeGreaterThan(0)
    }
  })
})
