import { describe, expect, it } from 'vitest'

import type { RichTextData } from '../posts/content'
import type { TextContext } from './facts'
import { fillPostContent } from './postText'

const text = (value: string) => ({ type: 'text', text: value })
const paragraph = (...children: object[]) => ({ type: 'paragraph', children })
const link = (value: string) => ({ type: 'link', children: [text(value)] })
const list = (...items: string[]) => ({
  type: 'list',
  children: items.map((item) => ({ type: 'listitem', children: [text(item)] })),
})
const doc = (...children: object[]): RichTextData => ({ root: { type: 'root', children } })

const context = (strict: boolean): TextContext => ({
  tenantId: 1,
  facts: { 'CZAS PIERWSZEGO ETAPU': '3–4 tygodniach' },
  prices: { 'strona-wizytowka': 999, 'pulpit-firmy': null },
  terms: { 'strona-wizytowka': 'od 1 tygodnia' },
  strict,
})

describe('fillPostContent', () => {
  it('fills prices, terms and facts in every text node, links included', () => {
    const content = doc(
      paragraph(text('Wizytówka od {cena:strona-wizytowka} netto, {termin:strona-wizytowka}.')),
      paragraph(link('Pierwszy etap po [CZAS PIERWSZEGO ETAPU]')),
    )
    expect(fillPostContent(content, context(true))).toEqual(
      doc(
        paragraph(text('Wizytówka od 999 zł netto, od 1 tygodnia.')),
        paragraph(link('Pierwszy etap po 3–4 tygodniach')),
      ),
    )
  })

  it('on production drops the block with a missing value, elsewhere keeps the token', () => {
    const content = doc(
      paragraph(text('Zostaje.')),
      paragraph(text('Pulpit od '), link('{cena:pulpit-firmy}')),
      list('Jest', 'Brak {cena:nie-ma}'),
    )
    expect(fillPostContent(content, { ...context(true), tenantId: 2 })).toEqual(
      doc(paragraph(text('Zostaje.')), list('Jest')),
    )
    expect(fillPostContent(content, context(false))).toEqual(content)
  })

  it('drops a list whose every item lost its value on production', () => {
    const content = doc(paragraph(text('Zostaje.')), list('Brak {cena:nie-ma}'))
    expect(fillPostContent(content, context(true))).toEqual(doc(paragraph(text('Zostaje.'))))
  })

  it('never changes the stored content', () => {
    const content = doc(paragraph(text('{cena:strona-wizytowka}')))
    const copy = structuredClone(content)
    fillPostContent(content, context(true))
    expect(content).toEqual(copy)
  })
})
