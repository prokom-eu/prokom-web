import { describe, expect, it } from 'vitest'

import type { RichTextData } from './content'
import { postFaq } from './faq'

const text = (value: string) => ({ type: 'text', text: value })
const heading = (tag: string, value: string) => ({ type: 'heading', tag, children: [text(value)] })
const paragraph = (...values: string[]) => ({ type: 'paragraph', children: values.map(text) })
const list = (...items: string[]) => ({
  type: 'list',
  children: items.map((item) => ({ type: 'listitem', children: [text(item)] })),
})
const doc = (...children: object[]): RichTextData => ({ root: { type: 'root', children } })

describe('postFaq', () => {
  it('reads the h3 questions under the „Najczęstsze pytania” h2 with their answers', () => {
    const content = doc(
      heading('h2', 'Wstęp'),
      heading('h3', 'To nie jest pytanie FAQ?'),
      paragraph('Akapit.'),
      heading('h2', 'Najczęstsze pytania'),
      heading('h3', 'Ile to trwa?'),
      paragraph('Zwykle ', 'dwa tygodnie.'),
      paragraph('Czasem dłużej.'),
      heading('h3', 'Co jest w cenie?'),
      list('Projekt', 'Panel'),
      heading('h2', 'Podsumowanie'),
      paragraph('Koniec.'),
    )
    expect(postFaq(content)).toEqual([
      { question: 'Ile to trwa?', answer: 'Zwykle dwa tygodnie. Czasem dłużej.' },
      { question: 'Co jest w cenie?', answer: 'Projekt Panel' },
    ])
  })

  it('accepts other names of the section, case and spacing aside', () => {
    for (const name of ['Pytania i odpowiedzi', ' najczęstsze pytania ', 'FAQ']) {
      const content = doc(heading('h2', name), heading('h3', 'Pytanie?'), paragraph('Tak.'))
      expect(postFaq(content)).toEqual([{ question: 'Pytanie?', answer: 'Tak.' }])
    }
  })

  it('skips a question without an answer and is empty without the section', () => {
    expect(
      postFaq(doc(heading('h2', 'FAQ'), heading('h3', 'Puste?'), heading('h3', 'Jest?'))),
    ).toEqual([])
    expect(
      postFaq(doc(heading('h2', 'Inne'), heading('h3', 'Pytanie?'), paragraph('Tak.'))),
    ).toEqual([])
    expect(postFaq(null)).toEqual([])
  })
})
