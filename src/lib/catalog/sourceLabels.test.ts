import { describe, expect, it } from 'vitest'

import { labeledSourceLinks, sourceLabel, sourceLinks, sourceMeta } from './sourceLabels'

const PSREF =
  'https://psref.lenovo.com/syspool/Sys/PDF/ThinkBook/ThinkBook_14_G8_IRL/ThinkBook_14_G8_IRL_Spec.pdf'

describe('sourceLabel', () => {
  it('names a PSREF sheet after its model', () => {
    expect(sourceLabel(PSREF, 'Lenovo')).toBe('Specyfikacja PSREF — ThinkBook 14 G8 IRL')
  })

  it('tells PDF kinds apart and names the producer', () => {
    expect(sourceLabel('https://www.posnet.com.pl/files/ergo-karta-katalogowa.pdf', 'Posnet')).toBe(
      'Karta katalogowa (PDF) — Posnet',
    )
    expect(sourceLabel('https://www.elzab.com.pl/pliki/instrukcja-k10.pdf', 'Elzab')).toBe(
      'Instrukcja (PDF) — Elzab',
    )
    expect(sourceLabel('https://www.dell.com/x/ogolne.pdf', 'Dell')).toBe('Dokument PDF — Dell')
  })

  it('labels support pages, official sites and plain producer pages', () => {
    expect(sourceLabel('https://www.dell.com/support/home/pl-pl/product', 'Dell')).toBe(
      'Dokumentacja producenta — Dell',
    )
    expect(sourceLabel('https://www.podatki.gov.pl/ksef/', null)).toBe(
      'Informacja urzędowa — podatki.gov.pl',
    )
    expect(sourceLabel('https://www.synology.com/pl-pl/products/DS224+', null)).toBe(
      'Strona producenta — synology.com',
    )
  })
})

describe('sourceMeta', () => {
  it('shows „host · PDF” or the host and a path of up to 40 characters', () => {
    expect(sourceMeta(PSREF)).toBe('psref.lenovo.com · PDF')
    expect(sourceMeta('https://www.ui.com/wifi/')).toBe('ui.com/wifi')
    const long = sourceMeta('https://www.lenovo.com/pl/pl/p/laptops/thinkbook/thinkbook-14-gen-8')
    expect(long).toHaveLength(40)
    expect(long.endsWith('…')).toBe(true)
  })
})

describe('sourceLinks', () => {
  it('keeps producers only, datasheets first, each address once', () => {
    const links = sourceLinks(
      {
        productPages: [
          'https://www.lenovo.com/pl/thinkbook',
          'https://www.senetic.pl/thinkbook',
          PSREF,
        ],
        datasheets: [PSREF],
      },
      'Lenovo',
    )
    expect(links.map((link) => link.url)).toEqual([PSREF, 'https://www.lenovo.com/pl/thinkbook'])
  })

  it("names another producer's link by its host, not by the card's brand", () => {
    const [link] = sourceLinks(
      { productPages: ['https://www.microsoft.com/pl-pl/windows/business'], datasheets: [] },
      'Lenovo',
    )
    expect(link?.label).toBe('Strona producenta — microsoft.com')
  })

  it('is empty without producer sources (our services)', () => {
    expect(
      sourceLinks({ productPages: ['https://sklep.example.pl/x'], datasheets: [] }, null),
    ).toEqual([])
  })
})

describe('labeledSourceLinks (K4 `zrodla`)', () => {
  it('keeps producers with a label, once each; a price page only as the last resort', () => {
    expect(
      labeledSourceLinks([
        { label: '', url: 'https://www.posnet.com.pl/a' },
        { label: 'Cennik', url: 'https://www.gopos.pl/cennik' },
        { label: 'GoPOS', url: 'https://www.gopos.pl/' },
        { label: 'GoPOS 2', url: 'https://www.gopos.pl/' },
      ]).map(({ label }) => label),
    ).toEqual(['GoPOS'])
    expect(
      labeledSourceLinks([{ label: 'Cennik', url: 'https://www.gopos.pl/cennik' }]).map(
        ({ label }) => label,
      ),
    ).toEqual(['Cennik'])
  })
})

describe('labeledSourceLinks: what is under each link (audit 14.11 P1-3)', () => {
  const insert = (path: string) => ({
    label: 'Strona producenta — InsERT',
    url: `https://www.insert.com.pl/programy_dla_firm/sprzedaz/${path}`,
  })

  it('a label repeated on a card names the page from its address', () => {
    expect(
      labeledSourceLinks([
        insert('subiekt_nexo/opis.html'),
        insert('subiekt_nexo_pro/opis.html'),
        insert('subiekt_nexo/wymagania_systemowe.html'),
        insert('subiekt_nexo_pro/ekrany.html'),
        insert('subiekt_nexo/porownanie.html'),
      ]).map(({ label }) => label),
    ).toEqual([
      'InsERT — Subiekt nexo',
      'InsERT — Subiekt nexo pro',
      'InsERT — Subiekt nexo, wymagania systemowe',
      'InsERT — Subiekt nexo pro, ekrany programu',
      'InsERT — Subiekt nexo, porównanie wersji',
    ])
  })

  it('help articles, PDFs and newsroom pages say what they are', () => {
    expect(
      labeledSourceLinks([
        {
          label: 'Strona producenta — GoPOS',
          url: 'https://help.gopos.pl/pl/articles/11508519-kasa-wirtualna-jak-zaczac',
        },
        { label: 'Strona producenta — GoPOS', url: 'https://gopos.pl/files/karta-sunmi-v3.pdf' },
        {
          label: 'Strona producenta — GoPOS',
          url: 'https://gopos.pl/newsroom/2026/03/nowy-gopos',
        },
      ]).map(({ label }) => label),
    ).toEqual([
      'GoPOS — Kasa wirtualna jak zaczac, pomoc',
      'GoPOS — Karta sunmi v3, karta katalogowa (PDF)',
      'GoPOS — Nowy gopos, komunikat prasowy',
    ])
  })

  it('keeps a label that is unique on the card', () => {
    expect(
      labeledSourceLinks([
        { label: 'Karta katalogowa — Posnet Ergo', url: 'https://www.posnet.com.pl/ergo.pdf' },
        { label: 'Strona producenta — Posnet', url: 'https://www.posnet.com.pl/ergo' },
      ]).map(({ label }) => label),
    ).toEqual(['Karta katalogowa — Posnet Ergo', 'Strona producenta — Posnet'])
  })

  it('merges the same address written differently (www, trailing slash, #part)', () => {
    expect(
      labeledSourceLinks([
        { label: 'Apple', url: 'https://www.apple.com/pl/macbook-air/' },
        { label: 'Apple 2', url: 'https://apple.com/pl/macbook-air#specs' },
        { label: 'Apple 3', url: 'http://www.apple.com/pl/macbook-air' },
      ]).map(({ url }) => url),
    ).toEqual(['https://www.apple.com/pl/macbook-air/'])
  })

  it('never leaves two links with one label', () => {
    const labels = labeledSourceLinks([
      { label: 'Strona producenta — Dell', url: 'https://www.dell.com/pl-pl/shop/p/a' },
      { label: 'Strona producenta — Dell', url: 'https://www.dell.com/en-us/shop/p/a' },
    ]).map(({ label }) => label)
    expect(new Set(labels).size).toBe(labels.length)
  })
})
