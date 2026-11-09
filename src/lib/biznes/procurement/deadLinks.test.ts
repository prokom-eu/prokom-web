import { describe, expect, it } from 'vitest'

import { pruneDeadLinks } from './deadLinks'

const site = {
  categories: new Set(['kasy-fiskalne', 'siec-wifi']),
  industries: new Set(['noclegi']),
}

describe('pruneDeadLinks (QA BIZ-3: 7 links of the procurement pages answered 404)', () => {
  it('drops a link to a category or industry the site does not have, keeps the rest', () => {
    const data = {
      list: [
        { title: 'Wi-Fi', href: '/oferta/siec' },
        { title: 'Kasa', href: '/oferta/kasy-fiskalne' },
        { title: 'Podkategoria', href: '/oferta/kasy-fiskalne/mobilne' },
        { title: 'Biura', href: '/branze/biura-uslugi' },
        { title: 'Hotele', href: '/branze/noclegi' },
        { title: 'Inne', href: '/kontakt' },
      ],
      cats: [
        { name: 'MFP', category: 'mfp' },
        { name: 'Sieć', category: 'siec-wifi' },
      ],
      title: 'bez zmian',
    }
    const pruned = pruneDeadLinks(data, site)
    expect(pruned.list.map((item) => 'href' in item && item.href)).toEqual([
      false,
      '/oferta/kasy-fiskalne',
      '/oferta/kasy-fiskalne/mobilne',
      false,
      '/branze/noclegi',
      '/kontakt',
    ])
    expect(pruned.cats.map((item) => 'category' in item && item.category)).toEqual([
      false,
      'siec-wifi',
    ])
    expect(pruned.title).toBe('bez zmian')
  })
})
