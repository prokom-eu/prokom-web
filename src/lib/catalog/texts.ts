/**
 * Texts of the catalog pages `/oferta` and `/marki` that differ per line (ADR-029 pkt 3): the
 * group `catalog` of `BiznesSettings` / `InstalacjeSettings` overrides them, an empty field
 * keeps the line's default. The same text never appears on two domains (SEO).
 */
export type CatalogTexts = {
  /** H1 of `/oferta`. */
  offerTitle: string
  /** `<title>` of `/oferta`, with the region. */
  offerMetaTitle: string
  /** Meta description of `/oferta` (≤ 155 characters). */
  offerDescription: string
  /** Lead under the H1 of `/oferta`. */
  offerLead: string
  /** `<title>` of `/marki`. */
  brandsTitle: string
  /** Meta description of `/marki` (≤ 155 characters). */
  brandsDescription: string
}

/** Copy of the offer list that is not panel content: the search hint and the help tile. */
export type CatalogUi = {
  searchPlaceholder: string
  helpText: string
  helpLabel: string
  helpHref: string
  /** „Nie widzisz tego, czego szukasz?” under the grid. */
  offListText: string
  /** Under the product's buttons. */
  productPriceNote: string
  /** The product's dark „Wycena na mailu” band. */
  productCtaTitle: string
  productCtaText: string
  /** Drawer confirmation when a phone was given. */
  sentPhoned: string
  /** Steps after sending: the quote and the delivery. */
  stepQuote: [string, string]
  stepDelivery: [string, string]
  /** Eyebrow of the product's dark band. */
  productCtaEyebrow: string
}

export const CATALOG_UI: Record<CatalogTextLine, CatalogUi> = {
  biznes: {
    searchPlaceholder:
      'Szukaj w ofercie: nazwa, marka albo potrzeba, np. kasa mobilna, Wi-Fi dla gości, Subiekt',
    helpText: 'Odpowiedz na kilka prostych pytań, a pokażemy rozwiązania dobrane do Twojej firmy.',
    helpLabel: 'Otwórz konfigurator',
    helpHref: '/konfigurator',
    offListText:
      'Dostarczamy też sprzęt i programy spoza listy. Sprawdzimy u dystrybutorów i odezwiemy się z ofertą.',
    productPriceNote: 'Bez cen na stronie. Ofertę z wybraną wersją przygotujemy pod Twoją firmę.',
    productCtaTitle: 'Potrzebujesz kilku sztuk albo całego stanowiska?',
    productCtaText:
      'Dodaj do zapytania, dopisz liczbę stanowisk i programy. Przygotujemy ofertę z konfiguracją, wdrożeniem i serwisem.',
    sentPhoned: 'Oddzwonimy w ciągu 60 minut w godzinach pracy i przygotujemy ofertę.',
    stepQuote: ['Wycena na mailu', 'z wariantami do wyboru i terminem realizacji'],
    stepDelivery: ['Dostawa i wdrożenie', 'konfiguracja, fiskalizacja i szkolenie u Ciebie'],
    productCtaEyebrow: 'Wycena na mailu',
  },
  instalacje: {
    searchPlaceholder:
      'Szukaj sprzętu: model, marka albo potrzeba, np. kamera 4K, alarm Ajax, domofon',
    helpText: 'Opisz budynek w czterech krokach, a dobierzemy sprzęt i montaż do Twojego obiektu.',
    helpLabel: 'Zaplanuj instalację',
    helpHref: '/zaplanuj',
    offListText:
      'Montujemy też sprzęt spoza listy. Napisz, czego potrzebujesz, a dobierzemy model do budynku.',
    productPriceNote:
      'Bez cen na stronie. Wycenę sprzętu z montażem przygotujemy po rozmowie o obiekcie.',
    productCtaTitle: 'Kilka kamer, alarm albo cały obiekt?',
    productCtaText:
      'Dodaj sprzęt do zapytania i napisz, gdzie ma działać. Przygotujemy ofertę z montażem, konfiguracją aplikacji i serwisem.',
    sentPhoned:
      'Oddzwonimy w godzinach pracy, żeby ustalić szczegóły montażu i przygotować ofertę.',
    stepQuote: ['Oferta z montażem', 'po rozmowie o obiekcie, z wariantami sprzętu'],
    stepDelivery: ['Montaż i konfiguracja', 'aplikacja w telefonie ustawiona przy odbiorze'],
    productCtaEyebrow: 'Oferta z montażem',
  },
}

export type CatalogTextLine = 'biznes' | 'instalacje'

/**
 * The text set of a tenant that passed `requireCatalogTenant`. Another line throws instead of
 * quietly taking the Biznes texts (no copy between domains).
 */
export function catalogTextLine(line: string): CatalogTextLine {
  if (line === 'biznes' || line === 'instalacje') return line
  throw new Error(`No catalog texts for line ${line}`)
}

/** Texts of the inquiry drawer of a catalog line, passed from the server frame (`CartDrawer`). */
export function drawerTexts(line: CatalogTextLine) {
  const { sentPhoned, helpHref, helpLabel } = CATALOG_UI[line]
  return {
    sentPhoned,
    helpHref,
    helpLabel,
    helpButton: line === 'instalacje' ? helpLabel : 'Konfigurator',
  }
}

export const CATALOG_TEXT_DEFAULTS: Record<CatalogTextLine, CatalogTexts> = {
  biznes: {
    offerTitle: 'Cała oferta dla firm',
    // SEO lokalne 13.11: the region in `<title>`, the H1 stays short.
    offerMetaTitle: 'Oferta dla firm — Rabka-Zdrój i Podhale',
    // Audit 01.11: ≤ 155 characters; the lead below is longer.
    offerDescription:
      'Sprzęt, programy i usługi dla firm z Rabki-Zdroju, Podhala i Małopolski: dobór, wdrożenie i serwis. Dodaj pozycje do zapytania — wycena na mailu.',
    // Lead of the K4 board `Web-Oferta`.
    offerLead:
      'Sprzęt, programy i usługi dla firm i instytucji, z doborem, wdrożeniem i serwisem. Cen nie podajemy na stronie: dodaj pozycje do zapytania, a przygotujemy wycenę.',
    brandsTitle: 'Salony marek dla firm — Rabka-Zdrój',
    brandsDescription:
      'Posnet, Elzab, GoPOS, InsERT, Lenovo, Dell, Apple i inne: salony marek z doborem modelu, porównaniem serii, wdrożeniem i serwisem w Rabce-Zdroju.',
  },
  // TODO(krystian): texts of the Instalacje catalog to confirm before `inst/k1-katalog` switches
  // the catalog on (ADR-029; no prices, „24 h” only as the answer to a request).
  instalacje: {
    offerTitle: 'Sprzęt do monitoringu, alarmów i domofonów',
    offerMetaTitle: 'Sprzęt do monitoringu i alarmów — Rabka-Zdrój i Podhale',
    offerDescription:
      'Kamery, rejestratory, alarmy, wideodomofony i kontrola dostępu z montażem na Podhalu. Wybierz sprzęt, wyślij zapytanie — dobierzemy i zamontujemy.',
    offerLead:
      'Kamery, alarmy, domofony i uchwyty, które montujemy w domach, firmach i obiektach. Dobierzemy sprzęt do budynku, zamontujemy, skonfigurujemy aplikację i zostaniemy w serwisie.',
    brandsTitle: 'Marki sprzętu zabezpieczeń — montaż na Podhalu',
    brandsDescription:
      'Dahua, Hikvision, BCS, UniFi Protect, Satel, Ajax i inne marki, które montujemy: dobór serii pod obiekt, montaż, konfiguracja i serwis na Podhalu.',
  },
}

type PanelTexts = Partial<Record<keyof CatalogTexts, string | null | undefined>> | null | undefined

/** The line's texts with the panel's non-empty fields over the defaults. */
export function catalogTexts(line: CatalogTextLine, panel: PanelTexts): CatalogTexts {
  const defaults = CATALOG_TEXT_DEFAULTS[line]
  const texts = { ...defaults }
  for (const key of Object.keys(defaults) as (keyof CatalogTexts)[]) {
    const value = panel?.[key]?.trim()
    if (value) texts[key] = value
  }
  return texts
}
