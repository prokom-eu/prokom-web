import type kreator from '../../../seed/prokomsoftware/kreator.json'

/**
 * Wizard rules and texts the board `Kreator` keeps in its script, not in `kreator.json` (SW7,
 * decision 27.10: data in `SoftwareSettings.wizard`, no `if` on need ids in components). The
 * package file stays 1:1; `softwareSettingsData()` merges these into its copy.
 */

type Kreator = typeof kreator
type NeedId = keyof Kreator['needs']

/** Added to the needs of the package (step 3 „Zakres”). */
export const NEED_EXTRAS: Partial<Record<NeedId, Record<string, unknown>>> = {
  firm: { have: 'site' },
  rozb: { have: 'site' },
  wiz: { have: 'site' },
  land: { have: 'site' },
  odsw: { url: { q: 'Adres obecnej strony', placeholder: 'np. twojafirma.pl' } },
  prog: { have: 'system', fileNote: 'Plik możesz dosłać mailem po kontakcie.' },
  app: { have: 'system' },
  auto: { have: 'system' },
}

/** `{kontakt}` of the success steps, by `contactPrefs[].id`. */
export const CONTACT_VERBS: Record<string, string> = {
  tel: 'zadzwonimy',
  mail: 'napiszemy',
  salon: 'umówimy spotkanie w salonie',
  online: 'umówimy rozmowę online',
}

export const WIZARD_EXTRAS = {
  needOrder: ['firm', 'rozb', 'wiz', 'land', 'odsw', 'prog', 'app', 'auto'],
  haves: {
    site: {
      q: 'Co już masz?',
      o: [
        { id: 'nic', n: 'Nic, zaczynam od zera' },
        {
          id: 'stara',
          n: 'Starą stronę',
          resultNote: '+ przebudowa starej strony, bez utraty pozycji w Google',
        },
        { id: 'logo', n: 'Domenę i logo' },
      ],
    },
    system: {
      q: 'Na czym dziś pracujecie?',
      o: [
        { id: 'kartki', n: 'Kartki i zeszyty' },
        { id: 'excel', n: 'Excel' },
        { id: 'program', n: 'Inny program' },
      ],
    },
  },
  scopeRules: [{ when: [{ results: ['pensjonat'] }], note: 'pensjonat' }],
  bigWhen: [{ needs: ['prog', 'app', 'rozb'] }],
  free: { price: 'Bezpłatnie', term: 'Odpowiedź w ciągu [CZAS ODPOWIEDZI]' },
  preview: {
    defaultBrand: 'inna',
    systemDefault: 'zlec',
    appDefault: 'ekipa',
    features: [
      {
        id: 'lang',
        when: [
          { needs: ['rozb'], options: ['jez'] },
          { needs: ['firm'], options: ['nocleg'] },
        ],
      },
      { id: 'login', when: [{ needs: ['rozb'], options: ['strefa'] }] },
      {
        id: 'booking',
        when: [
          { needs: ['rozb'], options: ['rez'] },
          { needs: ['firm'], options: ['nocleg', 'turyst'] },
        ],
      },
      { id: 'form', when: [{ needs: ['land'] }] },
      { id: 'map', when: [{ needs: ['wiz'] }] },
      { id: 'cards', when: [{ needs: ['firm', 'rozb'] }] },
      { id: 'catalog', when: [{ needs: ['rozb'], options: ['kat'] }] },
      { id: 'blog', when: [{ needs: ['rozb'], options: ['blog'] }] },
    ],
    navs: [
      { when: [{ needs: ['wiz', 'land'] }], items: [] },
      { when: [{ needs: ['rozb'] }], items: ['Oferta', 'Realizacje', 'Blog', 'Kontakt'] },
      { items: ['Oferta', 'O nas', 'Kontakt'] },
    ],
    appViews: {
      ekipa: {
        t: 'Dziś · Ekipa Marka',
        l: [
          ['8:00 · Łazienka', 'Kowalscy · Rabka'],
          ['13:00 · Taras', 'Lis · Mszana Dolna'],
        ],
        b: 'Zakończ zlecenie',
      },
      klienci: {
        t: 'Twój Pensjonat',
        l: [
          ['Rezerwacja potwierdzona', '12–15 sty · 2 osoby'],
          ['Zamówienie gotowe', 'odbiór o 18:00'],
        ],
        b: 'Zarezerwuj',
      },
    },
    rebuildDefault: ['wolna', 'tel', 'zmiany'],
    automationDefault: ['sms', 'fv', 'rap'],
  },
  ui: {
    eyebrow: 'Dobierz rozwiązanie · 60 sekund',
    title: 'Kilka kliknięć. Cena, termin i podgląd od razu.',
    lead: 'Bez formularzy na start. Kontakt podajesz na końcu i tylko wtedy, gdy chcesz wycenę.',
    needTitle: 'Czego potrzebujesz?',
    needLead: 'Wybierz jedno. Cenę i termin zobaczysz od razu.',
    rows: ['Nowa strona internetowa', 'Odświeżenie, program, aplikacja'],
    own: {
      title: 'Nie wiesz, co wybrać? Opisz po swojemu',
      text: 'Napisz, co nie działa i czego oczekujesz. Doradzimy uczciwie, za darmo.',
    },
    scopeTitle: 'Zakres i termin',
    whenQ: 'Na kiedy?',
    describe: {
      title: 'Opisz po swojemu',
      optional: '(możesz pominąć)',
      prompts: ['Co dziś nie działa?', 'Czego oczekujesz?', 'Do kiedy?'],
      placeholder:
        'np. Goście pytają telefonicznie o wolne pokoje, chcę żeby sprawdzali sami. Zależy mi przed feriami.',
    },
    words: {
      open: '+ Dodaj kilka słów od siebie',
      optional: '(opcjonalnie)',
      title: 'Kilka słów od siebie',
      placeholder: 'np. Goście pytają telefonicznie o wolne pokoje. Zależy mi przed feriami.',
    },
    stepOf: 'Krok {n} z {z}',
    next: 'Dalej →',
    back: 'Wstecz',
    showResult: 'Pokaż wynik →',
    sendJump: 'Poproś o wycenę ↓',
    restart: 'Zacznij od nowa',
    recommend: 'Twoje rozwiązanie',
    included: 'W cenie',
    priceLabel: 'Cena',
    termLabel: 'Termin',
    termSub: { priced: 'od podpisania umowy', free: 'od wysłania opisu' },
    moreTitle: 'Potrzebujesz czegoś więcej?',
    moreTag: 'do wyceny',
    toQuoteTitle: 'Do wyceny',
    ownChip: 'Opis po swojemu',
    checklist: {
      title: 'Co będzie potrzebne od Ciebie',
      hint: 'Kliknij, co już masz. Czegoś brakuje? Pomożemy: teksty, zdjęcia, domena.',
      count: 'Masz {n} z {z}',
    },
    addOns: { title: 'Często dobierane razem', add: '+ Dodaj', added: '✓ Dodane' },
    yourNeeds: 'Twoje słowa',
    yourChoice: 'Twój wybór',
    choiceEmpty: 'jeszcze nic',
    live: {
      title: 'Twoja wycena na żywo',
      previewTitle: 'Podgląd Twojego projektu',
      label: 'Twoja wycena',
      empty: '— zł',
      emptyText: 'Wybierz, czego potrzebujesz. Cena i termin pojawią się tutaj.',
    },
    idle: {
      title: 'Tu zobaczysz swój projekt',
      text: 'Składa się sam, gdy klikasz po lewej.',
      steps: ['Wybierz', 'Doprecyzuj', 'Zobacz wynik'],
    },
  },
}

/** The package's `kreator.json` with the rules above — the value of `SoftwareSettings.wizard`. */
export function wizardSeed(source: Kreator) {
  const value = structuredClone(source)
  const needs = Object.fromEntries(
    Object.entries(value.needs).map(([id, need]) => [
      id,
      { ...need, ...NEED_EXTRAS[id as NeedId] },
    ]),
  )
  const contactPrefs = value.contactPrefs.map((pref) => ({
    ...pref,
    // A missing verb fails the schema (the panel shows which preference).
    verb: CONTACT_VERBS[pref.id],
  }))
  return {
    ...value,
    needs,
    contactPrefs,
    ...structuredClone(WIZARD_EXTRAS),
  }
}
