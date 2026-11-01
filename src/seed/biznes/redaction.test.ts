import { readFileSync } from 'fs'
import path from 'path'

import { describe, expect, it } from 'vitest'

import catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import salonsFile from '../../../seed/prokombiznes/k4/salony-k4.json'
import pagesFile from '../../../seed/prokombiznes/k4/strony-k4.json'
import bundlesFile from '../../../seed/prokombiznes/k4/zestawy-k4.json'
import { splitCommitment } from '../../sites/biznes/blocks/BzSteps/commitment'
import { CASH_REGISTERS_CONTENT } from './category'
import { biznesHomeLayout } from './home'
import { INDUSTRIES } from './industries'
import {
  aboutK4Layout,
  contactK4Layout,
  goposK4Layout,
  insertK4Layout,
  ksefK4Layout,
  opiekaK4Layout,
  ulgaK4Layout,
  vendingK4Layout,
  type K4FirmaFile,
  type K4PagesFile,
  type K4VendingFile,
} from './k4Pages'

/**
 * Redaction of the Biznes texts (prompt 5 of the audit of 01.11.2026): few dashes, few
 * „Sentence. Punchline.” headings, no heading on two pages, no unconfirmed promises.
 */

const identity = (id: string) => id
const pages = pagesFile as unknown as K4PagesFile & K4FirmaFile & K4VendingFile
const industryRefs = { image: () => undefined, product: () => undefined }

/** Fields that are not prose: links, ids, sources, specifications, legal captions. */
const NOT_PROSE =
  /^(id|slug|href|url|sourceUrl|source|zrodla|etykieta|parametry|anchor|icon|tone|blockType|variant|image|logo|logos|video|wideo|kod|sku|key)$/i

function strings(value: unknown, key = ''): string[] {
  if (NOT_PROSE.test(key)) return []
  // „Nasze zobowiązania”: the dash splits title and note (`splitCommitment`), it is not shown.
  if (key === 'guarantees' && Array.isArray(value)) {
    return strings(value).map((text) => {
      const { title, note } = splitCommitment(text)
      return note ? `${title}. ${note}` : title
    })
  }
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap((item) => strings(item))
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => strings(v, k))
  }
  return []
}

const words = (texts: string[]) =>
  texts
    .join(' ')
    .split(/\s+/)
    .filter((word) => /\p{L}/u.test(word)).length
const dashes = (texts: string[]) => texts.join(' ').match(/—/g)?.length ?? 0
const perThousand = (texts: string[]) => (dashes(texts) * 1000) / Math.max(words(texts), 1)

const k4Layouts = {
  gopos: goposK4Layout(pages, identity).layout,
  insert: insertK4Layout(pages, identity).layout,
  'opieka-it': opiekaK4Layout(pages, identity).layout,
  'o-firmie': aboutK4Layout(pages).layout,
  kontakt: contactK4Layout(pages).layout,
  'automaty-vendingowe': vendingK4Layout(pages, identity).layout,
  ksef: ksefK4Layout(identity).layout,
  'ulga-na-kase-fiskalna': ulgaK4Layout(identity).layout,
}
const industries = Object.fromEntries(
  INDUSTRIES.map((industry) => [`branze/${industry.slug}`, industry.content(industryRefs)]),
)
type Card = { podtytul?: string; korzysc?: string; krotka?: string }
const cards = (catalog as { produkty: Card[] }).produkty.map(({ podtytul, korzysc, krotka }) => ({
  podtytul,
  korzysc,
  krotka,
}))

const SOURCES: Record<string, unknown> = {
  home: biznesHomeLayout(),
  ...k4Layouts,
  ...industries,
  'oferta/kasy-fiskalne': CASH_REGISTERS_CONTENT,
  salony: (salonsFile as { salony: unknown }).salony,
  zestawy: bundlesFile,
  karty: cards,
}

/** H1 and H2 of a seeded page: `heading` (+ accent), `h1a` + `h1b`, the hero `title`. */
function headings(value: unknown, key = ''): string[] {
  if (NOT_PROSE.test(key) || !value || typeof value !== 'object') return []
  if (Array.isArray(value)) return value.flatMap((item) => headings(item))
  const node = value as Record<string, unknown>
  const own: string[] = []
  const join = (a: unknown, b: unknown) =>
    [a, b]
      .filter((part): part is string => typeof part === 'string' && part.trim() !== '')
      .join(' ')
  if (typeof node.heading === 'string') own.push(join(node.heading, node.headingAccent))
  if (typeof node.h1a === 'string') own.push(join(node.h1a, node.h1b))
  if (typeof node.h1 === 'string') own.push(node.h1)
  for (const [k, v] of Object.entries(node)) {
    if (/^\w+Heading$/.test(k) && typeof v === 'string' && v.trim()) own.push(v)
  }
  const nested = Object.entries(node).flatMap(([k, v]) =>
    k === 'items' || k === 'steps' ? [] : headings(v, k),
  )
  return [...own, ...nested]
}

const industryHeadings = (content: Record<string, unknown>) => [
  ...headings(content),
  ...['hero', 'productsSection']
    .map((k) => (content[k] as { title?: string } | undefined)?.title)
    .filter((title): title is string => Boolean(title)),
]

const PAGE_HEADINGS: Record<string, string[]> = {
  home: headings(SOURCES.home),
  ...Object.fromEntries(
    Object.entries(k4Layouts).map(([page, layout]) => [page, headings(layout)]),
  ),
  ...Object.fromEntries(
    Object.entries(industries).map(([page, content]) => [
      page,
      industryHeadings(content as Record<string, unknown>),
    ]),
  ),
  ...Object.fromEntries(
    Object.entries((salonsFile as { salony: Record<string, unknown> }).salony).map(
      ([name, salon]) => [`salon ${name}`, headings({ salon })],
    ),
  ),
}

const normalize = (heading: string) =>
  heading
    .replace(/ /g, ' ')
    .replace(/[.:,]+$/, '')
    .trim()
    .toLowerCase()
/** „Sala, kuchnia i dowozy. Jeden system.” — two sentences in one heading. */
const isPunchline = (heading: string) =>
  heading
    .replace(/ /g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+(?=\S)/).length > 1

const read = (file: string) => readFileSync(path.join(process.cwd(), file), 'utf8')

describe('redaction of the Biznes texts (audit of 01.11.2026, prompt 5)', () => {
  it.each(Object.entries(SOURCES))('%s: at most 5 dashes per 1000 words', (_name, source) => {
    const texts = strings(source)
    expect(perThousand(texts)).toBeLessThanOrEqual(5)
  })

  it('at most one third of the H1/H2 headings is „Sentence. Punchline.”', () => {
    const all = Object.values(PAGE_HEADINGS).flat()
    const punchlines = all.filter(isPunchline)
    expect(punchlines.length, punchlines.join('\n')).toBeLessThanOrEqual(all.length / 3)
  })

  it('never repeats a heading on two pages, nor the H1 as an H2 of the same page', () => {
    const pagesOf = new Map<string, Set<string>>()
    // A page may hold the same heading twice as states of one place (the GoPOS venue switch
    // swaps the hero H1), so only repeats across pages count here.
    for (const [page, list] of Object.entries(PAGE_HEADINGS)) {
      for (const heading of list.map(normalize)) {
        pagesOf.set(heading, (pagesOf.get(heading) ?? new Set()).add(page))
      }
    }
    for (const [slug, content] of Object.entries(industries)) {
      const { hero, ...rest } = content as { hero: { title: string } }
      const h1 = normalize(hero.title)
      expect(industryHeadings(rest).map(normalize), `${slug}: H1 jako H2`).not.toContain(h1)
    }
    // Hard-coded H1 of /marki and /plan-firmy are not seeded: they must not take the home H2.
    for (const home of ['marki, które znamy od środka', 'zobacz, co ustawimy w twoim lokalu']) {
      expect(pagesOf.get(home)).toEqual(new Set(['home']))
    }
    expect(read('src/sites/biznes/components/brand/BrandsDirectory.tsx')).not.toMatch(
      /Marki, które znamy/,
    )
    expect(read('src/app/(sites)/[domain]/(biznes)/plan-firmy/page.tsx')).not.toMatch(
      /Zobacz, co ustawimy/,
    )
    const repeated = [...pagesOf].filter(([, set]) => set.size > 1).map(([h]) => h)
    // Salons share the generic „Dla kogo” kind of labels only below H2; H1/H2 stay unique.
    expect(repeated).toEqual([])
  })

  it('gives the salons brand headings, not the template „Zanim wybierzesz” / „w kilku faktach”', () => {
    const salon = read('src/lib/catalog/salon.ts')
    expect(salon).not.toMatch(/Zanim wybierzesz|w kilku faktach/i)
    expect(JSON.stringify(salonsFile)).not.toMatch(/Zanim wybierzesz|w kilku faktach/i)
  })

  it('makes no unconfirmed promise (K4-FINAL §1)', () => {
    const text = Object.values(SOURCES)
      .flatMap((source) => strings(source))
      .join('\n')
    expect(text).not.toMatch(/od ręki|w 5 minut rozmowy|Odezwiemy się szybko|Nowa strona PRO-KOM/i)
    for (const file of [
      'src/lib/catalog/category.ts',
      'src/sites/biznes/components/bundle/BundleSections.tsx',
    ]) {
      expect(read(file)).not.toMatch(/w 5 minut rozmowy|pod kątem zgodności/)
    }
  })

  it('says „na piśmie” and „bez zobowiązań” at most once per seeded page', () => {
    for (const [page, source] of Object.entries(SOURCES)) {
      if (page === 'salony' || page === 'zestawy' || page === 'karty') continue
      const text = strings(source).join('\n')
      expect(text.match(/na\s+piśmie/giu)?.length ?? 0, `${page}: na piśmie`).toBeLessThanOrEqual(1)
      expect(
        text.match(/bez\s+zobowiązań/giu)?.length ?? 0,
        `${page}: bez zobowiązań`,
      ).toBeLessThanOrEqual(1)
    }
  })
})
