import type { Payload } from 'payload'

import { SEED_CONTEXT } from '../config'
import { hardSpaces } from '../../lib/text/hardSpace'
import { BIZNES_CONTACT } from './contact'

/**
 * Wording corrected after a page was seeded. The seed never rewrites the blocks of an existing
 * page (`mergeLayout`), so without this the old contact stayed in local and staging databases.
 * Only these exact phrases change; everything else edited in the panel stays as it is.
 */
export const TEXT_FIXES: readonly (readonly [from: string, to: string])[] = [
  // Contact data of the line — decision of 01.11.2026 (`contact.ts`).
  ['biznes@pro-kom.eu', BIZNES_CONTACT.email],
  ['biuro@pro-kom.eu', BIZNES_CONTACT.email],
  ['18 267 65 11', BIZNES_CONTACT.phone2],
  ['tel:+48182676511', BIZNES_CONTACT.phone2Href],
  // K4-FINAL §1: „ustalamy w umowie”, never „zapisujemy w umowie” (audit of 01.11.2026).
  ['Zapisujemy go w umowie', 'Ustalamy go w umowie'],
  ['zapisujemy w umowie', 'ustalamy w umowie'],
  ['zapisanym w umowie', 'ustalonym w umowie'],
  ['zapisany w umowie', 'ustalony w umowie'],
  ['zapisane w umowie', 'ustalone w umowie'],
  // /aktualnosci: no „EuroCert na miejscu” and no MF draft without a source (audit 01.11.2026).
  [
    ' (MF zapowiedziało projekt przedłużenia do końca 2027 — projekt, nie prawo). Ale terminy',
    '. Ale terminy',
  ],
  [
    'Podpis i pieczęć EuroCert wydajemy w Rabce — jedno spotkanie, bez jazdy do Krakowa.',
    'Pomożemy wyrobić podpis albo pieczęć EuroCert.',
  ],
  ['Wydajemy EuroCert na miejscu.', 'Pomożemy wyrobić podpis EuroCert.'],
  // Redaction (audit of 01.11.2026, prompt 5): parts of longer sentences. Headings and other
  // short texts change only as a whole field (`WHOLE_TEXT_FIXES`), so a phrase reused elsewhere
  // in the panel stays. Dashes inside other sentences change with a fresh seed only.
  [
    'Zadzwoń albo napisz — odpowiemy od ręki.',
    'Zadzwoń albo napisz. Oddzwonimy w ciągu 60 minut w godzinach pracy.',
  ],
  ['a wycenę dostajesz na piśmie, pod swoją firmę.', 'a wycenę przygotujemy pod Twoją firmę.'],
  [
    'Plan naprawy i wycenę opieki dostajesz na piśmie.',
    'Plan naprawy i wycenę opieki dostajesz po przeglądzie.',
  ],
  ['Wycenę dostajesz na piśmie, bez zobowiązań.', 'Wycena jest bez zobowiązań.'],
  [' Nowa strona PRO-KOM — wkrótce.', ''],
  ['Przygotujemy propozycję na piśmie.', 'Przygotujemy propozycję.'],
  [
    'dla gości — wdrożone z Twoim menu, z zespołem przeszkolonym na miejscu i serwisem, który dojeżdża z Rabki, a nie z Warszawy.',
    'dla gości. Wdrażamy je z Twoim menu, szkolimy zespół na miejscu, a serwis dojeżdża z Rabki.',
  ],
  [
    '; Ministerstwo Finansów zapowiedziało projekt przedłużenia do końca 2027 (stan na 15.10.2026, projekt nieuchwalony). Terminy',
    '. Terminy',
  ],
]

type Fix = readonly [from: string, to: string]

/**
 * Redaction of whole fields (audit of 01.11.2026, prompt 5): headings, labels and short leads.
 * A field changes only when it holds exactly the old seed text (spaces or hard spaces), so the
 * same phrase written inside another text in the panel stays.
 */
export const WHOLE_TEXT_FIXES: readonly Fix[] = [
  // Home page.
  ['Wszystko z jednego miejsca — z Rabki.', 'Wszystko z jednego miejsca w Rabce.'],
  [
    'Kasy, komputery, programy, sieć i serwis — wybierz dział.',
    'Kasy, komputery, programy, sieć i serwis',
  ],
  [
    'Firmy każdej wielkości. Od straganu po urząd gminy.',
    'Firmy każdej wielkości, od straganu po urząd gminy',
  ],
  ['Od pierwszej rozmowy do serwisu — bez niespodzianek.', 'Od pierwszej rozmowy do serwisu'],
  ['Tak pracujemy — nie tylko na stronie.', 'Tak pracujemy na co dzień'],
  ['Co mówią klienci.', 'Co mówią klienci'],
  ['O firmie — słowo od właściciela', 'Słowo od właściciela'],
  ['Zanim zadzwonisz.', 'Zanim zadzwonisz'],
  [
    'Napisz, czego potrzebujesz. Odezwiemy się szybko.',
    'Napisz, czego potrzebujesz. Oddzwonimy w ciągu 60 minut w godzinach pracy.',
  ],
  ['Na piśmie', 'Warianty'],
  ['ofertę na piśmie, bez zobowiązań', 'kilka wariantów z uzasadnieniem'],
  [
    'Wycena na piśmie — bez zobowiązań, pod Twoją firmę',
    'Wycena — pod Twoją firmę, w kilku wariantach',
  ],
  [
    `Jeden numer — ${BIZNES_CONTACT.phone} — oferty i serwis`,
    `Jeden numer — ${BIZNES_CONTACT.phone}, oferty i serwis`,
  ],
  // K4 pages.
  ['Komputery, sieć i kasy pod jedną opieką.', 'Opieka IT dla firm:'],
  ['Jeden numer, gdy coś stanie.', 'komputery, sieć i kasy pod jedną opieką'],
  ['Te same sytuacje. Dwa różne dni w firmie.', 'Te same sytuacje w firmie z opieką i bez niej'],
  ['Lokalna firma IT,', 'PRO-KOM z Rabki-Zdroju:'],
  ['która zostaje z klientem na lata.', 'kasy, komputery i IT dla firm od 2004 roku'],
  ['Nie musisz wierzyć nam na słowo.', 'Sprawdź nas w niezależnych źródłach'],
  ['Osiem zasad, które łatwo sprawdzić.', 'Osiem zasad, które łatwo sprawdzić'],
  [
    'Bez obietnic z ulotki — tak pracujemy na co dzień.',
    'Bez obietnic z ulotki, tylko to, jak pracujemy.',
  ],
  ['Jedna firma, cztery linie.', 'Jedna firma, cztery linie'],
  ['Najczęstsze sprawy — od razu wiesz, co dalej', 'Najczęstsze sprawy i co dalej'],
  ['Sprzedaż, która działa całą dobę.', 'Automaty vendingowe dla firm.'],
  ['Bez obsługi.', 'Sprzedaż przez całą dobę.'],
  ['Zacznij od produktu. Automat dobierzemy.', 'Zacznij od produktu, automat dobierzemy'],
  [
    'Pięć aplikacji z zamówieniami. Jedna kolejka.',
    'Pięć aplikacji z zamówieniami w jednej kolejce',
  ],
  ['Trzy pytania — i wiesz, od czego zacząć', 'Trzy pytania, żeby wiedzieć, od czego zacząć'],
  ['Program jest gotowy. Przygotujmy firmę.', 'Program jest gotowy, przygotujmy firmę'],
  [
    'Program to licencja. Spokój to wdrożenie.',
    'Licencja to dopiero początek. Liczy się wdrożenie.',
  ],
  ['Zanim wybierzesz program', 'Pytania o programy InsERT'],
  ['Ulga na kasę fiskalną.', 'Ulga na kasę fiskalną:'],
  ['Do 700 zł zwrotu za każdą kasę.', 'do 700 zł zwrotu za każdą kasę'],
  ['Ulga na kasę — pytania', 'Pytania o ulgę na kasę'],
  // The cash register category (`category.ts`).
  [
    'Kasy fiskalne online. Dobrane, zafiskalizowane, z serwisem w Rabce.',
    'Kasy fiskalne online z fiskalizacją i serwisem w Rabce',
  ],
  ['Kupujesz kasę, dostajesz spokój.', 'Co dostajesz z kasą'],
  [
    'Trzy rzeczy, które warto wiedzieć przed zakupem.',
    'Trzy rzeczy, które warto wiedzieć przed zakupem',
  ],
  [
    'Powiedz, co sprzedajesz — dobierzemy kasę w 5 minut rozmowy.',
    'Powiedz, co sprzedajesz, a dobierzemy kasę',
  ],
  [
    'Nie wiesz, która kasa? Zadzwoń — dobierzemy w 5 minut rozmowy.',
    'Nie wiesz, która kasa? Zadzwoń, pomożemy wybrać.',
  ],
]

/**
 * Whole-field fixes of one industry page, by slug: the same old heading stood on two pages with
 * different new ones (`industries.ts`), and the H1 that the H2 repeated stays as it is.
 */
export const INDUSTRY_FIXES: Readonly<Record<string, readonly Fix[]>> = {
  gastronomia: [
    ['Od lady po kuchnię. Wszystko ze sobą rozmawia.', 'Od sali po kuchnię w jednym systemie'],
    ['Od otwarcia do raportu dobowego.', 'Dzień w restauracji'],
    [
      'Powiedz, jaki masz lokal. Resztę dobierzemy.',
      'Powiedz, jaki masz lokal, a resztę dobierzemy',
    ],
    [
      'Ile miejsc, czy są dowozy, czy jest ogródek — i dostajesz zestaw na piśmie.',
      'Ile masz miejsc, czy są dowozy i ogródek? Na tej podstawie dobierzemy zestaw.',
    ],
  ],
  handel: [
    [
      'Sklep, w którym kolejka idzie sprawnie. Także w sezonie.',
      'Sklep, w którym kolejka idzie sprawnie także w sezonie',
    ],
    ['Od kasy po magazyn. Wszystko ze sobą rozmawia.', 'Kasa, waga i magazyn połączone ze sobą'],
    ['Od otwarcia do raportu dobowego.', 'Dzień w sklepie'],
    [
      'Powiedz, jaki masz sklep. Resztę dobierzemy.',
      'Powiedz, jaki masz sklep, a resztę dobierzemy',
    ],
    [
      'Ile stanowisk, ile towarów, czy jest waga — i dostajesz zestaw na piśmie.',
      'Ile masz stanowisk i towarów, czy jest waga? Na tej podstawie dobierzemy zestaw.',
    ],
  ],
  noclegi: [
    [
      'Od recepcji po restaurację. Wszystko ze sobą rozmawia.',
      'Recepcja i restauracja na jednym rachunku gościa',
    ],
    ['Od śniadania do raportu dobowego.', 'Dzień w pensjonacie'],
    [
      'Powiedz, jaki masz obiekt. Resztę dobierzemy.',
      'Powiedz, jaki masz obiekt, a resztę dobierzemy',
    ],
    [
      'Ile pokoi, czy jest restauracja, skąd przychodzą rezerwacje — i dostajesz zestaw na piśmie.',
      'Ile masz pokoi, czy jest restauracja, skąd przychodzą rezerwacje? Na tej podstawie dobierzemy zestaw.',
    ],
  ],
}

/** The restaurant page repeated its H1 as the H2 of „Jak to działa” (`flow.heading`). */
const RESTAURANT_H1 = 'Restauracja, która nie gubi zamówień. Nawet w sezonie.'
const RESTAURANT_FLOW = 'Jak wygląda zamówienie w restauracji z GoPOS'

const plain = (text: string) => text.replace(/ /g, ' ').trim()
const wholeMap = (fixes: readonly Fix[]) => new Map(fixes.map(([from, to]) => [plain(from), to]))
const WHOLE = wholeMap(WHOLE_TEXT_FIXES)

/** A whole-field fix keeps the seed's hard spaces when the old text had them. */
function fixWhole(text: string, map: ReadonlyMap<string, string>): string {
  const to = map.get(plain(text))
  if (to === undefined) return text
  return text.includes(' ') ? hardSpaces(to) : to
}

/**
 * A fix as a pattern whose spaces also match the hard space of the seed (`hardSpaces`:
 * „w&nbsp;umowie”). The replacement keeps the matched separators in order while their counts
 * agree, so a hard space stays hard; otherwise it uses the plain text of the fix.
 */
const SEPARATOR = '[ \\u00a0]'
const escape = (part: string) => part.replace(/[.*+?^${}()|[\]\\]/g, (char) => `\\${char}`)
const PATTERNS = TEXT_FIXES.map(([from, to]) => ({
  pattern: new RegExp(from.split(' ').map(escape).join(SEPARATOR), 'g'),
  to,
}))

function fixText(text: string): string {
  return PATTERNS.reduce(
    (current, { pattern, to }) =>
      current.replace(pattern, (match) => {
        const separators = match.match(/[ \u00a0]/g) ?? []
        const words = to.split(' ')
        if (separators.length !== words.length - 1) return to
        return words.reduce(
          (out, word, i) => (i === 0 ? word : `${out}${separators[i - 1]}${word}`),
          '',
        )
      }),
    text,
  )
}

/**
 * `value` with every fix applied to each string inside it (objects and arrays copied): first the
 * whole-field fixes (`extra` of one record, then `WHOLE_TEXT_FIXES`), then the phrase fixes.
 */
export function fixTexts<T>(value: T, extra?: ReadonlyMap<string, string>): T {
  if (typeof value === 'string') {
    const whole = fixWhole(extra ? fixWhole(value, extra) : value, WHOLE)
    return fixText(whole) as T
  }
  if (Array.isArray(value)) return value.map((item: unknown) => fixTexts(item, extra)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, fixTexts(item, extra)]),
    ) as T
  }
  return value
}

const INDUSTRY_FIELDS = [
  'hero',
  'productsSection',
  'day',
  'flow',
  'faqIntro',
  'faq',
  'contact',
] as const
const CATEGORY_FIELDS = [
  'hero',
  'includedSection',
  'facts',
  'faqIntro',
  'faq',
  'help',
  'contact',
] as const

/** The fixed text fields of an industry page; the H2 that repeated the H1 gets its own text. */
export function fixIndustryTexts<T extends Record<string, unknown>>(
  slug: string,
  doc: T,
): Partial<T> {
  const extra = wholeMap(INDUSTRY_FIXES[slug] ?? [])
  const fields = Object.fromEntries(
    INDUSTRY_FIELDS.filter((key) => key in doc).map((key) => [key, fixTexts(doc[key], extra)]),
  ) as Partial<T>
  const flow = fields.flow as { heading?: string | null } | undefined
  if (flow?.heading && plain(flow.heading) === RESTAURANT_H1) {
    ;(fields as Record<string, unknown>).flow = { ...flow, heading: RESTAURANT_FLOW }
  }
  return fields
}

type Report = (name: string, changed: boolean) => void

/**
 * Applies the fixes to the line's pages (layout), posts (lead, summary, content), the
 * KSeF panel of the Biznes settings, industries and categories; saved only when it changed.
 */
export async function seedBiznesTextFixes(
  payload: Payload,
  tenantId: number,
  report: Report,
): Promise<void> {
  const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const
  const inTenant = { tenant: { equals: tenantId } }
  const changedOf = (before: unknown, after: unknown) =>
    JSON.stringify(before) !== JSON.stringify(after)

  const pages = await payload.find({
    collection: 'pages',
    where: inTenant,
    limit: 0,
    pagination: false,
    ...local,
  })
  for (const page of pages.docs) {
    const layout = fixTexts(page.layout)
    const changed = changedOf(page.layout, layout)
    report('pages text fixes', changed)
    if (changed) {
      await payload.update({ collection: 'pages', id: page.id, data: { layout }, ...local })
    }
  }

  const posts = await payload.find({
    collection: 'posts',
    where: inTenant,
    limit: 0,
    pagination: false,
    ...local,
  })
  for (const post of posts.docs) {
    const before = { lead: post.lead, summary: post.summary, content: post.content }
    const after = fixTexts(before)
    const changed = changedOf(before, after)
    report('posts text fixes', changed)
    if (changed) {
      await payload.update({ collection: 'posts', id: post.id, data: after, ...local })
    }
  }

  const {
    docs: [settings],
  } = await payload.find({ collection: 'biznes-settings', where: inTenant, limit: 1, ...local })
  if (settings?.news?.ksef) {
    const ksef = fixTexts(settings.news.ksef)
    const changed = changedOf(settings.news.ksef, ksef)
    report('biznes-settings text fixes', changed)
    if (changed) {
      await payload.update({
        collection: 'biznes-settings',
        id: settings.id,
        data: { news: { ...settings.news, ksef } },
        ...local,
      })
    }
  }

  // Industries and categories: the seed fills only empty fields there (`missingFields`).
  const industries = await payload.find({
    collection: 'industries',
    where: inTenant,
    limit: 0,
    pagination: false,
    ...local,
  })
  for (const industry of industries.docs) {
    const before = Object.fromEntries(INDUSTRY_FIELDS.map((key) => [key, industry[key]]))
    const after = fixIndustryTexts(industry.slug, before)
    const changed = changedOf(before, after)
    report('industries text fixes', changed)
    if (changed) {
      await payload.update({ collection: 'industries', id: industry.id, data: after, ...local })
    }
  }

  const categories = await payload.find({
    collection: 'catalog-categories',
    where: inTenant,
    limit: 0,
    pagination: false,
    ...local,
  })
  for (const category of categories.docs) {
    const before = Object.fromEntries(CATEGORY_FIELDS.map((key) => [key, category[key]]))
    const after = fixTexts(before)
    const changed = changedOf(before, after)
    report('catalog-categories text fixes', changed)
    if (changed) {
      await payload.update({
        collection: 'catalog-categories',
        id: category.id,
        data: after,
        ...local,
      })
    }
  }
}
