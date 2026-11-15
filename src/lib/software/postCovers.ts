/**
 * Covers of the Software posts (decision of Krystian 15.11: „każda powinna być inna”): a scene
 * drawn in SVG (`news/PostCover`), picked by the post's slug — no picture to upload, no field in
 * the panel, no migration. A post added later without an entry here gets its category's scene
 * until someone gives it its own.
 */
export const COVER_MOTIFS = [
  'price',
  'sheet',
  'compare',
  'flow',
  'shield',
  'speed',
  'scale',
  'checklist',
  'chat',
  'map',
  'schedule',
  'rebuild',
  'keys',
  'booking',
  'cart',
  'stairs',
  'contract',
  'menu',
  'devices',
  'access',
  'code',
] as const

export type CoverMotif = (typeof COVER_MOTIFS)[number]

/** Each post of `seed/prokomsoftware/wpisy/*.md` and the package post — one scene each. */
export const POST_COVER_MOTIFS: Readonly<Record<string, CoverMotif>> = {
  'ile-kosztuje-strona-internetowa-dla-firmy': 'price',
  'excel-w-firmie-kiedy-przestaje-wystarczac': 'sheet',
  'strona-wizytowka-czy-strona-z-panelem': 'compare',
  'automatyzacje-w-malej-firmie': 'flow',
  'bezpieczenstwo-strony-firmowej-co-sprawdzac': 'shield',
  'wolna-strona-na-telefonie-jak-sprawdzic': 'speed',
  'program-na-zamowienie-czy-gotowy-abonament': 'scale',
  'co-przygotowac-przed-zamowieniem-strony': 'checklist',
  'asystent-ai-na-stronie-firmy': 'chat',
  'firma-w-mapach-google-lokalna-widocznosc': 'map',
  'zlecenia-i-grafik-ekip-bez-telefonow': 'schedule',
  'kiedy-przebudowac-stara-strone': 'rebuild',
  'dostepy-do-strony-domena-hosting-lista': 'keys',
  'rezerwacje-bezposrednie-w-pensjonacie': 'booking',
  'czy-potrzebuje-sklepu-internetowego': 'cart',
  'system-dla-firmy-etapami': 'stairs',
  'umowa-na-strone-internetowa-co-sprawdzic': 'contract',
  'menu-restauracji-na-stronie': 'menu',
  'aplikacja-mobilna-czy-strona': 'devices',
  'ustawa-o-dostepnosci-sklep-i-strona': 'access',
  'wordpress-czy-strona-od-zera': 'code',
}

/** The scene of a post added later (no entry above), by its category. */
const BY_CATEGORY: Readonly<Record<string, CoverMotif>> = {
  poradnik: 'checklist',
  strony: 'compare',
  systemy: 'sheet',
  automatyzacje: 'flow',
  bezpieczenstwo: 'shield',
}

export function coverMotif(slug: string, category: string | null | undefined): CoverMotif {
  return POST_COVER_MOTIFS[slug] ?? BY_CATEGORY[category ?? ''] ?? 'code'
}
