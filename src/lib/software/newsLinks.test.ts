import { describe, expect, it } from 'vitest'

import { withoutNewsLinks } from './newsLinks'

describe('withoutNewsLinks (SWV8 P0 #3)', () => {
  const navigation = {
    header: [
      { label: 'Oferta', href: '/rozwiazania' },
      { label: 'Aktualności', href: '/aktualnosci' },
    ],
    mobileMenu: {
      company: [
        ['O firmie', '/o-firmie'],
        ['Aktualności i poradnik', '/aktualnosci'],
      ],
    },
    footer: {
      columns: [
        {
          title: 'Firma',
          links: [
            ['Aktualności i poradnik', '/aktualnosci'],
            ['Wpis', '/aktualnosci/jakis-wpis'],
            ['Kontakt', '/kontakt'],
          ],
        },
      ],
    },
  }

  it('drops every link to the news list and its posts, objects and tuples alike', () => {
    expect(withoutNewsLinks(navigation)).toEqual({
      header: [{ label: 'Oferta', href: '/rozwiazania' }],
      mobileMenu: { company: [['O firmie', '/o-firmie']] },
      footer: { columns: [{ title: 'Firma', links: [['Kontakt', '/kontakt']] }] },
    })
  })

  it('keeps addresses that only start alike', () => {
    const value = { header: [{ label: 'X', href: '/aktualnosci-archiwum' }] }
    expect(withoutNewsLinks(value)).toEqual(value)
  })

  it('does not change the input', () => {
    const copy = structuredClone(navigation)
    withoutNewsLinks(navigation)
    expect(navigation).toEqual(copy)
  })
})
