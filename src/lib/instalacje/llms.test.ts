import { describe, expect, it } from 'vitest'

import { llmsTxt } from './llms'

describe('llmsTxt', () => {
  const text = llmsTxt({
    origin: 'https://prokominstalacje.pl',
    name: 'PRO-KOM Instalacje',
    phone: '+48 889 003 889',
    email: 'kontakt@prokominstalacje.pl',
    address: 'ul. Orkana 16B, 34-700 Rabka-Zdrój',
    services: [
      { name: 'Monitoring i kamery', href: '/monitoring', description: 'Kompletny system.' },
      { name: 'Bez strony', href: null, description: 'Opis.' },
    ],
    objects: [{ name: 'Pensjonat', href: '/dla-kogo/pensjonaty' }],
  })

  it('has the llms.txt shape: title, summary, sections with absolute links', () => {
    expect(text.startsWith('# PRO-KOM Instalacje\n\n> ')).toBe(true)
    expect(text).toContain(
      '- [Monitoring i kamery](https://prokominstalacje.pl/monitoring): Kompletny system.',
    )
    expect(text).toContain('- Bez strony: Opis.')
    expect(text).toContain('- [Pensjonat](https://prokominstalacje.pl/dla-kogo/pensjonaty)')
    expect(text).toContain('- [Pełna oferta](https://prokominstalacje.pl/uslugi)')
    expect(text).toContain('- Telefon: +48 889 003 889')
  })

  it('keeps the promises of the spec: no prices, one salon, no boss markers', () => {
    expect(text).not.toMatch(/\d+\s?zł|\[SZEF|\[CENA/)
    expect(text).toContain('Gwarancja 24 miesiące na montaż')
    expect(text).not.toMatch(/salon[^\n]*Zakopan/i)
  })

  it('leaves out contact lines the panel does not have', () => {
    const bare = llmsTxt({
      origin: 'https://x.pl',
      name: 'X',
      phone: null,
      email: null,
      address: null,
      services: [],
      objects: [],
    })
    expect(bare).not.toMatch(/Telefon|E-mail|Salon:/)
  })
})
