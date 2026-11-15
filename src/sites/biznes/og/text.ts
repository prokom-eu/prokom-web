// Texts and sizes of the Biznes sharing image — kept apart from `card.tsx`, which loads `next/og`.

/** The domain as shown on the image: the request host without a port (`biznes.localhost:3001`). */
export function ogDomain(domain: string): string {
  return decodeURIComponent(domain).replace(/:\d+$/, '')
}

/** The first sentence of a text from the panel (the site description), or `null`. */
export function firstSentence(text: string | null | undefined): string | null {
  const trimmed = text?.trim()
  if (!trimmed) return null
  return trimmed.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? trimmed
}

/** 404 of the image routes (another line's domain, an unknown post). */
export function ogNotFound(): Response {
  return new Response('Not found', { status: 404 })
}

/** Title size by length: long titles step down, so the whole text fits in four lines at most. */
export function titleSize(title: string): number {
  if (title.length > 100) return 46
  if (title.length > 80) return 52
  if (title.length > 55) return 60
  return 70
}
