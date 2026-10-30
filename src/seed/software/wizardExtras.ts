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
    title: 'Kliknij kilka razy. Zobacz, co dla Ciebie zbudujemy.',
    lead: 'Bez formularzy na start. Telefon albo e-mail podajesz na końcu i tylko wtedy, gdy chcesz wycenę na piśmie.',
    needTitle: 'Czego potrzebujesz?',
    rows: ['Nowa strona internetowa', 'Odświeżenie, program, aplikacja'],
    own: {
      title: 'Wolisz opisać po swojemu?',
      text: 'Napisz, co nie działa i czego oczekujesz. Doradzimy.',
    },
    scopeTitle: 'Jeszcze trzy szczegóły',
    whenQ: 'Na kiedy?',
    describe: {
      title: 'Opisz po swojemu',
      optional: '(możesz pominąć)',
      prompts: ['Co dziś nie działa?', 'Czego oczekujesz?', 'Do kiedy?'],
      placeholder:
        'np. Goście pytają telefonicznie o wolne pokoje, chcę żeby sprawdzali sami. Zależy mi przed feriami.',
      skip: 'Pomiń',
    },
    next: 'Dalej →',
    back: 'Wstecz',
    showResult: 'Pokaż wynik →',
    recommend: 'Polecamy',
    priceLabel: 'Cena',
    termLabel: 'Termin',
    ownChip: 'Opis po swojemu',
    checklist: {
      title: 'Co będzie potrzebne od Ciebie',
      hint: 'Kliknij, co już masz. Czegoś brakuje? Pomożemy: teksty, zdjęcia, domena.',
    },
    yourNeeds: 'Twoje potrzeby',
    yourChoice: 'Twój wybór',
    choiceEmpty: 'jeszcze nic',
    idle: {
      title: 'Tu zobaczysz swój projekt',
      text: 'Składa się sam, gdy klikasz po lewej.',
      steps: ['Wybierz', 'Doprecyzuj', 'Zobacz wynik'],
    },
  },
}

export const SEND_EXTRAS = {
  title: 'Chcesz wycenę na piśmie?',
  prefQ: 'Jak wolisz rozmawiać?',
  button: 'Wyślij mi wycenę na piśmie →',
  note: 'Odpowiadamy w ciągu [CZAS ODPOWIEDZI]. Dane tylko do tej wyceny, bez newslettera.',
  sentLabel: 'Wysłane · {nr}',
  copyNote: 'Kopia zgłoszenia przyjdzie na Twój e-mail, jeśli go podałeś. Pilne?',
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
    send: { ...value.send, ...SEND_EXTRAS },
  }
}

/** Keys a stored wizard must have to be the v22 shape (SW7 and older lack some of them). */
const WIZARD_V22_KEYS = [...Object.keys(WIZARD_EXTRAS), 'scope', 'addOns', 'winterDeadline']

/**
 * A stored wizard of an older shape — before SW7 (without the rules above) or before v22 (sizes,
 * no `scope`): the seed replaces it locally; staging pastes `pnpm software:wizard-json`.
 */
export function isPreV22Wizard(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  return 'sizes' in value || WIZARD_V22_KEYS.some((key) => !(key in value))
}
