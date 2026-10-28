import { describe, expect, it } from 'vitest'

import { sourceLabel, sourceLinks, sourceMeta } from './sourceLabels'

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
