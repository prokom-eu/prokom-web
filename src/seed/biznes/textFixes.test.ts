import { describe, expect, it } from 'vitest'

import { fixTexts } from './textFixes'

describe('fixTexts', () => {
  it('replaces the old contact inside nested blocks and rich text', () => {
    const layout = [
      {
        blockType: 'bzSection',
        lead: 'Telefon 889 003 889 albo e-mail biznes@pro-kom.eu.',
        items: [{ text: 'Drugi telefon 18 267 65 11', href: 'tel:+48182676511' }],
        content: {
          root: { children: [{ text: 'biuro@pro-kom.eu', url: 'mailto:biuro@pro-kom.eu' }] },
        },
        count: 3,
        hidden: null,
      },
    ]
    expect(fixTexts(layout)).toEqual([
      {
        blockType: 'bzSection',
        lead: 'Telefon 889 003 889 albo e-mail kontakt@prokombiznes.pl.',
        items: [{ text: 'Drugi telefon 883 200 151', href: 'tel:+48883200151' }],
        content: {
          root: {
            children: [{ text: 'kontakt@prokombiznes.pl', url: 'mailto:kontakt@prokombiznes.pl' }],
          },
        },
        count: 3,
        hidden: null,
      },
    ])
  })

  it('leaves other texts untouched', () => {
    const block = { heading: 'pro-kom.eu — wspólne wejście', lead: 'Rabka-Zdrój' }
    expect(fixTexts(block)).toEqual(block)
  })
})
