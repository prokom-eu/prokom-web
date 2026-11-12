import { describe, expect, it } from 'vitest'

import { THEME_STORAGE_KEY } from '../../lib/brand/theme'
import { postOutline, type RichTextData } from '../../lib/posts/content'
import { PROMO_CLOSED_KEY } from '../../lib/site/promo'
import { legalTable, type LegalTableFields } from '../../lib/software/legal'
import { PROJECT_KEY } from '../../lib/software/project'

import { SOFTWARE_LEGAL_PAGES } from './legal'

function page(slug: string) {
  const found = SOFTWARE_LEGAL_PAGES.find((item) => item.slug === slug)
  if (!found) throw new Error(`no ${slug}`)
  const [block] = found.layout()
  if (block?.blockType !== 'swLegal') throw new Error(`${slug}: not swLegal`)
  const body = block.body as unknown as RichTextData
  const tables = (
    body.root as unknown as { children: { type: string; fields?: LegalTableFields }[] }
  ).children
    .filter((node) => node.type === 'block' && node.fields?.blockType === 'legalTable')
    .map((node) => legalTable(node.fields as LegalTableFields))
  return { block, body, tables, json: JSON.stringify(block) }
}

const titles = (slug: string) => postOutline(page(slug).body).map((item) => item.title)

describe('Software legal pages v24 (ZMIANY-v24 §9.6, TRESCI-v24)', () => {
  it('seeds the four pages, every one as a single swLegal draft', () => {
    expect(SOFTWARE_LEGAL_PAGES.map((item) => item.slug)).toEqual([
      'polityka-prywatnosci',
      'regulamin',
      'cookies',
      'dostepnosc',
    ])
    for (const { slug, layout } of SOFTWARE_LEGAL_PAGES) {
      expect(layout(), slug).toHaveLength(1)
      expect(page(slug).block.draft, slug).toBe(true)
      expect(page(slug).block.heading, slug).toMatch(/\*\*.+\*\*/)
    }
  })

  it('the policy has the 11 sections of the board and two tables', () => {
    expect(titles('polityka-prywatnosci')).toEqual([
      'Administrator danych',
      'Jakie dane zbieramy',
      'Po co i na jakiej podstawie',
      'Komu przekazujemy dane',
      'Jak długo przechowujemy dane',
      'Twoje prawa',
      'Czy musisz podać dane',
      'Decyzje automatyczne',
      'Statystyki i pliki cookies',
      'Bezpieczeństwo',
      'Zmiany polityki',
    ])
    const { tables } = page('polityka-prywatnosci')
    expect(tables.map((table) => table.heads)).toEqual([
      ['Cel', 'Podstawa prawna (RODO)'],
      ['Dane', 'Okres'],
    ])
    expect(tables.every((table) => table.rows.length >= 4)).toBe(true)
  })

  it('the policy promises nothing the panel does not do (no second login factor)', () => {
    const { json } = page('polityka-prywatnosci')
    expect(json).not.toMatch(/składnik/i)
    expect(json.toLowerCase()).not.toContain('newsletter')
  })

  it('the terms have 9 paragraphs', () => {
    expect(titles('regulamin')).toHaveLength(9)
  })

  it('the cookies table names every key the line keeps in the browser', () => {
    const { tables } = page('cookies')
    expect(tables).toHaveLength(1)
    const names = tables[0]?.rows.map((row) => row[0]).join(' ')
    for (const key of [THEME_STORAGE_KEY, PROJECT_KEY, PROMO_CLOSED_KEY, 'pk-rail-home']) {
      expect(names, key).toContain(key)
    }
    expect(tables[0]?.heads).toHaveLength(4)
  })

  it('accessibility has the 5 sections of the board', () => {
    expect(titles('dostepnosc')).toEqual([
      'Standard',
      'Co zrobiliśmy',
      'Znane ograniczenia',
      'Zgłoś barierę',
      'Dostępność salonu',
    ])
  })

  it('leaves no placeholder in brackets (content-scan on production)', () => {
    for (const { slug } of SOFTWARE_LEGAL_PAGES) {
      expect(page(slug).json, slug).not.toMatch(/\[[A-ZĄĆĘŁŃÓŚŹŻ ]{3,}\]/)
    }
  })
})
