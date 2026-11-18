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

export type CatalogTextLine = 'biznes' | 'instalacje'

/** The text set of a tenant that passed `requireCatalogTenant` (Biznes or Instalacje). */
export function catalogTextLine(line: string): CatalogTextLine {
  return line === 'instalacje' ? 'instalacje' : 'biznes'
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
