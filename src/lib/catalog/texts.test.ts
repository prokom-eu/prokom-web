import { describe, expect, it } from 'vitest'

import { CATALOG_TEXT_DEFAULTS, CATALOG_UI, catalogTextLine, catalogTexts } from './texts'

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

describe('catalog copy of a line (ADR-029, INST-K1)', () => {
  it('keeps the Biznes copy of the list and the product page word for word', () => {
    expect(CATALOG_UI.biznes).toEqual({
      searchPlaceholder:
        'Szukaj w ofercie: nazwa, marka albo potrzeba, np. kasa mobilna, Wi-Fi dla gości, Subiekt',
      helpText:
        'Odpowiedz na kilka prostych pytań, a pokażemy rozwiązania dobrane do Twojej firmy.',
      helpLabel: 'Otwórz konfigurator',
      helpHref: '/konfigurator',
      offListText:
        'Dostarczamy też sprzęt i programy spoza listy. Sprawdzimy u dystrybutorów i odezwiemy się z ofertą.',
      productPriceNote: 'Bez cen na stronie. Ofertę z wybraną wersją przygotujemy pod Twoją firmę.',
      productCtaTitle: 'Potrzebujesz kilku sztuk albo całego stanowiska?',
      productCtaText:
        'Dodaj do zapytania, dopisz liczbę stanowisk i programy. Przygotujemy ofertę z konfiguracją, wdrożeniem i serwisem.',
      brandsLead:
        'od kas fiskalnych po serwery. Przy każdej pomożemy wybrać model, wdrożymy i zajmiemy się serwisem, a salony producentów pokazują serie, porównania i gotowe konfiguracje.',
      brandsMissing:
        'Dostarczamy więcej marek, niż pokazujemy. Napisz, czego szukasz, a sprawdzimy u dystrybutorów.',
      brandsOther:
        'Współpracujemy z dystrybutorami sprzętu i oprogramowania w całej Polsce. Sprawdzimy dostępność i przygotujemy ofertę.',
      sentPhoned: 'Oddzwonimy w ciągu 60 minut w godzinach pracy i przygotujemy ofertę.',
      stepQuote: ['Wycena na mailu', 'z wariantami do wyboru i terminem realizacji'],
      stepDelivery: ['Dostawa i wdrożenie', 'konfiguracja, fiskalizacja i szkolenie u Ciebie'],
      productCtaEyebrow: 'Wycena na mailu',
    })
  })

  it('gives Instalacje its own copy and a help link to its planner', () => {
    const biznes = Object.values(CATALOG_UI.biznes).flat()
    for (const [key, value] of Object.entries(CATALOG_UI.instalacje)) {
      if (key === 'helpHref') continue
      for (const text of [value].flat()) expect(biznes).not.toContain(text)
    }
    expect(CATALOG_UI.instalacje.helpHref).toBe('/zaplanuj')
  })
})
