import { describe, expect, it } from 'vitest'

import { CATALOG_TEXT_DEFAULTS, catalogTextLine, catalogTexts } from './texts'

describe('catalog texts of a line (ADR-029 pkt 3)', () => {
  it('keeps the Biznes texts of /oferta and /marki word for word', () => {
    expect(CATALOG_TEXT_DEFAULTS.biznes).toEqual({
      offerTitle: 'Cała oferta dla firm',
      offerMetaTitle: 'Oferta dla firm — Rabka-Zdrój i Podhale',
      offerDescription:
        'Sprzęt, programy i usługi dla firm z Rabki-Zdroju, Podhala i Małopolski: dobór, wdrożenie i serwis. Dodaj pozycje do zapytania — wycena na mailu.',
      offerLead:
        'Sprzęt, programy i usługi dla firm i instytucji, z doborem, wdrożeniem i serwisem. Cen nie podajemy na stronie: dodaj pozycje do zapytania, a przygotujemy wycenę.',
      brandsTitle: 'Salony marek dla firm — Rabka-Zdrój',
      brandsDescription:
        'Posnet, Elzab, GoPOS, InsERT, Lenovo, Dell, Apple i inne: salony marek z doborem modelu, porównaniem serii, wdrożeniem i serwisem w Rabce-Zdroju.',
    })
  })

  it('never shares a text between Biznes and Instalacje (SEO: no copy between domains)', () => {
    const biznes = Object.values(CATALOG_TEXT_DEFAULTS.biznes)
    for (const text of Object.values(CATALOG_TEXT_DEFAULTS.instalacje)) {
      expect(biznes).not.toContain(text)
    }
  })

  it('keeps meta descriptions within 155 characters', () => {
    for (const texts of Object.values(CATALOG_TEXT_DEFAULTS)) {
      expect(texts.offerDescription.length).toBeLessThanOrEqual(155)
      expect(texts.brandsDescription.length).toBeLessThanOrEqual(155)
    }
  })

  it('takes a text from the panel over the default, an empty one falls back', () => {
    const texts = catalogTexts('biznes', { offerTitle: '  Cała oferta  ', offerLead: '   ' })
    expect(texts.offerTitle).toBe('Cała oferta')
    expect(texts.offerLead).toBe(CATALOG_TEXT_DEFAULTS.biznes.offerLead)
  })

  it('has texts for the catalog lines only', () => {
    expect(catalogTextLine('instalacje')).toBe('instalacje')
    expect(() => catalogTextLine('software')).toThrow()
  })

  it('uses the line defaults with no settings document', () => {
    expect(catalogTexts('instalacje', null)).toEqual(CATALOG_TEXT_DEFAULTS.instalacje)
  })
})
