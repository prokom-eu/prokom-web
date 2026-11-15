/**
 * „Sprzęt, instalacje, oprogramowanie i serwis. W jednej firmie.” → the last sentence apart, so it
 * gets the accent and its own line (no „W” left at the end of a line).
 */
export function splitLastSentence(text: string): [string, string | null] {
  const match = text.match(/^(.*[.!?])\s+([^.!?]+[.!?]?)$/)
  return match?.[1] && match[2] ? [match[1], match[2]] : [text, null]
}
