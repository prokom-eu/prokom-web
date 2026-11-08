import { describe, expect, it } from 'vitest'

import { contactHead } from './contactHead'

// Production fill: a text with a missing fact becomes `null`.
const fill = (text: string | null | undefined) =>
  !text ? null : text.includes('[CZAS ODPOWIEDZI]') ? null : text

describe('contactHead', () => {
  it('keeps the form when the line under the heading misses its fact', () => {
    const head = contactHead(
      {
        eyebrow: 'Kontakt',
        title: 'Napisz po swojemu',
        sideTitle: 'Odpowiadamy w ciągu [CZAS ODPOWIEDZI]. Zawsze człowiek.',
      },
      fill,
    )
    expect(head).toEqual({ eyebrow: 'Kontakt', title: 'Napisz po swojemu', sideTitle: null })
  })

  it('fills all three when the facts are there', () => {
    expect(contactHead({ eyebrow: 'Kontakt', title: 'T', sideTitle: 'S' }, fill)).toEqual({
      eyebrow: 'Kontakt',
      title: 'T',
      sideTitle: 'S',
    })
  })

  it('renders nothing without the eyebrow or the title', () => {
    expect(
      contactHead({ eyebrow: 'Kontakt', title: '[CZAS ODPOWIEDZI]', sideTitle: 'S' }, fill),
    ).toBeNull()
    expect(contactHead({ eyebrow: null, title: 'T', sideTitle: 'S' }, fill)).toBeNull()
  })
})
