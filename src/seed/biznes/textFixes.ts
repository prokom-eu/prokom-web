import type { Payload } from 'payload'

import { SEED_CONTEXT } from '../config'
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
  // Redaction of the headings and promises (audit of 01.11.2026, prompt 5). Only phrases that
  // stand for one place; dashes inside longer sentences change with a fresh seed only.
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
  [
    'Zadzwoń albo napisz — odpowiemy od ręki.',
    'Zadzwoń albo napisz. Oddzwonimy w ciągu 60 minut w godzinach pracy.',
  ],
  ['a wycenę dostajesz na piśmie, pod swoją firmę.', 'a wycenę przygotujemy pod Twoją firmę.'],
  [
    'Wycena na piśmie — bez zobowiązań, pod Twoją firmę',
    'Wycena — pod Twoją firmę, w kilku wariantach',
  ],
  ['ofertę na piśmie, bez zobowiązań', 'kilka wariantów z uzasadnieniem'],
  [
    `Jeden numer — ${BIZNES_CONTACT.phone} — oferty i serwis`,
    `Jeden numer — ${BIZNES_CONTACT.phone}, oferty i serwis`,
  ],
  ['Komputery, sieć i kasy pod jedną opieką.', 'Opieka IT dla firm:'],
  ['Jeden numer, gdy coś stanie.', 'komputery, sieć i kasy pod jedną opieką'],
  [
    'Plan naprawy i wycenę opieki dostajesz na piśmie.',
    'Plan naprawy i wycenę opieki dostajesz po przeglądzie.',
  ],
  ['Te same sytuacje. Dwa różne dni w firmie.', 'Te same sytuacje w firmie z opieką i bez niej'],
  ['Lokalna firma IT,', 'PRO-KOM z Rabki-Zdroju:'],
  ['która zostaje z klientem na lata.', 'kasy, komputery i IT dla firm od 2004 roku'],
  ['Nie musisz wierzyć nam na słowo.', 'Sprawdź nas w niezależnych źródłach'],
  ['Osiem zasad, które łatwo sprawdzić.', 'Osiem zasad, które łatwo sprawdzić'],
  ['Jedna firma, cztery linie.', 'Jedna firma, cztery linie'],
  ['Wycenę dostajesz na piśmie, bez zobowiązań.', 'Wycena jest bez zobowiązań.'],
  [' Nowa strona PRO-KOM — wkrótce.', ''],
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
  [
    '; Ministerstwo Finansów zapowiedziało projekt przedłużenia do końca 2027 (stan na 15.10.2026, projekt nieuchwalony). Terminy',
    '. Terminy',
  ],
]

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

/** `value` with every fix applied to each string inside it (objects and arrays copied). */
export function fixTexts<T>(value: T): T {
  if (typeof value === 'string') return fixText(value) as T
  if (Array.isArray(value)) return value.map((item: unknown) => fixTexts(item)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, fixTexts(item)]),
    ) as T
  }
  return value
}

type Report = (name: string, changed: boolean) => void

/**
 * Applies `TEXT_FIXES` to the line's pages (layout), posts (lead, summary, content) and the
 * KSeF panel of the Biznes settings; a record is saved only when it changed.
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
}
