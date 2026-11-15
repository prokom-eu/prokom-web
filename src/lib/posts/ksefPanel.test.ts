import { describe, expect, it } from 'vitest'

import { ksefPanel } from './ksefPanel'

describe('ksefPanel', () => {
  it('needs a date and the caption under the number', () => {
    expect(ksefPanel(null)).toBeNull()
    expect(ksefPanel({ dateLabel: 'dni do 1 stycznia 2027' })).toBeNull()
    expect(ksefPanel({ date: '2027-01-01T00:00:00.000Z', dateLabel: ' ' })).toBeNull()
  })

  it('keeps whole links only and trims the texts', () => {
    expect(
      ksefPanel({
        eyebrow: ' KSeF dla najmniejszych firm ',
        date: '2027-01-01T00:00:00.000Z',
        dateLabel: 'dni do 1 stycznia 2027',
        link: { label: 'Przygotuj firmę do KSeF', href: '/kontakt' },
        secondaryLink: { label: 'Co się zmienia', href: '' },
        steps: [{ title: 'Uwierzytelnienie', text: ' ' }],
        note: 'Stan na 15.10.2026.',
      }),
    ).toEqual({
      eyebrow: 'KSeF dla najmniejszych firm',
      date: '2027-01-01T00:00:00.000Z',
      dateLabel: 'dni do 1 stycznia 2027',
      text: null,
      link: { label: 'Przygotuj firmę do KSeF', href: '/kontakt' },
      secondaryLink: null,
      steps: [{ title: 'Uwierzytelnienie', text: null }],
      note: 'Stan na 15.10.2026.',
    })
  })
})
