#!/usr/bin/env node
/*
 * Data of the boards Dostawy, Wspolpraca, Main and Linie → `seed/prokomeu/model/*.json` (H1-1c, H2, ADR-H002 §2).
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
    // Headings and labels of the page (HTML :242–530); the line's promise comes from its panel.
    page: {
      hero: {
        eyebrow: 'Firmy · instytucje · hotele · inwestorzy · deweloperzy · architekci',
        title: 'Większe zamówienie albo cały obiekt?',
        lead: 'Sprzęt IT w zestawach, RTV i AGD dla firm, instalacje i oprogramowanie — dobrane pod Twój obiekt. Sama dostawa albo dostawa z konfiguracją, montażem i szkoleniem — zakres ustalamy z Tobą. Po dostawie zostajemy jako serwis.',
        cta: 'Złóż listę zapytania',
        ways: [
          { title: 'Mam listę sprzętu', href: '#lista' },
          { title: 'Mam specyfikację albo SWZ', href: '#formularz' },
          { title: 'Wyposażam obiekt', href: '#obiekty' },
        ],
        segmentsLabel: 'Dla kogo zamawiasz?',
        segmentsHint: 'kliknij — dopasujemy stronę i formularz',
        start: 'Zaczynamy od:',
      },
      areas: {
        eyebrow: 'Co dostarczamy',
        title: 'Cztery obszary. Jedna oferta, jedna faktura, jeden kontakt.',
        lead: 'Każdy obszar prowadzi linia PRO-KOM, która robi to na co dzień. Przy większym zamówieniu łączymy je w jedno.',
        how: 'Jak dostarczamy:',
        details: 'Szczegóły na prokombiznes.pl',
      },
      list: {
        eyebrow: 'Lista zapytania',
        title: 'Zaznacz, czego i ile potrzebujesz. Resztę dopytamy.',
        lead: 'Bez cen i bez zobowiązań. Lista trafia do formularza, a my odsyłamy wycenę na piśmie. Parametry ustalimy razem.',
        yours: 'Twoja lista',
        clear: 'Wyczyść',
        pcs: 'szt.',
        empty: 'Lista jest pusta. Dodaj pozycje obok albo wczytaj gotowy przykład obiektu niżej.',
        services: 'Co jeszcze',
        term: 'Kiedy potrzebujesz',
        tvNote:
          'RTV i AGD dostarczamy pod wskazany adres, bez montażu. Konfigurację i montaż sprzętu IT ustalamy przy ofercie.',
        attach: 'Dołącz listę do zapytania',
        copy: 'Kopiuj listę do schowka',
        copied: 'Skopiowano listę',
        copyFailed: 'Nie udało się skopiować — zaznacz listę i skopiuj ręcznie',
        bar: 'Lista:',
        send: 'Wyślij zapytanie',
      },
      objects: {
        eyebrow: 'Wyposażenie obiektu',
        title: 'Wybierz obiekt — zobacz, co zwykle obejmuje taka dostawa.',
        lead: 'Przykłady pokazują typowy zakres. Wczytaj przykład do listy i zmień ilości pod swój obiekt.',
        load: 'Wczytaj przykład do listy',
        note: 'Ilości są przykładowe — zakres i parametry ustalamy przy zapytaniu. Wycenę dostajesz na piśmie.',
      },
      scope: {
        eyebrow: 'Zakres do wyboru',
        title: 'Sama dostawa albo pełne wdrożenie. Ty decydujesz.',
        tabsLabel: 'Co możemy dodać — wybierz rodzaj sprzętu',
        optional:
          'Każda z tych usług jest opcjonalna. Zakres ustalamy przy zapytaniu i zapisujemy w ofercie.',
      },
      steps: {
        eyebrow: 'Jak wygląda realizacja',
        title: 'Sześć kroków. Każdy uzgodniony na piśmie.',
      },
      brands: {
        eyebrow: 'Na czym pracujemy',
        title: 'Marki, które znamy od strony serwisu.',
        all: 'Wszystkie marki i autoryzacje',
        note: 'RTV i AGD dobieramy do zapytania — od sprawdzonych dystrybutorów, z gwarancją producenta.',
      },
      compare: {
        eyebrow: 'Dlaczego jedna firma',
        title: 'Mniej dostawców, mniej koordynacji.',
        area: 'Obszar',
        other: 'Kilku dostawców',
        ours: 'PRO-KOM',
      },
      formal: {
        eyebrow: 'Instytucje i formalności',
        title: 'Zapytania ofertowe i przetargi — też.',
      },
      after: {
        eyebrow: 'Po dostawie',
        title: 'Dostawa to początek. Zostajemy jako serwis.',
        lead: 'Ten sam sprzęt, ta sama firma, jeden numer. Bez szukania, kto co dostarczał.',
        towns: 'Dostawy i dojazdy serwisowe:',
        coverage: 'Cała Małopolska — zobacz zasięg',
      },
      faq: { eyebrow: 'Pytania', title: 'Zanim wyślesz zapytanie.' },
      form: {
        eyebrow: 'Zapytanie ofertowe',
        to: 'Trafia do:',
        cta: 'Wyślij zapytanie',
        note: 'Wycena na piśmie. Bez newslettera.',
      },
      next: { eyebrow: 'Co dalej', title: 'Inne drogi do tej samej firmy.' },
    },
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
    facts: fixTexts(
      r.facts.map((f) => ({ value: f.v, label: f.l })),
      { 'na odpowiedź w dni robocze': 'na odpowiedź linii Instalacje w dni robocze' },
    ),
    deliveries: titled(r.deliv),
    suppliers: titled(r.supp),
    // Spec §3: no promise beyond the agreed ones (24 h is Instalacje only), no street address.
    rules: fixTexts(titled(r.rules), {
      'Odpowiedź w 24 godziny': 'Odpowiadamy w dni robocze',
      'W dni robocze oddzwaniamy albo odpisujemy na każde zgłoszenie.':
        'Oddzwaniamy albo odpisujemy na każde zgłoszenie — czas odpowiedzi linii podajemy przy jej numerze.',
      'Ul. Orkana 16B w Rabce-Zdroju. Przyjdź z rzutami — omówimy projekt na miejscu.':
        'W salonie w Rabce-Zdroju. Przyjdź z rzutami — omówimy projekt na miejscu.',
    }),
    faq: faq(FQ),
    next: next(r.next),
    // Headings and labels of the page (board 16 HTML); phones, e-mail and promises from the panels.
    page: {
      hero: {
        eyebrow: 'Dla architektów · deweloperów · wykonawców · instytucji · dostawców',
        title: 'Projektujesz, budujesz albo zamawiasz? Zróbmy to razem.',
        lead: 'Instalacje, sprzęt i oprogramowanie od jednej firmy z Rabki-Zdroju. Wchodzimy w projekt wcześnie, bierzemy cały zakres i zostajemy po odbiorze. Wybierz, kim jesteś — pokażemy, od czego zaczynamy.',
        cta: 'Wyślij rzuty albo zapytanie',
        rolesLabel: 'Kim jesteś?',
        rolesHint: 'kliknij — plan zmienia się obok',
        start: 'Zaczynamy od:',
      },
      stages: {
        eyebrow: 'Kiedy nas włączyć',
        title: 'Im wcześniej, tym mniej kucia ścian.',
        lead: 'Pięć etapów inwestycji: co robimy my, a czego potrzebujemy od Ciebie.',
        we: 'Co robimy my',
        you: 'Czego potrzebujemy od Ciebie',
      },
      scope: {
        eyebrow: 'Co wnosimy do projektu',
        title: 'Jeden wykonawca na wszystko, co ma kabel, ekran albo program.',
        architectsTitle: 'Pełna strona dla architektów i deweloperów',
        architectsText:
          'Przekrój domu, nowe rozwiązania do projektów, checklista projektanta i przepisy — na stronie linii Instalacje.',
        architectsPath: '/dla-architektow',
      },
      deliveries: {
        eyebrow: 'Instytucje i większe dostawy',
        title: 'Sto komputerów albo wyposażenie całego obiektu? Też.',
        lead: 'Dla szkół, urzędów, gmin, hoteli i firm dostarczamy sprzęt w większych ilościach. Pełny zakres, lista zapytania i przykłady obiektów są na osobnej stronie.',
        cta: 'Inwestycje i dostawy',
      },
      suppliers: {
        eyebrow: 'Dostawcy i producenci',
        title: 'Masz produkt, który pasuje do naszej oferty?',
        lead: 'Sprzedajemy, montujemy i serwisujemy — więc szukamy sprzętu, za który możemy ręczyć. Napisz, co oferujesz. Odpowiadamy na każdą konkretną propozycję.',
      },
      rules: { eyebrow: 'Zasady współpracy', title: 'Krótko i na piśmie.' },
      faq: { eyebrow: 'Pytania', title: 'Zanim napiszesz.' },
      form: {
        eyebrow: 'Napisz do nas',
        note: 'Formularz dopasowuje się do tego, kim jesteś.',
        to: 'Trafia do:',
      },
      next: { eyebrow: 'Co dalej', title: 'Inne drogi do tej samej firmy.' },
    },
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
      // Krystian 15.11: four most used tools of the lines in the PRO-KOM tile (keys of HubTools).
      quick: {
        title: 'Załatw od razu',
        // Krystian 15.11: Biznes, Instalacje, Software and Tech (no Gaming).
        tools: [
          'biznes-konfigurator',
          'instalacje-zaplanuj-instalacje',
          'software-policz-swoj-projekt',
          'tech-zglos-naprawe',
        ],
      },
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
      planFor: 'Plan dla:',
      call: 'Zadzwoń raz:',
      write: 'Napisz, o co chodzi',
      note: 'Połączymy Cię z właściwymi zespołami.',
    },
    tools: {
      // :707–743
      // Krystian 15.11: the short form only.
      title: 'Załatw to od razu.',
      lead: 'Każda linia ma swoje narzędzia online. Dwa najczęściej używane z każdej — obok siebie.',
      all: {
        eyebrow: 'Załatw online · pięć linii',
        title: 'spraw załatwisz bez dzwonienia.',
        text: 'Zgłoszenia, wyceny, plany i konfiguratory ze wszystkich linii w jednym miejscu. Wybierasz sprawę, widzisz, co przygotować i co dostaniesz.',
        cta: 'Zobacz wszystkie narzędzia',
      },
      // H9 (Krystian 15.11): the sixth tile while „Załatw online” is off — not on the board; the
      // hub's own request list (texts after the board Dostawy, spec §6.5).
      own: {
        eyebrow: 'PRO-KOM · Inwestycje i dostawy',
        title: 'Lista zapytania',
        text: 'Większe zamówienie dla firmy albo obiektu? Zaznaczasz sprzęt i liczbę sztuk, wysyłasz jedną listę i dostajesz ofertę na całość.',
        steps: ['Zaznacz sprzęt', 'Podaj liczbę sztuk', 'Wyślij jedną listę'],
        cta: 'Złóż listę zapytania',
        href: '/inwestycje-i-dostawy#lista',
      },
    },
    help: {
      // :752–755; the 6 situations of the board, as records of „Pomoc”
      eyebrow: 'Pomoc',
      title: 'Co zrobić, gdy…',
      allLink: 'Wszystkie sytuacje w Pomocy',
      lineLabel: 'To sprawa dla linii',
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
      links: [
        { label: 'Inwestycje i dostawy', href: '/inwestycje-i-dostawy' },
        { label: 'Współpraca z pracownią', href: '/wspolpraca' },
      ],
      cards: [
        {
          title: 'Architekci i projektanci',
          text: 'Instalacje naniesione na rzuty, zanim wejdą tynki.',
          line: 'instalacje',
          href: '/wspolpraca',
        },
        {
          title: 'Deweloperzy i inwestorzy',
          text: 'Lokale, części wspólne i garaż u jednego wykonawcy.',
          line: 'instalacje',
          href: '/inwestycje-i-dostawy',
        },
        {
          title: 'Wykonawcy',
          text: 'Instalacje niskoprądowe jako podwykonawca.',
          line: 'instalacje',
          href: '/wspolpraca',
        },
        {
          title: 'Firmy i instytucje',
          text: 'Większe dostawy IT oraz RTV i AGD — z listą zapytania.',
          line: 'biznes',
          href: '/inwestycje-i-dostawy',
        },
        {
          title: 'Dostawcy',
          text: 'Masz produkt, który pasuje do naszej oferty?',
          line: 'prokom',
          href: '/wspolpraca#dostawcy',
        },
      ],
    },
    // Runda 1811 D4 (Krystian, 19.11): ALSEN as a premium section above „Współpraca”. Logo, status
    // and the network's site come from `brands.network`; the salon address from the company data.
    // Promises only from the agreed texts: offer without hunting through shops, choice for the
    // job, set-up on request, help by phone after buying. No prices, no stock of ALSEN.
    network: {
      eyebrow: 'Sieć partnerska',
      title: 'Autoryzowany partner ALSEN',
      lead: 'Oferta ogólnopolskiej sieci, opieka na miejscu. Sprzęt i akcesoria z sieci ALSEN zamówisz u nas, bez szukania po wielu sklepach. Dobierzemy je do zadania, na życzenie skonfigurujemy i zostaniemy pod telefonem po zakupie.',
      stat: {
        value: '350+',
        label: 'sklepów ALSEN w całej Polsce',
        note: 'Sieć związana z dystrybutorem AB.',
        facts: ['ALSEN', 'ALSEN 350+'],
      },
      point: { text: 'Nasz salon to punkt partnerski ALSEN', facts: ['ALSEN', 'ALSEN Rabka'] },
      points: [
        {
          icon: 'store',
          title: 'Szeroka oferta w jednym miejscu',
          text: 'Komputery, laptopy, monitory i akcesoria z oferty sieci ALSEN — zamówione u nas.',
        },
        {
          icon: 'target',
          title: 'Dobór do zadania',
          text: 'Doradzimy, który sprzęt pasuje do Twojej pracy, nauki albo firmy.',
        },
        {
          icon: 'wrench',
          title: 'Konfiguracja na życzenie',
          text: 'Przygotujemy sprzęt do pracy: system i programy — jeśli tego potrzebujesz.',
        },
        {
          icon: 'phone',
          title: 'Opieka po zakupie',
          text: 'Zostajemy pod telefonem — tak jak przy wszystkim, co robimy.',
        },
      ],
      cta: { label: 'Zapytaj o sprzęt', href: '/kontakt#formularz' },
      more: { label: 'Więcej o partnerstwie', href: '/o-firmie#alsen' },
    },
    // Runda 1811 D14 (the boss, 18.11): public procurement and larger deliveries — a premium
    // section after „Współpraca”, leading to /inwestycje-i-dostawy. Facts from the hub's data
    // (SWZ, documents for grants, optional set-up); no figures and no names of buyers.
    procurement: {
      eyebrow: 'Zamówienia publiczne i większe dostawy',
      title: 'Szkoły, gminy, szpitale i firmy — jedna oferta na całe zamówienie.',
      lead: 'Odpowiadamy na zapytania ofertowe i przetargi, realizujemy dostawy sprzętu dla szkół, gmin i firm. Sprzęt IT, AV i wyposażenie z linii Biznes, Instalacje i Tech zbieramy w jedną ofertę — z dokumentami do odbioru i rozliczenia.',
      points: [
        {
          icon: 'doc',
          title: 'Przetargi i zapytania ofertowe',
          text: 'Ofertę przygotowujemy według SWZ albo opisu przedmiotu zamówienia.',
        },
        {
          icon: 'box',
          title: 'Większe dostawy sprzętu',
          text: 'Pracownie, stanowiska, sprzęt AV i wyposażenie pod adres. Konfiguracja, montaż i szkolenie — jeśli są w ofercie.',
        },
        {
          icon: 'users',
          title: 'Jedna faktura i jeden opiekun',
          text: 'Całe zamówienie prowadzi jedna osoba — bez szukania kilku dostawców.',
        },
        {
          icon: 'receipt',
          title: 'Dokumenty do dofinansowań',
          text: 'Do zamówień z dofinansowaniem przygotowujemy kosztorys i dokumenty potrzebne do rozliczenia.',
        },
      ],
      stepsLabel: 'Jak to przebiega',
      forLabel: 'Dla kogo',
      audiences: [
        { icon: 'grad', label: 'Szkoły' },
        { icon: 'building', label: 'Gminy i urzędy' },
        { icon: 'heart', label: 'Szpitale i uzdrowiska' },
        { icon: 'bed', label: 'Hotele' },
        { icon: 'brief', label: 'Firmy' },
      ],
      examplesLabel: 'Realizowaliśmy dla',
      // TODO(krystian): 3–4 completed orders for institutions with the boss's consent to show the
      // name — each with its own fact in `HubSettings.trust` (approved in the panel).
      examples: [],
      cta: { label: 'Wyślij zapytanie ofertowe', href: '/inwestycje-i-dostawy#formularz' },
      more: { label: 'Zobacz zamówienia i dostawy', href: '/inwestycje-i-dostawy#przetargi' },
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
      mapLabel: 'Schemat zasięgu: Rabka-Zdrój w środku, wokół Podhale i Małopolska',
      salon: 'Salon',
      route: 'Wyznacz trasę',
      check: 'Sprawdź swoją miejscowość',
    },
    news: {
      eyebrow: 'Aktualności',
      title: 'Co nowego w liniach',
      allLink: 'Wszystkie wpisy',
      read: 'Czytaj',
    },
    faq: {
      // :880–888
      eyebrow: 'Pytania',
      title: 'Zanim zadzwonisz',
      helpLink: 'Centrum pomocy',
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
      salon: 'Salon i biuro',
      cta: 'Napisz wiadomość',
      // Krystian 22.11: both company numbers at Biznes and Instalacje.
      bothPhones: ['biznes', 'instalacje'],
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
        // Krystian 15.11: the brands of Biznes, each with its logo.
        brands: [
          'Lenovo',
          'Dell',
          'Microsoft',
          'ESET',
          'GoPOS',
          'InsERT',
          'Eurocert',
          'Sunmi',
          'Posnet',
          'Elzab',
          'Apple',
          'Ubiquiti',
        ],
        text: 'Komputery, kasy i terminale, programy, licencje i podpis kwalifikowany — dostawa, konfiguracja i szkolenie na życzenie.',
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
        // Krystian 15.11: the phone makers Tech repairs (no status — not an authorization).
        title: 'Naprawy telefonów i tabletów',
        brands: ['Apple', 'Samsung', 'Xiaomi', 'Motorola'],
        text: 'Telefony i tablety tych marek naprawiamy w salonie w Rabce-Zdroju. Bezpłatna diagnoza i wycena, naprawy też kurierem.',
      },
    ],
    // Runda 1811, D4 (decision of Krystian 18.11.2026): PRO-KOM is an authorised partner of the
    // ALSEN network — a network of shops, not a producer, so its own card next to the four.
    // Figures and the Rabka point wait for confirmation behind unapproved facts (`hubTrust()`).
    network: {
      name: 'ALSEN',
      slug: 'alsen',
      status: 'Autoryzowany partner',
      fact: 'ALSEN',
      line: 'biznes',
      label: 'Sieć partnerska',
      text: 'Ogólnopolska sieć sklepów komputerowych. Sprzęt z sieci ALSEN dobierzemy, skonfigurujemy i obsłużymy na miejscu.',
      website: 'https://www.alsen.pl/',
      linkLabel: 'Strona sieci ALSEN',
      aboutTitle: 'Autoryzowany partner ALSEN',
      paragraphs: [
        {
          text: 'PRO-KOM jest autoryzowanym partnerem ALSEN — ogólnopolskiej sieci sklepów komputerowych. Dla klienta to dostęp do szerokiej oferty sprzętu i akcesoriów bez szukania po wielu sklepach.',
          facts: ['ALSEN'],
        },
        {
          // TODO(krystian): confirm the number of shops on alsen.pl on the day of publishing
          // and the link with AB, then approve the fact „ALSEN 350+” in the panel.
          text: 'ALSEN to ponad 350 sklepów w całej Polsce, związanych z dystrybutorem AB.',
          facts: ['ALSEN', 'ALSEN 350+'],
        },
        {
          text: 'Sprzęt dobieramy do zadania, konfigurujemy i zostajemy pod telefonem po zakupie — tak jak przy wszystkim, co robimy.',
          facts: ['ALSEN'],
        },
      ],
      // TODO(krystian): is the salon in Rabka-Zdrój the ALSEN partner point? Then approve the
      // fact „ALSEN Rabka” in the panel and the line shows under the salon card of /kontakt.
      salonNote: { text: 'Punkt partnerski ALSEN', facts: ['ALSEN', 'ALSEN Rabka'] },
    },
    note: 'Status autoryzowanego serwisu lub partnera producenta dotyczy tylko czterech marek u góry.',
    allLink: 'Wszystkie marki i autoryzacje',
  }
}

/** Texts of `/linie` (spec §6.2, board 02 `Linie.dc.html`); services, lines and plans come from data. */
function offer() {
  return {
    _zrodlo: `${BOARDS}/Linie.dc.html (HTML :173–375) — scripts/prokomeu-model.mjs`,
    hero: {
      // :179–187; H1 from spec §4 („Co gdzie załatwisz.”), the board's „Cała oferta PRO-KOM” as eyebrow
      eyebrow: 'Cała oferta · pięć linii, jedna firma',
      title: 'Co gdzie załatwisz.',
      lead: 'Napisz, czego potrzebujesz. Pokażemy usługę, linię, która się nią zajmuje, i jak zacząć.',
      ask: 'Wolisz zapytać?',
      askNote: 'pokierujemy do właściwej linii',
      searchLabel: 'Szukaj w ofercie',
      examplesLabel: 'Na przykład:',
      examples: [
        { label: 'kasa fiskalna', line: 'biznes' },
        { label: 'kamery', line: 'instalacje' },
        { label: 'Wi-Fi dla gości', line: 'instalacje' },
        { label: 'strona dla firmy', line: 'software' },
        { label: 'pęknięty ekran', line: 'tech' },
        { label: 'komputer do gier', line: 'gaming' },
      ],
    },
    filters: {
      audience: 'Dla kogo',
      line: 'Linia',
      allAudiences: 'Wszyscy',
      allLines: 'Wszystkie',
      clear: 'Wyczyść',
      audiences: { firma: 'Firma', dom: 'Dom' },
    },
    empty: {
      // :226–238
      eyebrow: 'Nie ma na liście?',
      title: 'Zadzwoń — pokierujemy.',
      lead: 'Nie każdą sprawę da się nazwać jednym słowem. Powiedz, co się dzieje, a wskażemy właściwą linię.',
      help: 'Co zrobić, gdy…',
      reset: 'Pokaż całą ofertę',
    },
    detail: {
      // :262–298
      label: 'Wybrana usługa',
      audiences: { firma: 'Dla firm', dom: 'Dla domu', oba: 'Dla firm i domu' },
      who: 'Dla kogo:',
      includes: 'Co obejmuje',
      steps: 'Jak zaczynamy',
      online: 'Online:',
      related: 'Często razem z…',
      close: 'Zamknij',
    },
    lines: {
      // :303–322
      eyebrow: 'Pięć linii w skrócie',
      title: 'Kto czym się zajmuje',
      lead: 'Każda linia ma swój zespół, numer i stronę. Kliknij kartę, żeby zobaczyć w katalogu tylko jej usługi.',
      who: 'Dla kogo:',
      inCatalog: 'w katalogu',
    },
    next: {
      // :359–367
      eyebrow: 'Co dalej',
      title: 'Nie wiesz, od czego zacząć?',
      items: [
        {
          eyebrow: 'Dobierz',
          title: 'Dobierz w 10 sekund',
          text: 'Wybierz branżę albo sytuację i zobacz, które linie się Tobą zajmą.',
          href: '/#dobierz',
        },
        {
          eyebrow: 'Pomoc',
          title: 'Co zrobić, gdy…',
          text: 'Coś nie działa? Pierwsze kroki, zanim zadzwonisz.',
          href: '/pomoc',
        },
        {
          eyebrow: 'Załatw online',
          title: 'Załatw online',
          text: 'Zgłoszenia, plan instalacji, kreator projektu i zgłoszenie naprawy — bez dzwonienia.',
          href: '/zalatw-online',
        },
        {
          eyebrow: 'Kontakt',
          title: 'Kontakt',
          text: 'Numery linii, adres salonu w Rabce-Zdroju i formularz.',
          href: '/kontakt',
        },
      ],
    },
  }
}

/**
 * Spec §3 fixes of a board's texts: configuration, fitting and training only as an option, the
 * line's promise from its panel (`{obietnica}`), no contact data. Each fix must still match the
 * board — a changed board fails here instead of slipping an unchecked text through.
 */
function fixTexts(value, fixes) {
  const used = new Set()
  const walk = (node) => {
    if (typeof node === 'string') {
      if (!(node in fixes)) return node
      used.add(node)
      return fixes[node]
    }
    if (Array.isArray(node)) return node.map(walk)
    if (node && typeof node === 'object') {
      return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, walk(v)]))
    }
    return node
  }
  const result = walk(value)
  const unused = Object.keys(fixes).filter((text) => !used.has(text))
  if (unused.length) throw new Error(`Fix without a match on the board: ${unused.join(' | ')}`)
  return result
}

const SHORT_LINE = { b: 'biznes', i: 'instalacje', s: 'software', t: 'tech' }

/** Texts of `/dla-firm` (spec §6.3, board 03 `DlaFirm.dc.html`); industry plans live in `HubPlans`. */
function forBusiness() {
  const snapshot = JSON.parse(readFileSync('seed/prokomeu/strony/DlaFirm.json', 'utf8'))
  const raw = runBoard('DlaFirm.dc.html', ['AR', 'SC', 'WS', 'FAQ', 'BSUB', 'WHEN'], {
    lines: () => snapshot.lines,
    branches: () => snapshot.branches,
  })
  const { AR, SC, WS, FAQ, BSUB, WHEN } = fixTexts(raw, {
    'Fiskalizacja i szkolenie': 'Fiskalizacja u Ciebie',
    'Zgłoszenie, programowanie i szkolenie robimy u Ciebie.':
      'Zgłoszenie, fiskalizacja i programowanie, a szkolenie obsługi na życzenie.',
    'Ze zgłoszeniem, fiskalizacją, programowaniem i szkoleniem.':
      'Ze zgłoszeniem, fiskalizacją i programowaniem; szkolenie na życzenie.',
    'Lenovo i Dell — dostawa, konfiguracja, przeniesienie danych.':
      'Lenovo i Dell — dostawa, a na życzenie konfiguracja i przeniesienie danych.',
    'Serwery Dell, NAS Synology i QNAP, wdrożenie i szkolenie.':
      'Serwery Dell, NAS Synology i QNAP — dostawa, a wdrożenie i szkolenie na życzenie.',
    'Licencje z instalacją i konfiguracją.': 'Licencje, a na życzenie instalacja i konfiguracja.',
    'Wdrożenie programu i e-faktur, szkolenie zespołu.':
      'Wdrożenie programu i e-faktur, szkolenie zespołu na życzenie.',
    'Dostawa, montaż, serwis': 'Dostawa i serwis',
    'Uruchamiamy na miejscu.': 'Montaż i uruchomienie — jeśli tak ustalimy.',
    'Rabka-Zdrój, ul. Orkana 16B.': 'W salonie w Rabce-Zdroju.',
    'Szkolenie zespołu': 'Szkolenie zespołu na życzenie',
    'Potrzebujesz programu, który wystawia i odbiera e-faktury w KSeF, i kogoś, kto go ustawi i przeszkoli zespół.':
      'Potrzebujesz programu, który wystawia i odbiera e-faktury w KSeF, i kogoś, kto go ustawi, a na życzenie przeszkoli zespół.',
    'Monitoring i nagłośnienie z montażem': 'Monitoring i nagłośnienie',
    'Robi to PRO-KOM Instalacje.': 'Montaż przez PRO-KOM Instalacje — jeśli tak ustalimy.',
    // „Bezpłatny” is not among the agreed promises of Biznes (spec §3).
    'Bezpłatny przegląd IT': 'Przegląd IT na start',
    'Oddzwaniamy w 60 minut': '{obietnica}',
    'Odpowiedź w 24 godziny': '{obietnica}',
    'Odpowiedź w 1 dzień roboczy': '{obietnica}',
    'Uruchomienie i szkolenie': 'Uruchomienie',
    'Sprawdzamy, czy wszystko działa razem, i pokazujemy zespołowi, jak z tego korzystać.':
      'Sprawdzamy, czy wszystko działa razem, a jeśli tak ustalimy — pokazujemy zespołowi, jak z tego korzystać.',
    'Konfigurujemy, testujemy i szkolimy.':
      'Testujemy całość; konfigurujemy i szkolimy w ustalonym zakresie.',
    'Zgłaszamy kasę, fiskalizujemy ją, programujemy i szkolimy obsługę. Wniosek o ulgę na kasę składa Twoja księgowa.':
      'Zgłaszamy kasę, fiskalizujemy ją i programujemy, a na życzenie szkolimy obsługę. Wniosek o ulgę na kasę składa Twoja księgowa.',
    'Linia Biznes oddzwania w 60 minut w godzinach pracy. Instalacje odpowiadają w 24 godziny w dni robocze, Software w 1 dzień roboczy.':
      'Każda linia ma swój czas odpowiedzi — podajemy go przy jej numerze w sekcji „Po wdrożeniu” i na stronie linii.',
    'Rabka-Zdrój, ul. Orkana 16B. Od poniedziałku do piątku 9:00–17:00.': '{adres}. {godziny}.',
  })
  return {
    _zrodlo: `${BOARDS}/DlaFirm.dc.html (HTML :208–620, renderVals) — scripts/prokomeu-model.mjs`,
    hero: {
      // :212–238; H1 from spec §4, „opiekun” left out until the boss decides (spec §6.6)
      eyebrow: 'Dla firm · gastronomii · hoteli · handlu · biur · instytucji',
      title: 'Wszystko dla Twojej firmy w jednej firmie.',
      lead: 'Kasa i sprzedaż, komputery i opieka IT, kamery i sieć, strona i system pod Twój proces. Zamiast czterech wykonawców rozmawiasz z jedną firmą z Rabki-Zdroju — a każdą częścią zajmuje się zespół, który robi to na co dzień.',
      choose: 'Dobierz dla swojej branży',
      callNote: 'Dzwonisz raz — łączymy Cię z właściwymi zespołami.',
      stateLabel: 'Twoja firma',
      stateTag: 'Stan',
      stateNote: 'Trzy linie, jedna firma, jeden numer.',
      rows: [
        ['biznes', 'Kasa fiskalna', 'zafiskalizowana'],
        ['biznes', 'E-faktury KSeF', 'skonfigurowane'],
        ['biznes', 'Komputery i kopie', 'pod opieką'],
        ['instalacje', 'Monitoring', 'nagrywa'],
        ['instalacje', 'Wi-Fi gości', 'działa'],
        ['instalacje', 'Alarm', 'uzbrojony'],
        ['software', 'Strona firmowa', 'online'],
      ].map(([key, label, state]) => ({ line: key, label, state })),
      facts: [
        { value: 'Od 2004 roku', label: 'pracujemy dla firm', facts: ['Od 2004'] },
        { value: '100+', label: 'klientów firmowych', facts: ['100+'] },
        {
          value: '4 autoryzacje',
          label: 'Posnet, Elzab, GoPOS, InsERT',
          facts: ['Posnet', 'Elzab', 'GoPOS', 'InsERT'],
        },
        {
          value: 'Podhale · Małopolska',
          label: 'dojazd na miejsce, a zdalnie cała Polska',
          facts: [],
        },
      ],
    },
    industries: {
      // :241–298
      eyebrow: 'Dobierz · 10 sekund',
      title: 'Wybierz branżę. Pokażemy plan.',
      lead: 'Co zwykle robimy w takiej firmie, od czego zaczynamy i o co zapytamy w pierwszej rozmowie.',
      planFor: 'Plan dla:',
      start: 'Od czego zaczynamy',
      ask: 'O co zapytamy w pierwszej rozmowie',
      call: 'Zadzwoń:',
      describe: 'Opisz firmę',
      note: 'Jeden telefon — łączymy Cię z właściwymi zespołami.',
      subs: Object.entries(BSUB).map(([plan, sub]) => ({ plan, sub })),
    },
    areas: {
      // :301–404
      eyebrow: 'Co robimy dla firm',
      title: 'Cztery linie pracują dla Twojej firmy.',
      inLine: 'W tej linii',
      inArea: 'w tym obszarze',
      steps: 'Jak zaczynamy',
      lines: [
        ['biznes', 'Kasy, komputery, programy i dostawy'],
        ['instalacje', 'Monitoring, sieci, obiekt'],
        ['software', 'Strony, systemy, aplikacje'],
        ['tech', 'Serwis sprzętu firmowego'],
      ].map(([key, short]) => ({ line: key, short })),
      items: AR.map((area) => ({
        line: SHORT_LINE[area.k],
        title: area.title,
        lead: area.lead,
        cta: area.n === '05' ? 'Inwestycje i dostawy' : area.cta,
        // „Dostawy i instytucje” leads to the hub's B2B page (spec §6.3).
        href: area.n === '05' ? '/inwestycje-i-dostawy' : null,
        steps: area.steps.map(([title, text]) => ({ title, text })),
        services: area.items.map(({ t, d }) => ({ title: t, text: d })),
      })),
    },
    situations: {
      // :407–444
      eyebrow: 'Tak pracują razem',
      title: 'Jedna sytuacja. Kilka linii. Ustalona kolejność.',
      lead: 'Wybierz sytuację najbliższą Twojej. Zobaczysz, które zespoły wchodzą i w jakiej kolejności — ustalają to między sobą, nie przez Ciebie.',
      label: 'Sytuacja',
      when: WHEN,
      pillars: ['Jeden plan na piśmie', 'Jeden kontakt do całości'],
      start: 'Start:',
      items: SC.map(([title, text, order]) => ({
        title,
        text,
        order: order.map(([k, what]) => ({ line: SHORT_LINE[k], what })),
      })),
    },
    rollout: {
      // :447–468
      eyebrow: 'Wdrożenie krok po kroku',
      title: 'Od pierwszej rozmowy do opieki po uruchomieniu.',
      step: 'Krok',
      we: 'Co robimy my',
      you: 'Co robisz Ty',
      steps: WS.map(([title, text, we, you]) => ({ title, text, we, you })),
    },
    care: {
      // :471–488 (renderVals `care`); the promise of each line from its panel
      eyebrow: 'Po wdrożeniu',
      title: 'Serwis i opieka zostają w tej samej firmie.',
      lead: 'Kasy, komputery, instalacje i strona mają swój zespół i swój czas reakcji. Dzwonisz pod znany numer.',
      items: [
        [
          'biznes',
          'Serwis kas fiskalnych',
          [
            'Autoryzowany serwis Posnet i Elzab',
            'Przeglądy i naprawy',
            'Przejęcie serwisu po innej firmie',
          ],
        ],
        [
          'biznes',
          'Opieka IT',
          ['Pomoc zdalna i na miejscu', 'Monitoring i kopie zapasowe', 'Przegląd IT na start'],
        ],
        [
          'instalacje',
          'Serwis instalacji',
          [
            'Gwarancja na montaż 24 miesiące',
            'Przeglądy i pomoc zdalna',
            'Przejęcie cudzej instalacji',
          ],
        ],
        [
          'software',
          'Opieka nad stroną i systemem',
          [
            'Serwer w Polsce, kopia co noc',
            'Aktualizacje i drobne zmiany',
            'Rozwój systemu razem z firmą',
          ],
        ],
      ].map(([key, title, points]) => ({ line: key, title, points })),
    },
    compare: {
      // :491–503
      eyebrow: 'Dlaczego jedna firma',
      title: 'Kilku wykonawców czy jeden? Różnica w sześciu punktach.',
      topic: 'Temat',
      many: 'Kilku wykonawców',
      one: 'PRO-KOM',
      rows: [
        [
          'Kontakt',
          'Osobny numer i osobne ustalenia z każdym wykonawcą.',
          'Jeden kontakt do całości, a w tle właściwe zespoły.',
        ],
        [
          'Gdy coś nie działa razem',
          'Każdy wykonawca odpowiada za swoją część i trzeba ustalić, czyja to sprawa.',
          'Sieć, kasę i komputer zna jedna firma — sprawdzamy całość.',
        ],
        [
          'Kolejność prac',
          'Terminy wykonawców koordynujesz sam.',
          'Kolejność między liniami układamy po naszej stronie.',
        ],
        [
          'Wiedza o Twojej firmie',
          'Każdemu wykonawcy tłumaczysz wszystko od początku.',
          'Opowiadasz raz — zespoły pracują pod jednym dachem.',
        ],
        [
          'Serwis po wdrożeniu',
          'Kilka umów i kilka miejsc do zgłaszania usterek.',
          'Serwis kas, IT, instalacji i strony w jednej firmie.',
        ],
        [
          'Na miejscu',
          'Zależy od wykonawcy — część działa tylko zdalnie.',
          'Salon i serwis w Rabce-Zdroju, dojazd na Podhalu i w Małopolsce.',
        ],
      ].map(([topic, many, one]) => ({ topic, many, one })),
    },
    grants: {
      // :506–525; no financing — documents only (spec §6.3)
      eyebrow: 'Dofinansowania · szkoły, gminy, instytucje, firmy',
      title: 'Kupujesz sprzęt w projekcie z dofinansowaniem? Przygotujemy papiery.',
      lead: 'Do zamówień realizowanych z dofinansowaniem przygotowujemy kosztorys i dokumenty potrzebne do rozliczenia. Powiedz, w jakim projekcie bierzesz udział — dopasujemy zestawienie do jego wymagań.',
      cta: 'Opisz projekt',
      points: [
        { icon: 'doc', text: 'Kosztorys pod wymagania projektu' },
        { icon: 'receipt', text: 'Dokumenty do rozliczenia' },
        { icon: 'laptop', text: 'Dostawa, a konfiguracja i szkolenie na życzenie' },
      ],
    },
    faq: {
      // :549–566
      eyebrow: 'Pytania firm',
      title: 'Zanim zadzwonisz',
      missing: 'Nie ma tu Twojego pytania? Zadzwoń:',
      helpLink: 'Centrum pomocy',
      items: FAQ.map(([question, answer]) => ({ question, answer })),
    },
    form: {
      // :569–599; the form itself joins in H6-1 (one flow with the contact page, ADR-003)
      eyebrow: 'Opisz firmę',
      title: 'Dwa zdania wystarczą. Resztę ustalimy w rozmowie.',
      afterLabel: 'Co dalej po wysłaniu',
      after: [
        'Wiadomość trafia do linii, której dotyczy Twoja sprawa.',
        'Oddzwaniamy albo odpisujemy i dopytujemy o szczegóły.',
        'Dostajesz plan i wycenę na piśmie, zanim cokolwiek zaczniemy.',
      ],
      cta: 'Opisz swoją firmę',
    },
    next: {
      // :602–611
      eyebrow: 'Co dalej?',
      // No number: v1.1 pages switched off drop out of the list (audit 15.11 — two of four showed).
      title: 'Gdzie jeszcze warto zajrzeć.',
      items: [
        [
          'Inwestycje i dostawy',
          'Większe zamówienie albo cały obiekt',
          'Sprzęt IT, RTV i AGD dla firm i instytucji — złóż listę zapytania, wczytaj przykład obiektu, wyślij SWZ.',
          '/inwestycje-i-dostawy',
        ],
        [
          'Załatw online',
          'Załatw to bez dzwonienia',
          'Zgłoszenie naprawy, wycena strony, plan instalacji — wszystko, co da się zrobić przez internet.',
          '/zalatw-online',
        ],
        [
          'Pomoc',
          'Co zrobić, gdy…',
          'Kasa nie drukuje, padło Wi-Fi, pękł ekran. Krótkie instrukcje i właściwy numer.',
          '/pomoc',
        ],
        [
          'Linie PRO-KOM',
          'Co gdzie załatwisz',
          'Lista spraw z przypisaną linią, numerem i stroną z pełną ofertą.',
          '/linie',
        ],
      ].map(([eyebrow, title, text, href]) => ({ eyebrow, title, text, href })),
    },
    final: {
      // :614–620
      title: 'Jeden telefon. Cała technika w firmie załatwiona.',
      contact: 'Kontakt i dojazd',
      lines: 'Co gdzie załatwisz',
    },
  }
}

/** Texts of `/dla-domu` (spec §6.4, board 04 `DlaDomu.dc.html`); situations live in `HubPlans`. */
function forHome() {
  const snapshot = JSON.parse(readFileSync('seed/prokomeu/strony/DlaDomu.json', 'utf8'))
  const raw = runBoard('DlaDomu.dc.html', ['LD', 'P', 'R', 'EX', 'care', 'TP'], {
    lines: () => snapshot.lines,
    sits: () => snapshot.sits,
  })
  const { LD, P, R, EX, care, TP } = fixTexts(raw, {
    'Składasz komputer po swojemu i od razu widzisz cenę.':
      'Składasz komputer po swojemu, krok po kroku.',
    'Folia cięta ploterem pod Twój model, zakładana od ręki.':
      'Folia cięta ploterem pod Twój model, zakładana w salonie.',
    'Rabka-Zdrój, ul. Orkana 16B, od poniedziałku do piątku 9:00–17:00. Serwis także w sobotę 9:00–14:00.':
      '{adres}. {godziny}.',
  })
  const tiles = (items) => items.map((item) => ({ label: item.k, title: item.t, text: item.d }))
  return {
    _zrodlo: `${BOARDS}/DlaDomu.dc.html (HTML :179–575, renderVals) — scripts/prokomeu-model.mjs`,
    hero: {
      // :184–200; H1 from spec §4; the salon fact without the street (contact data from the panel)
      eyebrow: 'Dla domu · dla rodziny · dla gracza',
      title: 'Wszystko dla domu w jednej firmie.',
      lead: 'Dom, który sam pilnuje i sam się steruje. Telefon i laptop naprawione w salonie w Rabce-Zdroju. Komputer do gier złożony w Rabce-Zdroju. Trzy linie PRO-KOM, jedna firma i jeden salon.',
      choose: 'Wybierz swoją sytuację',
      facts: [
        { value: '2004', label: 'od tego roku działamy w Rabce-Zdroju', facts: ['Od 2004'] },
        { value: '1 salon', label: 'w Rabce-Zdroju — przyjdź, zapytaj, zostaw sprzęt', facts: [] },
        { value: 'Bezpłatnie', label: 'diagnoza i wycena naprawy', facts: [] },
        { value: '24 mies.', label: 'gwarancji PRO-KOM na montaż instalacji', facts: [] },
      ],
      trio: R.trio.map((card) => ({
        line: line(card.cd),
        title: card.title,
        text: card.text,
        anchor: card.anchor === '#przekroj' ? '#przekroj' : null,
      })),
    },
    situations: {
      // :204–249
      eyebrow: 'Twoja sytuacja',
      title: 'Powiedz, co się u Ciebie dzieje.',
      lead: 'Siedem najczęstszych sytuacji. Kliknij swoją — zobaczysz, co robimy, w jakiej kolejności i do kogo zadzwonić.',
      planFor: 'Sytuacja:',
      start: 'Od czego zacząć',
      call: 'Zadzwoń:',
      describe: 'Opisz, czego potrzebujesz',
      note: 'To numer zespołu, który zajmuje się tą sprawą.',
    },
    scene: {
      // :252–336 (renderVals `LD`); promises from the line panels, the chips with hours left out
      eyebrow: 'Trzy linie dla domu',
      title: 'Kto się czym zajmuje.',
      inArea: 'w tej linii',
      steps: 'Jak zaczynamy',
      items: LD.map((entry) => ({
        line: entry.key,
        short: entry.short,
        title: entry.h2,
        lead: entry.lead,
        cta: entry.cta,
        steps: entry.steps,
        services: entry.items.map(([title, text]) => ({ title, text })),
      })),
    },
    section: {
      // :339–394 (renderVals `P`); the drawing is illustration only — the points as a list
      eyebrow: 'PRO-KOM Instalacje · dom w przekroju',
      title: 'Jedenaście miejsc, w których dom robi coś za Ciebie.',
      lead: 'Co to jest, po co i kiedy to zaplanować — punkt po punkcie.',
      why: 'Po co',
      when: 'Kiedy zaplanować',
      note: 'Każdy dom planujemy osobno.',
      cta: 'Zaplanuj instalację',
      points: P.map(([, name, , , where, what, why, when]) => ({ name, where, what, why, when })),
    },
    topics: {
      // :397–433 (renderVals `TP`)
      eyebrow: 'PRO-KOM Instalacje · temat po temacie',
      title: 'Konkretnie: co robimy w domu.',
      items: TP.map((topic) => ({
        name: topic.name,
        short: topic.short,
        eyebrow: topic.eb,
        title: topic.h,
        lead: topic.lead,
        note: topic.note,
        cta: topic.cta,
        tiles: tiles(topic.items),
      })),
    },
    together: {
      // :436–469 (renderVals `EX`)
      eyebrow: 'Jak to wygląda u Ciebie',
      title: 'Jeden dom. Kilka linii. Jeden telefon.',
      lead: 'Wybierz przykład i zobacz, która linia PRO-KOM co u Ciebie robi. Dzwonisz raz — łączymy Cię z właściwym zespołem.',
      cta: 'Opisz swój dom',
      pillars: ['Jedna firma', 'Jeden salon w Rabce-Zdroju', 'Jeden numer na start'],
      examples: EX.map((example) => ({
        key: slug(example.name),
        tab: example.name,
        node: example.node,
        title: example.title,
        groups: Object.entries(example.g).map(([key, points]) => ({ line: key, points })),
      })),
    },
    care: {
      // :472–500; the salon address and hours come from the panel
      eyebrow: 'Gwarancje i opieka',
      title: 'Po montażu i po naprawie zostajemy.',
      items: care.map((item) => ({ line: line(item.cd), value: item.v, text: item.d })),
      salon: 'Salon',
      remote: 'Nie jesteś z okolicy?',
      remoteNote: 'Zgłoś online, wyślij kurierem',
      extras: [
        'Naprawy w salonie',
        'Folia Hammer Glass w salonie',
        'Akcesoria GSM',
        'Odbiór komputera do gier',
      ],
      directions: 'Kontakt i dojazd',
    },
    faq: {
      // :503–517
      eyebrow: 'Pytania',
      title: 'Dziesięć pytań, które słyszymy najczęściej',
      helpLink: 'Co zrobić, gdy…',
      items: R.faq.map((item) => ({ question: item.q, answer: item.a })),
    },
    form: {
      // :520–551; the form itself joins in H6-1 (one flow with the contact page, ADR-003)
      eyebrow: 'Napisz',
      title: 'Opisz, czego potrzebujesz.',
      afterLabel: 'Wybierz temat, a wiadomość trafi prosto do zespołu, który się tym zajmuje.',
      after: [
        'Wysyłasz wiadomość z tematem',
        'Odzywa się właściwy zespół',
        'Dostajesz plan albo wycenę',
      ],
      cta: 'Napisz wiadomość',
    },
    next: {
      // :554–561
      eyebrow: 'Co dalej',
      title: 'Co dalej?',
      items: [
        [
          'Załatw online',
          'Załatw to bez dzwonienia',
          'Zgłoszenie naprawy, wycena strony, plan instalacji — wszystko, co da się zrobić przez internet.',
          '/zalatw-online',
        ],
        [
          'Pomoc',
          'Co zrobić, gdy…',
          'Kasa nie drukuje, padło Wi-Fi, pękł ekran. Krótkie instrukcje i właściwy numer.',
          '/pomoc',
        ],
        [
          'Dla firm',
          'Masz też firmę?',
          'Kasa, komputery, kamery i strona — jeden plan dla Twojej branży.',
          '/dla-firm',
        ],
      ].map(([eyebrow, title, text, href]) => ({ eyebrow, title, text, href })),
    },
    final: {
      // :564–574; numbers and promises of the lines from their panels
      title: 'Wolisz zadzwonić? Każda linia ma swój numer.',
      lines: R.nums.map((entry) => ({ line: line(entry.cd), what: entry.what })),
      directions: 'Kontakt i dojazd',
    },
  }
}

/**
 * RTV i AGD is sold by Biznes (spec §3, Krystian 15.11): the board paints those cards and rows in
 * the hub's green — here they take Biznes blue. Only entries that name RTV i AGD change.
 */
function rtvAgdToBiznes(value) {
  if (Array.isArray(value)) return value.map(rtvAgdToBiznes)
  if (!value || typeof value !== 'object') return value
  const entry = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rtvAgdToBiznes(v)]))
  const named = [entry.title, entry.lines, entry.name].some(
    (text) => typeof text === 'string' && text.includes('RTV i AGD'),
  )
  return named && entry.line === 'prokom' ? { ...entry, line: 'biznes' } : entry
}

/**
 * The client count (boss via Krystian, 23.11.2026): „10 000+ klientów” everywhere — the boards
 * still say „100+ klientów firmowych”. Whole strings only (values, labels, fact keys), the same
 * wording as Biznes (`src/seed/biznes/textFixes.ts`). Frozen copy for production:
 * `src/migrations/data/klienci_10000.ts`.
 */
const CLIENT_COUNT = new Map([
  ['100+', '10 000+'],
  ['klientów firmowych', 'klientów'],
  [
    'Ponad 100 klientów firmowych z Podhala i Małopolski',
    'Ponad 10 000 klientów z Podhala i Małopolski',
  ],
])
const withClientCount = (value) =>
  typeof value === 'string'
    ? (CLIENT_COUNT.get(value) ?? value)
    : Array.isArray(value)
      ? value.map(withClientCount)
      : value && typeof value === 'object'
        ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withClientCount(v)]))
        : value

mkdirSync(OUT, { recursive: true })
for (const [name, data] of [
  ['Dostawy', rtvAgdToBiznes(deliveries())],
  ['Wspolpraca', cooperation()],
  ['Main', home()],
  ['Marki', brands()],
  ['Linie', offer()],
  ['DlaFirm', forBusiness()],
  ['DlaDomu', forHome()],
]) {
  writeFileSync(join(OUT, `${name}.json`), `${JSON.stringify(withClientCount(data), null, 2)}\n`)
  console.log(`${OUT}/${name}.json`)
}
