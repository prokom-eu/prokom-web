/**
 * A short word with a hyphen — „P-4”, „P-5”, „Wi-Fi”, „e-mail” — that must not break after the
 * hyphen („P-” at the end of a line, „4” on the next). Longer compounds (Rabka-Zdrój) may break.
 */
const SHORT_HYPHENATED = /(?<![\p{L}\d-])[\p{L}\d]{1,3}-[\p{L}\d]{1,4}(?![\p{L}\d-])/gu

export type TextPart = { text: string; nowrap: boolean }

/**
 * The text split into parts, the short hyphenated words marked `nowrap`. The fonts (Archivo,
 * Manrope) have no non-breaking hyphen U+2011, so the page wraps these parts in a span with
 * `white-space: nowrap` instead (`<NoBreak>`).
 */
export function noBreakParts(text: string): TextPart[] {
  const parts: TextPart[] = []
  let last = 0
  for (const match of text.matchAll(SHORT_HYPHENATED)) {
    const start = match.index
    if (start > last) parts.push({ text: text.slice(last, start), nowrap: false })
    parts.push({ text: match[0], nowrap: true })
    last = start + match[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last), nowrap: false })
  return parts
}
