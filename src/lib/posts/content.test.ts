import { describe, expect, it } from 'vitest'

import { plainText, postOutline, readingMinutes, sectionsByH2, type RichTextData } from './content'

const text = (value: string) => ({ type: 'text', text: value })
const heading = (tag: string, value: string) => ({ type: 'heading', tag, children: [text(value)] })
const paragraph = (...values: string[]) => ({ type: 'paragraph', children: values.map(text) })
const doc = (...children: object[]): RichTextData => ({ root: { type: 'root', children } })

describe('postOutline', () => {
  it('lists the h2 headings with ids built from their text', () => {
    const content = doc(
      heading('h2', '1. Uwierzytelnienie — kto i czym się loguje'),
      paragraph('Tekst'),
      heading('h3', 'Pod-sekcja'),
      heading('h2', 'Ulga 700 zł — przy okazji'),
    )
    expect(postOutline(content).map(({ id, title }) => ({ id, title }))).toEqual([
      {
        id: '1-uwierzytelnienie-kto-i-czym-sie-loguje',
        title: '1. Uwierzytelnienie — kto i czym się loguje',
      },
      { id: 'ulga-700-zl-przy-okazji', title: 'Ulga 700 zł — przy okazji' },
    ])
  })

  it('keeps ids unique and never empty', () => {
    const content = doc(heading('h2', 'KSeF'), heading('h2', 'KSeF'), heading('h2', '—'))
    expect(postOutline(content).map(({ id }) => id)).toEqual(['ksef', 'ksef-2', 'sekcja-3'])
  })

  it('maps every heading node to its id (the renderer adds the anchors)', () => {
    const first = heading('h2', 'Pierwsza')
    const outline = postOutline(doc(first))
    expect(outline[0]?.node).toBe(first)
  })

  it('is empty for missing or malformed content', () => {
    expect(postOutline(null)).toEqual([])
    expect(postOutline({ root: { type: 'root', children: [] } })).toEqual([])
    expect(postOutline({} as RichTextData)).toEqual([])
  })
})

describe('plainText', () => {
  it('joins the text of nested nodes', () => {
    expect(plainText({ children: [text('Ala '), { children: [text('ma kota')] }] })).toBe(
      'Ala ma kota',
    )
  })
})

describe('readingMinutes', () => {
  it('counts about 200 words a minute, rounded up, at least 1', () => {
    const words = (count: number) => Array.from({ length: count }, () => 'słowo').join(' ')
    expect(readingMinutes(doc(paragraph(words(10))))).toBe(1)
    expect(readingMinutes(doc(paragraph(words(1400))))).toBe(7)
    expect(readingMinutes(doc(paragraph(words(1401))))).toBe(8)
  })

  it('adds the lead and summary shown above the content', () => {
    const words = (count: number) => Array.from({ length: count }, () => 'x').join(' ')
    expect(readingMinutes(doc(paragraph(words(200))), [words(1)])).toBe(2)
  })

  it('is 1 for empty content', () => {
    expect(readingMinutes(null)).toBe(1)
  })
})

describe('sectionsByH2', () => {
  it('cuts the text at h2 headings and keeps what comes before as the intro', () => {
    const intro = paragraph('Wstęp')
    const body = paragraph('Treść')
    const sub = heading('h3', 'Podtytuł')
    const result = sectionsByH2(
      doc(intro, heading('h2', 'Kto jest administratorem'), body, sub, heading('h2', 'Prawa')),
    )
    expect(result.intro).toEqual([intro])
    expect(result.sections).toEqual([
      { id: 'kto-jest-administratorem', title: 'Kto jest administratorem', nodes: [body, sub] },
      { id: 'prawa', title: 'Prawa', nodes: [] },
    ])
  })

  it('returns nothing for an empty text', () => {
    expect(sectionsByH2(null)).toEqual({ intro: [], sections: [] })
  })
})
