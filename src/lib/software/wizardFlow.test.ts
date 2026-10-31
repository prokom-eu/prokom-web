import { describe, expect, it } from 'vitest'

import kreator from '../../../seed/prokomsoftware/kreator.json'
import rozwiazania from '../../../seed/prokomsoftware/rozwiazania.json'
import { wizardSeed } from '../../seed/software/wizardExtras'
import { softwareWizardSchema } from './wizard'
import {
  addOnSlugsOf,
  contactFieldOf,
  EMPTY_ANSWERS,
  fillWizardTexts,
  orderedNeeds,
  parseSoftwareAnswers,
  parseWizardParams,
  phrasesOf,
  previewOf,
  resultIdOf,
  resultView,
  shopHintApplies,
  stepsOf,
  tileHintOf,
  type WizardAnswers,
  type WizardSolution,
  winterDateText,
  wizardMessage,
  wizardSummary,
} from './wizardFlow'

const rules = softwareWizardSchema.parse(wizardSeed(kreator))
const NBSP = String.fromCharCode(0xa0) // formatPrice groups thousands with it

/** The one „od” price, term and levels of the package, as the solutions index carries them. */
const solutions: Record<string, WizardSolution> = Object.fromEntries(
  rozwiazania.items.map((item) => [
    item.slug,
    {
      name: item.name,
      priceFrom: item.priceFrom,
      leadTime: item.leadTime,
      priceMonthly: item.slug === 'opieka-nad-strona-i-systemem',
      levels: (item.levels ?? []).map((level) => ({ name: level.name, price: level.price })),
    },
  ]),
)

const answers = (patch: Partial<WizardAnswers>): WizardAnswers => ({ ...EMPTY_ANSWERS, ...patch })
const view = (patch: Partial<WizardAnswers>) => resultView(rules, answers(patch), solutions)

describe('Software wizard steps', () => {
  it('has 4 steps, „opisz po swojemu” 3 — as many as the step names', () => {
    expect(stepsOf(EMPTY_ANSWERS)).toEqual(['need', 'detail', 'scope', 'result'])
    expect(stepsOf({ own: true })).toEqual(['need', 'describe', 'result'])
    expect(stepsOf(EMPTY_ANSWERS)).toHaveLength(rules.steps.length)
    expect(stepsOf({ own: true })).toHaveLength(rules.stepsOwn.length)
  })
})

describe('Software wizard tiles of step 1', () => {
  it('show the lowest „od” price of the need’s results, from Solutions', () => {
    expect(tileHintOf(rules, 'firm', solutions)).toBe(`od 1${NBSP}999 zł`)
    expect(tileHintOf(rules, 'wiz', solutions)).toBe('od 999 zł')
    expect(tileHintOf(rules, 'prog', solutions)).toBe(`od 2${NBSP}990 zł`)
    expect(tileHintOf(rules, 'rozb', solutions)).toBe(`od 6${NBSP}990 zł`)
  })

  it('ask for a quote where no result has a price', () => {
    expect(tileHintOf(rules, 'app', solutions)).toBe('Zapytaj o wycenę')
    expect(tileHintOf(rules, 'auto', solutions)).toBe('Zapytaj o wycenę')
    expect(tileHintOf(rules, 'firm', {})).toBe('Zapytaj o wycenę')
  })
})

describe('Software wizard result (stany kreator-d-*)', () => {
  it('d-a: firm + pensjonat with an old site → hotel page, „W cenie”, add-ons', () => {
    const result = view({ need: 'firm', options: ['nocleg'], have: 'stara' })
    expect(result.resultId).toBe('pensjonat')
    expect(result.result.n).toBe('Strona dla pensjonatu lub hotelu')
    expect(result.price).toBe(`od 1${NBSP}999 zł netto`)
    expect(result.priceSub).toBe(rules.priceDisplay.priceSub)
    expect(result.term).toBe('od 2 tygodni')
    expect(result.ask).toBe(false)
    expect(result.included).toEqual(rules.scope.pensjonat?.included)
    expect(result.more.map((each) => each.id)).toEqual(['cen', 'atr', 'op', 'zal'])
    expect(result.toQuote).toEqual([])
    expect(result.scope).toBe(rules.scopeNotes.pensjonat)
    expect(result.resultNote).toBe('+ przebudowa starej strony, bez utraty pozycji w Google')
    expect(result.recommend).toMatch(/bez prowizji portali/)
    expect(result.honest).toBeNull()
    expect(result.checklist).toEqual(['Logo', 'Zdjęcia', 'Teksty o firmie', 'Domena'])
    expect(result.choice).toEqual(['Strona dla firmy', 'Pensjonat, hotel, apartamenty'])
    expect(result.addOns.map(({ id, price }) => [id, price])).toEqual([
      ['opieka', 'od 149 zł / mies.'],
      ['sms', 'Zapytaj o wycenę'],
    ])
  })

  it('d-a: ticked „więcej” goes to „Do wyceny”, the „od” price stays', () => {
    const result = view({ need: 'firm', options: ['nocleg'], more: ['zal'], addOns: ['opieka'] })
    expect(result.price).toBe(`od 1${NBSP}999 zł netto`)
    expect(result.toQuote).toEqual(['Rezerwacja z zaliczką online'])
    expect(result.more.find((each) => each.id === 'zal')?.on).toBe(true)
    expect(result.addOns.find((each) => each.id === 'opieka')?.on).toBe(true)
  })

  it('d-b: program + zlecenia, on paper → orders system, a sentence for paper', () => {
    const result = view({ need: 'prog', options: ['zlec'], have: 'kartki' })
    expect(result.resultId).toBe('zlecenia')
    expect(result.price).toBe(`od 3${NBSP}490 zł netto`)
    expect(result.term).toBe('od 3 tygodni')
    expect(result.recommend).toMatch(/jednego modułu dla 5 osób/)
    expect(result.addOns.map(({ id, price }) => [id, price])).toEqual([
      ['appE', 'Zapytaj o wycenę'],
      ['opiekaSys', '790 zł / mies.'],
    ])
  })

  it('d-b: another program answer falls to the `*` result; Excel gets the honest note', () => {
    expect(view({ need: 'prog' }).resultId).toBe('zlecenia')
    expect(view({ need: 'prog', options: ['klienci'] }).resultId).toBe('crm')
    expect(view({ need: 'prog', options: ['zlec'], have: 'excel' }).honest).toMatch(/arkusz/)
    expect(view({ need: 'prog', options: ['excel'] }).honest).toMatch(/arkusz/)
  })

  it('d-c: rebuild — three problems or more read differently than fewer', () => {
    const many = view({ need: 'odsw', options: ['wolna', 'tel', 'google'], url: 'stara.pl' })
    expect(many.resultId).toBe('przebudowa')
    expect(many.price).toBe(`od 1${NBSP}499 zł netto`)
    expect(many.recommend).toMatch(/kilka rzeczy naraz/)
    expect(many.choice).toEqual([
      'Przebudowa starej strony',
      'Wolno się ładuje',
      'Źle wygląda na telefonie',
      'Nikt jej nie znajduje',
    ])
    expect(many.addOns.map(({ id, price }) => [id, price])).toEqual([
      ['opieka', 'od 149 zł / mies.'],
      ['audyt', '0 zł'],
    ])
    // The price in the sentence comes from Solutions when the texts are filled on the server.
    expect(view({ need: 'odsw', options: ['wolna'] }).recommend).toContain(
      '{cena:przebudowa-starej-strony}',
    )
  })

  it('d-d: an app has no price → „Zapytaj o wycenę”, its own lines, an honest note', () => {
    const result = view({ need: 'app', options: ['ekipa'] })
    expect(result.resultId).toBe('app')
    expect(result.ask).toBe(true)
    expect(result.price).toBe(rules.priceDisplay.noPrice.price)
    expect(result.priceSub).toBe(rules.priceDisplay.noPrice.priceSub)
    expect(result.term).toBe(rules.priceDisplay.noPrice.term)
    expect(result.included).toEqual([])
    expect(result.honest).toMatch(/w przeglądarce telefonu/)
    expect(result.addOns.map(({ id, price }) => [id, price])).toEqual([
      ['zlec', `od 3${NBSP}490 zł`],
      ['opiekaSys', '790 zł / mies.'],
    ])
  })

  it('d-e: „opisz po swojemu” is free advice with its own chip and no add-ons', () => {
    const result = view({ own: true, description: 'Coś' })
    expect(result.resultId).toBe('own')
    expect(result.price).toBe('Bezpłatnie')
    expect(result.term).toBe(rules.free.term)
    expect(result.addOns).toEqual([])
    expect(result.choice).toEqual(['Opis po swojemu'])
  })

  it('a solution missing on the site (removed, draft) asks for a quote, never fails', () => {
    const result = resultView(rules, answers({ need: 'firm', options: ['nocleg'] }), {})
    expect(result.price).toBe('Zapytaj o wycenę')
    expect(result.ask).toBe(true)
    expect(result.addOns.map((each) => each.price)).toEqual([
      'Zapytaj o wycenę',
      'Zapytaj o wycenę',
    ])
  })

  it('rozbudowana: features outside the price go to „Do wyceny”', () => {
    expect(view({ need: 'rozb' }).recommend).toMatch(/^Zaczniemy od podstron i bloga/)
    const inPrice = view({ need: 'rozb', options: ['blog'] })
    expect(inPrice.recommend).toBe('Wybrane funkcje: Wiele podstron i blog. Mieszczą się w cenie.')
    expect(inPrice.toQuote).toEqual([])
    const outside = view({ need: 'rozb', options: ['blog', 'jez'], more: ['szuk'] })
    expect(outside.recommend).toMatch(/^Wybrane funkcje: Wiele podstron i blog, Kilka języków\. /)
    expect(outside.toQuote).toEqual(['Kilka języków', 'Wyszukiwarka na stronie'])
  })

  it('firmowa: fast and from scratch reads differently; a business card from scratch is honest', () => {
    expect(view({ need: 'firm', options: ['bud'], when: 'asap', have: 'nic' }).recommend).toMatch(
      /ruszamy z podstawą/,
    )
    expect(view({ need: 'firm', options: ['bud'], when: 'asap' }).recommend).toMatch(
      /zbiera zapytania z Google/,
    )
    expect(view({ need: 'wiz', options: ['bud'], have: 'nic' }).honest).toMatch(/Profil Firmy/)
    expect(view({ need: 'wiz', options: ['bud'] }).honest).toBeNull()
  })

  it('a site with the old one gets care and the audit as add-ons', () => {
    const ids = (patch: Partial<WizardAnswers>) => view(patch).addOns.map((each) => each.id)
    expect(ids({ need: 'firm', options: ['bud'], have: 'stara' })).toEqual(['opieka', 'audyt'])
    expect(ids({ need: 'firm', options: ['bud'] })).toEqual(['opieka', 'sms'])
    expect(ids({ need: 'auto', options: ['sms'] })).toEqual(['excelS', 'opiekaSys'])
  })

  it('winter note: the date from the rule, the bigger job without it', () => {
    expect(winterDateText(rules.winterDeadline)).toBe('30 listopada')
    expect(view({ need: 'firm', when: 'zima' }).whenNote).toBe(
      'Przed sezonem zimowym zdążymy, jeśli zaczniemy do 30 listopada.',
    )
    expect(view({ need: 'prog', when: 'zima' }).whenNote).toBe(rules.whenNotes.zimaBig)
    expect(view({ need: 'prog', when: 'asap' }).whenNote).toBe(rules.whenNotes.asap)
    expect(view({ need: 'prog' }).whenNote).toBe(rules.whenNotes.default)
    expect(winterDateText({ day: 1, month: 3 })).toBe('1 marca')
  })
})

describe('Software wizard shop hint', () => {
  it('applies to a firm page for a shop and switches the result to the shop', () => {
    const shop = answers({ need: 'firm', options: ['handel'] })
    expect(shopHintApplies(rules, shop)).toBe(true)
    expect(resultIdOf(rules, shop)).toBe('firmowa')
    const switched = resultView(rules, { ...shop, shop: true }, solutions)
    expect(switched.resultId).toBe('sklep')
    expect(switched.price).toBe(`od 8${NBSP}990 zł netto`)
    expect(switched.term).toBe('od 5 tygodni')
    expect(switched.included).toEqual(rules.scope.sklep?.included)
    expect(switched.recommend).toMatch(/Sprzedajesz online/)
  })

  it('does nothing for other answers', () => {
    const bud = answers({ need: 'firm', options: ['bud'], shop: true })
    expect(shopHintApplies(rules, bud)).toBe(false)
    expect(resultIdOf(rules, bud)).toBe('firmowa')
  })
})

describe('Software wizard preview', () => {
  it('is idle before a need and for „opisz po swojemu”', () => {
    expect(previewOf(rules, EMPTY_ANSWERS).kind).toBe('idle')
    expect(previewOf(rules, answers({ own: true })).kind).toBe('idle')
  })

  it('hotel site with languages, booking and cards; 3-item menu', () => {
    const preview = previewOf(rules, answers({ need: 'firm', options: ['nocleg'] }))
    if (preview.kind !== 'www') throw new Error(preview.kind)
    expect(preview.brand[0]).toBe('Twój Pensjonat')
    expect(preview.features).toEqual(expect.arrayContaining(['lang', 'booking', 'cards']))
    expect(preview.features).not.toContain('map')
    expect(preview.navs).toEqual(['Oferta', 'O nas', 'Kontakt'])
  })

  it('a business card has a map and no menu; unknown answers use the default brand', () => {
    const preview = previewOf(rules, answers({ need: 'wiz' }))
    if (preview.kind !== 'www') throw new Error(preview.kind)
    expect(preview.features).toEqual(['map'])
    expect(preview.navs).toEqual([])
    expect(preview.brand[0]).toBe('Twoja Firma')
  })

  it('orders system view; chosen problems before and after', () => {
    const sys = previewOf(rules, answers({ need: 'prog', options: ['zlec'] }))
    expect(sys.kind === 'sys' && sys.view.t).toBe('Zlecenia · ten tydzień')
    const odsw = previewOf(rules, answers({ need: 'odsw', options: ['google'] }))
    expect(odsw.kind === 'odsw' && odsw.issues).toEqual([
      ['nikt jej nie znajduje', 'gotowa pod Google i AI'],
    ])
    const empty = previewOf(rules, answers({ need: 'odsw' }))
    expect(empty.kind === 'odsw' && empty.issues).toHaveLength(3)
  })

  it('app and automation views follow the answers, else the defaults', () => {
    const app = previewOf(rules, answers({ need: 'app', options: ['klienci'] }))
    expect(app.kind === 'app' && app.view.t).toBe('Twój Pensjonat')
    const auto = previewOf(rules, answers({ need: 'auto', options: ['ai'] }))
    expect(auto.kind === 'auto' && auto.actions).toEqual(['Odpowiedź na zapytanie, PL · EN · DE'])
    const autoDefault = previewOf(rules, answers({ need: 'auto' }))
    expect(autoDefault.kind === 'auto' && autoDefault.actions).toHaveLength(3)
  })
})

describe('Software wizard URL parameters', () => {
  it('?potrzeba= opens the details, with ?firma= the scope', () => {
    expect(parseWizardParams(rules, { potrzeba: 'prog' })).toMatchObject({
      step: 'detail',
      answers: { need: 'prog' },
    })
    expect(parseWizardParams(rules, { potrzeba: 'firm', firma: 'nocleg' })).toMatchObject({
      step: 'scope',
      answers: { need: 'firm', options: ['nocleg'] },
    })
  })

  it('?firma= alone picks the first need that asks for the kind of business', () => {
    expect(parseWizardParams(rules, { firma: 'bud' })).toMatchObject({
      step: 'scope',
      answers: { need: 'firm', options: ['bud'] },
    })
  })

  it('?tryb=opis starts „opisz po swojemu”; unknown values are ignored', () => {
    expect(parseWizardParams(rules, { tryb: 'opis' })).toMatchObject({
      step: 'describe',
      answers: { own: true },
    })
    expect(parseWizardParams(rules, { potrzeba: 'nie-ma', firma: 'x' })).toEqual({
      step: 'need',
      answers: EMPTY_ANSWERS,
    })
    expect(parseWizardParams(rules, { potrzeba: 'prog', firma: 'nocleg' })).toMatchObject({
      step: 'detail',
      answers: { need: 'prog', options: [] },
    })
  })
})

describe('Software wizard answers on the server', () => {
  const sent = {
    need: 'firm',
    own: false,
    options: ['nocleg'],
    have: 'stara',
    url: '',
    when: 'zima',
    description: 'Goście dzwonią o wolne pokoje.',
    checklist: [0],
    more: ['zal'],
    addOns: ['opieka'],
    shop: false,
    contactPref: 'mail',
  }

  it('accepts answers that fit the rules', () => {
    expect(parseSoftwareAnswers(rules, sent)).toMatchObject({ need: 'firm', options: ['nocleg'] })
  })

  it.each([
    ['an unknown need', { need: 'nie-ma' }],
    ['an option of another need', { options: ['zlec'] }],
    ['two answers to a single question', { options: ['nocleg', 'gastro'] }],
    ['a size (the SW7 shape)', { size: 'std' }],
    ['a chip of another set', { have: 'excel' }],
    ['an unknown term', { when: 'jutro' }],
    ['a checklist position past the list', { checklist: [4] }],
    ['a checklist position twice', { checklist: [0, 0] }],
    ['a checklist text instead of a position', { checklist: ['Logo'] }],
    ['„więcej” of another result', { more: ['fv'] }],
    ['„więcej” twice', { more: ['zal', 'zal'] }],
    ['an add-on the rules do not offer here', { addOns: ['opiekaSys'] }],
    ['the shop switch where the hint does not apply', { shop: true }],
    [
      'an address in „opisz po swojemu”',
      { need: null, own: true, options: [], have: null, url: 'a.pl', more: [] },
    ],
    ['an unknown contact preference', { contactPref: 'fax' }],
    ['no need without „opisz po swojemu”', { need: null }],
    ['an address for a need without the field', { url: 'stara.pl' }],
  ])('rejects %s', (_name, patch) => {
    expect(parseSoftwareAnswers(rules, { ...sent, ...patch })).toBeNull()
  })

  it('accepts the shop switch with the shop’s „więcej”', () => {
    expect(
      parseSoftwareAnswers(rules, {
        ...sent,
        options: ['handel'],
        have: null,
        shop: true,
        more: ['fv'],
        addOns: ['opieka', 'sms'],
      }),
    ).toMatchObject({ shop: true, more: ['fv'] })
  })

  it('accepts „opisz po swojemu” without a need', () => {
    expect(
      parseSoftwareAnswers(rules, {
        ...sent,
        need: null,
        own: true,
        options: [],
        have: null,
        checklist: [],
        more: [],
        addOns: [],
      }),
    ).toMatchObject({ own: true, need: null })
  })

  it('names everything for people and writes the message with „+ do wyceny”', () => {
    const parsed = parseSoftwareAnswers(rules, sent)
    if (!parsed) throw new Error('rejected')
    expect(wizardSummary(rules, parsed)).toEqual({
      Potrzeba: 'Strona dla firmy',
      Szczegóły: ['Pensjonat, hotel, apartamenty'],
      'Co już masz?': 'Starą stronę',
      'Na kiedy?': 'Przed sezonem zimowym',
      'Twoje rozwiązanie': 'Strona dla pensjonatu lub hotelu',
      'Do wyceny': ['Rezerwacja z zaliczką online'],
      Dodatki: ['Opieka nad stroną'],
      'Już mam': ['Logo'],
      'Twoje słowa': 'Goście dzwonią o wolne pokoje.',
      'Jak wolisz rozmawiać?': 'E-mail',
    })
    expect(wizardMessage(rules, parsed)).toBe(
      [
        'Kreator: Strona dla pensjonatu lub hotelu',
        'Strona dla firmy, Pensjonat, hotel, apartamenty, Przed sezonem zimowym',
        '+ do wyceny: Rezerwacja z zaliczką online',
        '+ dodatki: Opieka nad stroną',
        'Goście dzwonią o wolne pokoje.',
      ].join('\n'),
    )
  })

  it('lists the add-on solutions once, for the inquiry items', () => {
    expect(addOnSlugsOf(rules, answers({ addOns: ['opiekaSys', 'appE'] }))).toEqual([
      'opieka-nad-strona-i-systemem',
      'aplikacja-dla-ekip-w-terenie',
    ])
    expect(addOnSlugsOf(rules, answers({ addOns: ['opieka', 'opiekaSys'] }))).toEqual([
      'opieka-nad-strona-i-systemem',
    ])
  })
})

describe('Software wizard quick words and contact field', () => {
  it('uses the need’s own quick words, else the general ones', () => {
    expect(phrasesOf(rules, answers({ need: 'prog' }))[0]).toBe('za dużo przepisywania')
    expect(phrasesOf(rules, answers({ own: true }))).toEqual(rules.phrases)
  })

  it('asks for a phone by default, an e-mail for „E-mail”, either for a meeting', () => {
    expect(contactFieldOf(rules, EMPTY_ANSWERS)).toMatchObject({ field: 'phone', label: 'Telefon' })
    expect(contactFieldOf(rules, answers({ contactPref: 'mail' })).field).toBe('email')
    expect(contactFieldOf(rules, answers({ contactPref: 'salon' })).label).toBe(
      'Telefon albo e-mail',
    )
  })
})

describe('fillWizardTexts', () => {
  it('fills facts in every text and empties a text that cannot be shown', () => {
    const filled = fillWizardTexts(rules, (text) =>
      text.includes('[CZAS ODPOWIEDZI]') ? text.replace('[CZAS ODPOWIEDZI]', '1 dnia') : null,
    )
    expect(filled.free.term).toBe('Odpowiedź w ciągu 1 dnia')
    expect(filled.shopHint.toShop.sub).toBe('')
    // Only texts with a bracket go through `fill`; plain labels stay as they are.
    expect(filled.needs.firm?.n).toBe('Strona dla firmy')
  })
})

describe('order of the needs', () => {
  it('follows needOrder, not the key order the database returns', () => {
    const shuffled = { ...rules, needs: Object.fromEntries(Object.entries(rules.needs).reverse()) }
    expect(orderedNeeds(shuffled).map(([id]) => id)).toEqual(rules.needOrder)
    expect(parseWizardParams(shuffled, { firma: 'bud' }).answers.need).toBe('firm')
    const sys = previewOf(
      { ...shuffled, systemViews: Object.fromEntries(Object.entries(rules.systemViews).reverse()) },
      answers({ need: 'prog' }),
    )
    expect(sys.kind === 'sys' && sys.view.t).toBe('Zlecenia · ten tydzień')
  })
})
