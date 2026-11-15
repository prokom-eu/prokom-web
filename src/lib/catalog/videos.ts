/**
 * Producers' films of a product (`Products.videos`, ADR-016). Only the YouTube id is stored;
 * the page builds the youtube-nocookie address itself, after the visitor clicks.
 */

/** YouTube video id: 11 characters of the URL-safe base64 alphabet (ADR-016). */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

export function isYoutubeId(value: string): boolean {
  return YOUTUBE_ID.test(value)
}

export function validateYoutubeId(value: string | null | undefined): true | string {
  if (!value) return 'Podaj identyfikator filmu.'
  return isYoutubeId(value)
    ? true
    : `Identyfikator filmu to 11 znaków z adresu YouTube (po „v=”), np. „UFXLZ4kSjD0” — „${value}”.`
}

/** How closely the film shows the card (K31-ZMIANY §7): this model, its series or the brand. */
export const VIDEO_MATCHES = [
  { label: 'Ten model', value: 'model' },
  { label: 'Seria', value: 'series' },
  { label: 'Marka', value: 'brand' },
] as const
