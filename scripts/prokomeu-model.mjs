#!/usr/bin/env node
/*
 * Data of the boards Dostawy, Wspolpraca and Main → `seed/prokomeu/model/*.json` (H1-1c, H2, ADR-H002 §2).
 * The seed snapshots (`seed/prokomeu/strony/*.json`) keep only the default state of a board and
 * lose the keys of the request list (`pc`, `tv`…), which „Wczytaj przykład do listy” needs. The
 * board itself defines its data in `renderVals()` — this script runs it and writes the content in
 * the shape of `HubSettings.deliveries` / `.cooperation`: line keys instead of colours, hub paths
 * instead of board files, no SVG paths (icons live in code).
 *
 * The board's code runs in an empty `vm` context (no `process`, no modules, 2 s limit) — not a
 * sandbox, enough for code of this repo. Run it only on boards whose diff you have read.
 *
 * Usage: node scripts/prokomeu-model.mjs  (re-run after a board changes; review the diff).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { runInNewContext } from 'node:vm'

const BOARDS = 'docs/design/prokomeu/plansze'
const OUT = 'seed/prokomeu/model'

/**
 * The constants and the returned object of a board's `renderVals()`. `self` = the board's own
 * methods that `renderVals()` calls (`this.data()`…), taken from its seed snapshot.
 */
function runBoard(file, constants, self = {}) {
  const html = readFileSync(join(BOARDS, file), 'utf8')
  const start = html.indexOf('renderVals() {')
  const end = html.indexOf('\n  }\n}', start)
  if (start < 0 || end < 0) throw new Error(`${file}: renderVals() not found`)
  const body = html.slice(start + 'renderVals() {'.length, end)
  // The top-level `return {` of renderVals (4 spaces in); inner callbacks return objects too.
  const at = body.indexOf('return {', body.lastIndexOf('\n    return {'))
  // The board's own code, with its constants returned next to its result.
  const code = `${body.slice(0, at)}const __result = ${body.slice(at + 'return '.length)}
    return { __result, ${constants.join(', ')} }`
  const board = { state: {}, props: {}, setState() {}, ...self }
  // JSON round trip: plain objects of this realm (the vm context has its own `Object`).
  const result = runInNewContext(
    `(function () {${code}
}).call(board)`,
    { board },
    { timeout: 2000 },
  )
  return JSON.parse(JSON.stringify(result))
}

const LINE_OF_COLOUR = {
  'var(--k-b)': 'biznes',
  'var(--k-i)': 'instalacje',
  'var(--k-s)': 'software',
  'var(--k-t)': 'tech',
  'var(--k-y)': 'gaming',
  'var(--k-g)': 'prokom',
}
const line = (colour) => {
  const key = LINE_OF_COLOUR[Array.isArray(colour) ? colour[0] : colour]
  if (!key) throw new Error(`Unknown colour ${colour}`)
  return key
}
const PATHS = {
  'DlaFirm.dc.html': '/dla-firm',
  'Wspolpraca.dc.html': '/wspolpraca',
  'Wspolpraca.dc.html#etapy': '/wspolpraca#etapy',
  'Linie.dc.html': '/linie',
  'Partnerzy.dc.html': '/partnerzy',
  'Kontakt.dc.html': '/kontakt',
}
const path = (href) => {
  if (href.startsWith('#')) return href
  const hub = PATHS[href]
  if (!hub) throw new Error(`Unknown board address ${href}`)
  return hub
}
const slug = (text) =>
  text
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
const pairs = (rows) => rows.map(([title, text]) => ({ title, text }))
const titled = (rows) => rows.map((row) => ({ title: row.t, text: row.d }))
const faq = (rows) => rows.map(([question, answer]) => ({ question, answer }))
const next = (rows) =>
  rows.map((row) => ({ eyebrow: row.eb, title: row.t, text: row.d, href: path(row.url) }))

function deliveries() {
  const {
    __result: r,
    SEG,
    GR,
    SV,
    TM,
    OB,
    PR,
    FQ,
  } = runBoard('Dostawy.dc.html', ['SEG', 'GR', 'SV', 'TM', 'OB', 'PR', 'FQ'])
  return {
    _zrodlo: `${BOARDS}/Dostawy.dc.html (renderVals) — scripts/prokomeu-model.mjs`,
    segments: SEG.map((s) => ({
      key: slug(s.name),
      name: s.name,
      sub: s.sub,
      line: line(s.L),
      eyebrow: s.eb,
      heading: s.h,
      start: s.start,
      lines: s.lines,
      points: pairs(s.items),
      cta: { label: s.cta, href: path(s.url) },
      form: {
        heading: s.formH,
        orgLabel: s.orgL,
        linkLabel: s.linkL,
        linkPlaceholder: s.linkP,
        descPlaceholder: s.descP,
      },
    })),
    listGroups: GR.map((g) => ({
      key: g.k,
      title: g.t,
      lines: g.line,
      line: line(g.L),
      note: g.note,
      items: g.items.map(([key, title, hint]) => ({ key, title, hint })),
    })),
    services: SV.map(([key, title, hint]) => ({ key, title, hint })),
    terms: [...TM],
    objects: OB.map((o) => ({
      key: slug(o.t),
      title: o.t,
      example: o.ex,
      heading: o.h,
      line: line(o.L),
      preset: Object.entries(o.preset).map(([item, qty]) => ({ item, qty })),
      columns: o.cols.map(([title, lines, colour, items]) => ({
        title,
        lines,
        line: line(colour),
        items: items.map(([name, item]) => ({ title: name, item: item || null })),
      })),
    })),
    levels: r.levels.map((row) => ({ title: row.t, text: row.d })),
    prepTabs: PR.map((p) => ({
      title: p.t,
      lines: p.line,
      line: line(p.L),
      heading: p.h,
      lead: p.lead,
      items: pairs(p.items),
    })),
    brands: r.brands.map((b) => ({
      title: b.t,
      line: line(b.c),
      items: b.items.map((i) => ({ name: i.n, note: i.s })),
    })),
    after: r.after.map((row) => ({ title: row.t, text: row.d, line: line(row.c) })),
    towns: r.towns.map((t) => ({
      name: t.t.replace(' · salon', ''),
      salon: t.t.endsWith(' · salon'),
    })),
    facts: r.facts.map((f) => ({ value: f.v, label: f.l })),
    areas: r.areas.map((a) => ({
      title: a.t,
      lines: a.line,
      line: line(a.c),
      text: a.d,
      tags: a.tags.map((tag) => tag.t),
      how: a.how,
    })),
    steps: titled(r.steps),
    comparison: r.cmp.map((row) => ({
      title: row.t,
      other: row.a,
      ours: row.b,
      line: line(row.c),
    })),
    formalities: titled(r.formal),
    faq: faq(FQ),
    next: next(r.next),
  }
}

function cooperation() {
  const { __result: r, R, SG, SC, FQ } = runBoard('Wspolpraca.dc.html', ['R', 'SG', 'SC', 'FQ'])
  return {
    _zrodlo: `${BOARDS}/Wspolpraca.dc.html (renderVals) — scripts/prokomeu-model.mjs`,
    roles: R.map((role) => ({
      key: slug(role.name),
      name: role.name,
      sub: role.sub,
      line: line(role.L),
      lines: role.lines,
      eyebrow: role.eb,
      heading: role.h,
      start: role.start,
      points: pairs(role.items),
      form: {
        heading: role.formH,
        linkLabel: role.linkL,
        linkPlaceholder: role.linkP,
        descPlaceholder: role.descP,
      },
    })),
    stages: SG.map(([title, when, lead, we, you]) => ({ title, when, lead, we, you })),
    scopes: SC.map((s) => ({
      name: s.name,
      line: line(s.L),
      tag: s.tag,
      items: s.items.map(([title, text, when]) => ({ title, text, when })),
    })),
    facts: r.facts.map((f) => ({ value: f.v, label: f.l })),
    deliveries: titled(r.deliv),
    suppliers: titled(r.supp),
    rules: titled(r.rules),
    faq: faq(FQ),
    next: next(r.next),
  }
}

const LINE_KEYS = ['biznes', 'instalacje', 'software', 'tech', 'gaming']

/**
 * Company facts a text repeats (values of `HubSettings.trust`): it shows only while all of them
 * are visible — on production, approved (spec §3).
 */
const factsOf = (text) =>
  [
    [/Posnet/, 'Posnet'],
    [/Elzab(?! EcoPower)/, 'Elzab'],
    [/GoPOS/, 'GoPOS'],
    [/InsERT/, 'InsERT'],
    [/100/, '100+'],
    [/2004/, 'Od 2004'],
  ].flatMap(([pattern, fact]) => (pattern.test(text) ? [fact] : []))

/**
 * A line's promise (spec §3) lives in its panel (`SiteSettings.shared.responsePromise`,
 * `CompanyData.lines`) — the texts keep `{obietnica}` so the two never drift apart.
 */
const PROMISES = {
  biznes: ['Oddzwaniamy w 60 minut'],
  instalacje: ['Odpowiedź w 24 godziny w dni robocze', 'Odpowiedź w 24 godziny'],
  software: ['Odpowiedź w 1 dzień roboczy'],
  tech: ['Bezpłatna diagnoza i wycena'],
  gaming: [],
}
const promised = (key, text) => (PROMISES[key].includes(text) ? '{obietnica}' : text)
const perLine = (pick) => Object.fromEntries(LINE_KEYS.map((key) => [key, pick(key)]))

/**
 * Contact data never goes into the JSON (spec §3: phones, e-mails, hours, addresses only from
 * `CompanyData`): the FAQ keeps `{telefon}`, `{adres}`, `{godziny}`, filled in on render.
 */
function withTokens(answer) {
  const out = answer
    .replace('883 200 151', '{telefon}')
    .replace('Rabka-Zdrój, ul. Orkana 16B.', '{adres}.')
    .replace('Od poniedziałku do piątku 9:00–17:00.', '{godziny}.')
  if (/\d{3} \d{3} \d{3}|@|Orkana|9:00/.test(out)) throw new Error(`Contact data left in: ${out}`)
  return out
}

/**
 * Home page (board 01, `Main.dc.html`) → `HubSettings.home`. Data of `renderVals()` plus the
 * static texts of the board's HTML (lines given next to each block). Not here: phones, promises,
 * domains (from `CompanyData` / `SiteSettings` of the lines), service and tool records (`HubTools`),
 * personas (`HubPlans`), situations (`HubHelp`, picked by slug — decision 14.11).
 */
function home() {
  const snapshot = JSON.parse(readFileSync('seed/prokomeu/strony/Main.json', 'utf8'))
  const self = {
    data: () => snapshot.data,
    personas: () => snapshot.personas,
    heroSlides: () => snapshot.heroSlides,
    heroVigs: () => snapshot.heroVigs,
    norm: (s) => s,
  }
  const {
    __result: r,
    PH,
    SUB,
    O,
    mq,
    X,
    GX,
    ST,
    TS,
    CM,
    FX,
    TMN,
  } = runBoard(
    'Main.dc.html',
    ['PH', 'SUB', 'O', 'mq', 'X', 'GX', 'ST', 'TS', 'CM', 'FX', 'TMN'],
    self,
  )
  // „Także” lives inline in `L.more` of renderVals; only the default line comes out of it.
  const MORE = {
    biznes: [
      'Comarch ERP',
      'Bezpieczeństwo sieci',
      'Większe dostawy IT',
      'RTV i AGD dla firm',
      'Niszczarki',
      'Podpis kwalifikowany',
    ],
    instalacje: [
      'Kontrola dostępu',
      'Ekrany informacyjne',
      'Anteny i TV hotelowa',
      'Światłowód w budynku',
      'Dla architektów',
    ],
    software: ['Strony dla noclegów', 'Przebudowa strony', 'Opieka nad stroną', 'Panele dla ekip'],
    tech: [
      'Tablety i smartwatche',
      'Komputery stacjonarne',
      'Wysyłka kurierem',
      'Naprawy dla firm',
    ],
    gaming: ['Porównywarka zestawów', 'Dla rodziców', 'Testy przed wysyłką', 'Metryka komputera'],
  }
  if (JSON.stringify(r.L.more.map((m) => m.t)) !== JSON.stringify(MORE.biznes)) {
    throw new Error('Main.dc.html: „Także” changed — update MORE')
  }
  const vignette = (v) => {
    if (v.isRows)
      return { kind: 'rows', rows: v.rows.map((row) => ({ label: row.a, state: row.b })) }
    if (v.isTiles) {
      return {
        kind: 'tiles',
        tiles: v.tiles.map((t) => ({
          label: t.label,
          icon: t.cam ? 'cam' : t.bars ? 'bars' : 'ring',
        })),
      }
    }
    if (v.isSw) return { kind: 'switch' }
    if (v.isWeb) return { kind: 'web' }
    if (v.isKan) return { kind: 'kanban' }
    if (v.isFlow) return { kind: 'flow' }
    throw new Error(`Unknown vignette ${JSON.stringify(v)}`)
  }
  const lineData = Object.fromEntries(snapshot.data.map((l) => [l.key, l]))
  const sceneOf = (key) => (key === 'gaming' ? GX : X[key])
  return {
    _zrodlo: `${BOARDS}/Main.dc.html (renderVals + HTML) — scripts/prokomeu-model.mjs`,
    hero: {
      // :343–350, :367, :375
      eyebrow: 'Rabka-Zdrój · od 2004',
      title: 'Sprzęt, instalacje, oprogramowanie i serwis. W jednej firmie.',
      lead: 'Pięć linii, każda ze swoim zespołem. Wybierz linię obok albo napisz, czego potrzebujesz.',
      unsure: 'Nie mamy pewności, która linia. Zadzwoń — pokierujemy.',
      cta: 'Dobierz w 10 sekund',
      hints: PH.map(([hint, key]) => ({ text: hint.replace('np. ', ''), line: key })),
      chips: r.chips.map((c) => ({ label: c.label, line: line(c.c) })),
      // :481–484 — a counter tied to a fact shows only while the fact is visible (approved).
      counters: [
        { value: '2004', label: 'rok założenia firmy', facts: ['Od 2004'] },
        { value: '5', label: 'linii pod jednym szyldem', facts: [] },
        { value: '100+', label: 'klientów firmowych', facts: ['100+'] },
        {
          value: '4',
          label: 'autoryzacje: Posnet, Elzab, GoPOS, InsERT',
          facts: ['Posnet', 'Elzab', 'GoPOS', 'InsERT'],
        },
      ],
      trustBar: mq.map(([colour, title, _icon, note]) => ({
        line: line(colour),
        title,
        note,
        // The Posnet…InsERT and „Od 2004” items repeat an approved fact; the others are offers.
        facts: factsOf(`${title} ${note}`),
      })),
      lines: perLine((key) => ({
        short: lineData[key].short,
        slides: snapshot.heroSlides[key].map(([title, text]) => ({ title, text: text || null })),
        vignettes: (snapshot.heroVigs[key] ?? []).map(vignette),
      })),
    },
    lines: {
      // :501–505
      eyebrow: 'Linie PRO-KOM',
      title: 'Wszystkie linie **PRO-KOM**',
      lead: 'Pięć linii, każda ze swoim zespołem, numerem i stroną. Kliknij linię albo poczekaj — przewiną się same.',
      allLink: 'Co gdzie załatwisz',
      scene: perLine((key) => ({
        lead: lineData[key].lead,
        heading: sceneOf(key).h2,
        who: sceneOf(key).who,
        cta: sceneOf(key).cta,
        services: sceneOf(key).det.map(([title, text]) => ({ title, text })),
        facts: FX[key].map((text) => ({ text: promised(key, text), facts: factsOf(text) })),
        more: [...MORE[key]],
        steps: ST[key].map(([title, text]) => ({ title: promised(key, title), text })),
        status: X[key].rows.map(([label, state]) => ({ label, state })),
      })),
      techStages: TS.map(([title, text]) => ({ title, text })),
      cameras: CM.map(([label, kind]) => ({ label, kind })),
      // The two captions of the camera preview (inline in renderVals, `camNote`).
      cameraNotes: {
        camera: r.camNote,
        wifi: 'Wi-Fi dla gości jest oddzielone od sieci firmowej.',
      },
    },
    team: {
      // :616–645 — the „Razem” tab
      eyebrow: 'Tak pracują razem',
      title: 'Jeden klient. Kilka linii. Jeden telefon.',
      lead: 'Większość klientów potrzebuje więcej niż jednej rzeczy. Zobacz na przykładzie, jak linie PRO-KOM składają się na jedną obsługę — zespoły ustalają szczegóły między sobą, nie przez Ciebie.',
      cta: 'Dobierz dla swojej branży',
      note: 'Dzwonisz raz — łączymy Cię z właściwymi zespołami.',
      examples: Object.entries(TMN).map(([persona, [tab, node]]) => ({ persona, tab, node })),
      pillars: ['Jedna firma', 'Jeden adres w Rabce-Zdroju', 'Jeden numer na start'],
    },
    choose: {
      // :656–697
      eyebrow: 'Dobierz · 10 sekund',
      title: 'Wybierz, co jest najbliżej Ciebie.',
      lead: 'Dwanaście najczęstszych sytuacji i kafel dla całej reszty — bo obsługujemy każdą firmę i każdy dom. Jedno kliknięcie i widzisz, które linie PRO-KOM się Tobą zajmą i od czego zwykle zaczynamy.',
      other: { title: 'Inna branża? Też.', text: 'Obsługujemy każdą firmę, instytucję i dom.' },
      personas: O.map((persona) => ({ persona, sub: SUB[persona] ?? null })),
      write: 'Napisz, o co chodzi',
      note: 'Połączymy Cię z właściwymi zespołami.',
    },
    tools: {
      // :707–743
      title: 'Załatw to od razu. Bez dzwonienia.',
      lead: 'Każda linia ma swoje narzędzia online. Dwa najczęściej używane z każdej — obok siebie.',
      all: {
        eyebrow: 'Załatw online · pięć linii',
        title: 'spraw załatwisz bez dzwonienia.',
        text: 'Zgłoszenia, statusy, wyceny, plany i konfiguratory ze wszystkich linii w jednym miejscu. Wybierasz sprawę, widzisz, co przygotować i co dostaniesz.',
        cta: 'Zobacz wszystkie narzędzia',
      },
    },
    help: {
      // :752–755; the 6 situations of the board, as records of „Pomoc”
      eyebrow: 'Pomoc',
      title: 'Co zrobić, gdy…',
      allLink: 'Wszystkie sytuacje w Pomocy',
      slugs: [
        'kasa-fiskalna-nie-drukuje',
        'padlo-wi-fi-w-pensjonacie',
        'strona-firmy-nie-dziala-albo-jest-stara',
        'pekniety-ekran-telefonu',
        'buduje-dom-i-planuje-instalacje',
        'jaki-komputer-do-gry-w-ktora-gram',
      ],
    },
    cooperation: {
      // :784–794
      eyebrow: 'Inwestycje i współpraca',
      title: 'Projektujesz, budujesz albo zamawiasz więcej?',
      lead: 'Wchodzimy w projekt wcześnie, bierzemy cały zakres instalacji i dostarczamy sprzęt w większych ilościach — dla pracowni, inwestycji i instytucji.',
      cards: [
        {
          title: 'Architekci i projektanci',
          text: 'Instalacje naniesione na rzuty, zanim wejdą tynki.',
        },
        {
          title: 'Deweloperzy i inwestorzy',
          text: 'Lokale, części wspólne i garaż u jednego wykonawcy.',
        },
        { title: 'Wykonawcy', text: 'Instalacje niskoprądowe jako podwykonawca.' },
        {
          title: 'Firmy i instytucje',
          text: 'Większe dostawy IT oraz RTV i AGD — z listą zapytania.',
        },
        { title: 'Dostawcy', text: 'Masz produkt, który pasuje do naszej oferty?' },
      ],
    },
    coverage: {
      // :830–854
      eyebrow: 'Gdzie działamy',
      title: 'Na miejscu na Podhalu. Zdalnie w całej Polsce.',
      lead: 'Do firm i na montaże dojeżdżamy na Podhalu i w całej Małopolsce. Strony, systemy i komputery do gier robimy dla klientów z całego kraju.',
      towns: [
        'Rabka-Zdrój',
        'Mszana Dolna',
        'Nowy Targ',
        'Zakopane',
        'Limanowa',
        'Nowy Sącz',
        'Myślenice',
        'Kraków',
      ],
      mapNote: 'Schemat kierunków, nie mapa w skali',
      region: 'Podhale · Małopolska',
    },
    news: { eyebrow: 'Aktualności', title: 'Co nowego w liniach' },
    faq: {
      // :880–888
      eyebrow: 'Pytania',
      title: 'Zanim zadzwonisz',
      items: r.faq.map((f) => ({ question: f.q, answer: withTokens(f.a) })),
    },
    contact: {
      // :900–926
      eyebrow: 'Kontakt',
      title: 'Najszybciej — zadzwoń do właściwej linii.',
      write: 'Albo napisz. Wiadomość trafi prosto do zespołu.',
      topicsLabel: 'Czego dotyczy sprawa?',
      general: 'Nie wiem / ogólne',
      directions: 'Kontakt i dojazd',
    },
    final: {
      // :941–946
      title: 'Powiedz, czego potrzebujesz. Resztą zajmie się właściwy zespół.',
      write: 'Napisz do nas',
      choose: 'Dobierz w 10 sekund',
    },
  }
}

/** Brands of the home page (board 01 :804–823) → `HubSettings.brands`; reused by `/partnerzy`. */
function brands() {
  return {
    _zrodlo: `${BOARDS}/Main.dc.html (HTML :804–823) — scripts/prokomeu-model.mjs`,
    eyebrow: 'Marki i autoryzacje',
    title: 'Pracujemy na sprzęcie, za który możemy ręczyć.',
    lead: 'Cztery autoryzacje nadane przez producentów. Do tego marki, które dobieramy, montujemy i serwisujemy na co dzień.',
    authorizations: [
      {
        name: 'Posnet',
        status: 'Autoryzowany serwis',
        line: 'biznes',
        text: 'Kasy i drukarki fiskalne: sprzedaż, fiskalizacja, przeglądy i naprawy.',
      },
      {
        name: 'Elzab',
        status: 'Autoryzowany serwis',
        line: 'biznes',
        text: 'Kasy i drukarki fiskalne: sprzedaż, fiskalizacja, przeglądy i naprawy.',
      },
      {
        name: 'GoPOS',
        status: 'Autoryzowany partner',
        line: 'biznes',
        text: 'System sprzedaży dla gastronomii: wdrożenie na sali i w kuchni, szkolenie.',
      },
      {
        name: 'InsERT',
        status: 'Autoryzowany partner',
        line: 'biznes',
        text: 'Subiekt i e-faktury KSeF: wdrożenie, konfiguracja i szkolenie zespołu.',
      },
    ],
    groups: [
      {
        line: 'biznes',
        title: 'Sprzęt i programy dla firm',
        brands: ['Lenovo', 'Dell', 'Microsoft', 'ESET', 'Synology', 'QNAP', 'Fellowes', 'Kobra'],
        text: 'Komputery, serwery, licencje, ochrona i urządzenia biurowe — dostawa, konfiguracja na życzenie.',
      },
      {
        line: 'instalacje',
        title: 'Bezpieczeństwo, sieci, dźwięk i obraz',
        brands: [
          'Dahua',
          'Hikvision',
          'BCS',
          'Satel',
          'Ubiquiti',
          'MikroTik',
          'Ampio',
          'Elzab EcoPower',
          'Samsung',
          'APART',
          'RCF',
        ],
        text: 'Projekt, montaż i serwis. Gwarancja na montaż 24 miesiące.',
      },
      {
        line: 'tech',
        title: 'Serwis i ochrona ekranów',
        brands: ['Hammer Glass'],
        text: 'Folia cięta ploterem pod Twój model i zakładana od ręki w salonie w Rabce-Zdroju.',
      },
    ],
    note: 'Status autoryzowanego serwisu lub partnera dotyczy tylko czterech marek u góry.',
    allLink: 'Wszystkie marki i autoryzacje',
  }
}

mkdirSync(OUT, { recursive: true })
for (const [name, data] of [
  ['Dostawy', deliveries()],
  ['Wspolpraca', cooperation()],
  ['Main', home()],
  ['Marki', brands()],
]) {
  writeFileSync(join(OUT, `${name}.json`), `${JSON.stringify(data, null, 2)}\n`)
  console.log(`${OUT}/${name}.json`)
}
