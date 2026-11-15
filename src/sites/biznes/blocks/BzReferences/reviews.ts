type Review = {
  id?: string | null
  quote: string
  author: string
  source?: string | null
  url?: string | null
}

type Placeholder = { kind: 'placeholder'; text: string; author: string; source: string }

export type ReviewSlot = { kind: 'review'; review: Review } | Placeholder

/** Board v150 `#s4-opinie`: three cards. */
const SLOTS = 3

/** Placeholders of the board (K36 §13: without stars, marked „[do podmiany]”). */
const PLACEHOLDERS: Placeholder[] = [
  {
    kind: 'placeholder',
    text: 'Miejsce na opinię z Google — wklejamy oryginalny tekst, bez zmian.',
    author: 'Imię i inicjał',
    source: 'opinia Google · data',
  },
  {
    kind: 'placeholder',
    text: 'Miejsce na wypowiedź klienta firmowego — za jego zgodą, z nazwą firmy i miejscowością.',
    author: 'Imię, firma',
    source: 'klient od roku …',
  },
]

/**
 * Cards of the reviews section: the reviews from the panel (at most three); with
 * `placeholders` (never in a production build, ADR-017 D-K4-6) the empty places are filled.
 */
export function reviewSlots(reviews: readonly Review[], placeholders: boolean): ReviewSlot[] {
  const real: ReviewSlot[] = reviews.slice(0, SLOTS).map((review) => ({ kind: 'review', review }))
  if (!placeholders) return real
  return [...real, ...PLACEHOLDERS].slice(0, Math.max(real.length, SLOTS))
}
