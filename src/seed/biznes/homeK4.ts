// K4c — home page v150 (K36 §1, K4-FINAL §2): what the seed changes in a home page it created
// earlier. Only values still equal to the old seed text are replaced, so edits in the panel win.

type Block = { blockType: string }
type Fields = Record<string, unknown>
type Trust = { icon: string; text: string }

/** The hero texts the seed wrote before K4 (B7). */
export const OLD_HERO = {
  heading: 'Kasy, komputery i opieka IT.',
  // The seed had a hard space here (one-letter word rule, K4-FINAL §1).
  headingAccent: 'Jeden telefon do wszystkiego.',
  lead: 'Dobieramy, wdrażamy i serwisujemy wszystko, na czym pracuje Twoja firma: od kasy fiskalnej po serwer. Jeden partner z Rabki zamiast kilku firm i infolinii.',
  cta: { label: 'Dobierz zestaw w 60 sekund', href: '/kreator' },
  trustItems: [
    { icon: 'cal', text: 'Na Podhalu od 2004' },
    { icon: 'users', text: '100+ firm pod stałą opieką' },
  ] as Trust[],
}

/** Board `Strona.dc.html` (start, `#s4-top`) — v150. */
export const K4_HERO = {
  // Hard spaces after one-letter words in headings (K4-FINAL §1).
  heading: 'Kasy, komputery i programy dla firm.',
  headingAccent: 'Wszystko z jednego miejsca — z Rabki.',
  lead: 'Dobieramy, wdrażamy i serwisujemy wszystko, na czym pracuje firma: od kasy fiskalnej i terminala, przez komputery i programy, po sieć i serwer. Jeden partner z Rabki zamiast kilku firm i infolinii.',
  // TODO(krystian): /konfigurator after K4g.
  cta: { label: 'Dobierz rozwiązanie dla firmy', href: '/kreator' },
  // K4-FINAL §1: one wording of the client count.
  trustItems: [
    { icon: 'cal', text: 'Na Podhalu od 2004' },
    { icon: 'users', text: '100+ klientów firmowych' },
  ] as Trust[],
}

/** Texts of „Najczęściej wybierane” before K4 (B7) and in v150 (K35 7a, board `#s4-pop`). */
export const OLD_FEATURED = {
  heading: 'Osiem pozycji, o które firmy pytają najczęściej.',
  lead: 'Każdą dodasz do zapytania jednym kliknięciem. Resztę oferty znajdziesz w katalogu.',
  catalogLabel: 'Cały katalog',
}
export const K4_FEATURED = {
  heading: 'O to firmy pytają najczęściej.',
  // The board adds „obejrzysz w podglądzie” — the home cards have no quick view (yet).
  lead: 'Od tego firmy zaczynają najczęściej: kasa i terminal, stanowisko POS, laptop do biura, Subiekt, ochrona, podpis i UPS. Każdą pozycję dodasz do zapytania jednym kliknięciem.',
  catalogLabel: 'Cała oferta',
}

/** Texts of the brands block (`partners`) before K4 (the logo bar) and in v150 (board `#s4-marki`). */
export const OLD_BRANDS = {
  heading: 'Marki, które sprzedajemy, wdrażamy i serwisujemy',
  lead: 'Najedź, żeby zatrzymać',
}
export const K4_BRANDS = {
  heading: 'Marki, które znamy od środka.',
  lead: 'Autoryzowany serwis Posnet i Elzab, autoryzowany partner GoPOS i InsERT oraz salony producentów — każdy z doborem modelu, porównaniem i serwisem.',
}

/** The hero's trust line (`SiteSettings.biznes.trustLine`) before K4 and now (K4-FINAL §1). */
export const OLD_TRUST_LINE = 'Serwis Posnet i Elzab · partner GoPOS i InsERT'
export const K4_TRUST_LINE =
  'Autoryzowany serwis Posnet i Elzab · Autoryzowany partner GoPOS i InsERT'

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** Trust rows without the ids Payload adds, for the comparison. */
function trustOf(value: unknown): Trust[] {
  if (!Array.isArray(value)) return []
  return value.map((row: { icon?: unknown; text?: unknown }) => ({
    icon: String(row.icon),
    text: String(row.text),
  }))
}

function upgradeHero<T extends Block>(hero: T): T {
  const next: Fields = { ...hero }
  for (const key of ['heading', 'headingAccent', 'lead'] as const) {
    if (next[key] === OLD_HERO[key]) next[key] = K4_HERO[key]
  }
  const cta = next.cta as { label?: unknown; href?: unknown } | undefined
  if (cta && cta.label === OLD_HERO.cta.label && cta.href === OLD_HERO.cta.href) {
    next.cta = { ...cta, ...K4_HERO.cta }
  }
  if (same(trustOf(next.trustItems), OLD_HERO.trustItems)) next.trustItems = K4_HERO.trustItems
  return next as T
}

function upgradeFeatured<T extends Block>(block: T): T {
  const next: Fields = { ...block }
  for (const key of ['heading', 'lead', 'catalogLabel'] as const) {
    if (next[key] === OLD_FEATURED[key]) next[key] = K4_FEATURED[key]
  }
  return next as T
}

function upgradeBrands<T extends Block>(block: T): T {
  const next: Fields = { ...block }
  for (const key of ['heading', 'lead'] as const) {
    if (next[key] === OLD_BRANDS[key]) next[key] = K4_BRANDS[key]
  }
  return next as T
}

/**
 * The home layout in the v150 shape, or `null` when nothing changes: the hero texts, and the
 * brands (`partners`) right after the departments (`bzOffer`), as on the board.
 */
export function upgradeHomeK4<T extends Block>(
  layout: readonly T[] | null | undefined,
): T[] | null {
  if (!layout || layout.length === 0) return null
  let next = layout.map((block) =>
    block.blockType === 'bzHero'
      ? upgradeHero(block)
      : block.blockType === 'bzFeatured'
        ? upgradeFeatured(block)
        : block.blockType === 'partners'
          ? upgradeBrands(block)
          : block,
  )

  // Moved only while the block still has the old seed heading (the logo bar): an order set in
  // the panel later stays.
  const brands = layout.findIndex(
    (block) => block.blockType === 'partners' && (block as Fields).heading === OLD_BRANDS.heading,
  )
  const offer = next.findIndex((block) => block.blockType === 'bzOffer')
  if (brands !== -1 && offer !== -1 && brands < offer) {
    const moved = next[brands] as T
    next = next.filter((_, i) => i !== brands)
    // With the brands taken out, the departments moved one up: `offer` is right after them.
    next.splice(offer, 0, moved)
  }
  return same(next, layout) ? null : next
}
