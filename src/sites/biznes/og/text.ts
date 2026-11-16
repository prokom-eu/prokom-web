// Texts and sizes of the Biznes sharing image — kept apart from `card.tsx`, which loads `next/og`.

export { ogDomain, ogNotFound, titleSize } from '@/lib/og/text'

/** The first sentence of a text from the panel (the site description), or `null`. */
export function firstSentence(text: string | null | undefined): string | null {
  const trimmed = text?.trim()
  if (!trimmed) return null
  return trimmed.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? trimmed
}
