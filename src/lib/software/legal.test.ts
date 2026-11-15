import { describe, expect, it } from 'vitest'

import { legalReadingMinutes, legalTable, type LegalTableFields } from './legal'

const text = (value: string) => ({ type: 'text', text: value })
const paragraph = (value: string) => ({ type: 'paragraph', children: [text(value)] })
const block = (fields: Record<string, unknown>) => ({ type: 'block', fields })

describe('legalTable (table inside the text of a legal page, ZMIANY-v24 §9.6)', () => {
  const fields: LegalTableFields = {
    blockType: 'legalTable',
    head1: 'Dane',
    head2: 'Okres',
    head3: '',
    head4: null,
    rows: [
      { c1: 'Zapytania bez umowy', c2: '12 miesięcy', c3: 'zbędne' },
      { c1: '  ', c2: '', c3: null },
      { c1: 'Logi serwera', c2: 'do 30 dni' },
    ],
  }

  it('takes the filled headers as columns, in order', () => {
    expect(legalTable(fields).heads).toEqual(['Dane', 'Okres'])
  })

  it('cuts every row to the columns and drops empty rows', () => {
    expect(legalTable(fields).rows).toEqual([
      ['Zapytania bez umowy', '12 miesięcy'],
      ['Logi serwera', 'do 30 dni'],
    ])
  })

  it('fills a missing cell with an empty text, so the grid stays even', () => {
    const table = legalTable({ ...fields, rows: [{ c1: 'Faktury' }] })
    expect(table.rows).toEqual([['Faktury', '']])
  })

  it('keeps up to four columns (the cookies table)', () => {
    const table = legalTable({
      blockType: 'legalTable',
      head1: 'Nazwa',
      head2: 'Po co',
      head3: 'Jak długo',
      head4: 'Rodzaj',
      rows: [{ c1: 'pk-theme', c2: 'motyw', c3: 'do usunięcia', c4: 'niezbędne' }],
    })
    expect(table.heads).toHaveLength(4)
    expect(table.rows[0]).toEqual(['pk-theme', 'motyw', 'do usunięcia', 'niezbędne'])
  })

  it('has no columns and no rows without headers', () => {
    expect(legalTable({ blockType: 'legalTable', rows: null })).toEqual({
      heads: [],
      rows: [],
    })
  })
})

describe('legalReadingMinutes', () => {
  it('counts the words of tables and notes, not only the paragraphs', () => {
    const words = (n: number) => Array.from({ length: n }, () => 'słowo').join(' ')
    const content = {
      root: {
        children: [
          paragraph(words(150)),
          block({ blockType: 'legalNote', text: words(30) }),
          block({ blockType: 'legalTable', head1: 'A', head2: 'B', rows: [{ c1: words(25) }] }),
        ],
      },
    }
    // 150 + 30 + 2 headers + 25 = 207 words → 2 minutes at 200 words a minute.
    expect(legalReadingMinutes(content)).toBe(2)
    expect(legalReadingMinutes({ root: { children: [paragraph(words(150))] } })).toBe(1)
  })

  it('adds the texts shown above the article (heading, lead)', () => {
    const content = { root: { children: [paragraph('jedno')] } }
    expect(legalReadingMinutes(content, ['dwa '.repeat(200)])).toBe(2)
  })
})
