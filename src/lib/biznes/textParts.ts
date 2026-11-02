/**
 * Small text splits of the Biznes pages (board v150), kept out of the components so they can be
 * tested: the time in a callback promise (shown in bold) and the second sentence of a heading
 * (shown in the accent).
 */

/** „Oddzwaniamy w ciągu **60 minut**”: the text before, the time and the rest — or `null`. */
export function splitTime(text: string): [before: string, time: string, after: string] | null {
  const match = text.match(/^(.*?)(\d+\s*(?:minut\p{L}*|min\.?|godzin\p{L}*|h)(?!\p{L}))(.*)$/u)
  return match ? [match[1] ?? '', match[2] ?? '', match[3] ?? ''] : null
}

/**
 * „Napisz, czego potrzebujesz. Oddzwonimy…” — the first sentence and the rest, split at the
 * first full stop, question or exclamation mark followed by a capital letter (so „np. kasa”
 * stays in one piece).
 */
export function splitSentence(text: string): [first: string, rest: string | null] {
  const match = text.match(/^(.+?[.?!])\s+(\p{Lu}.*)$/su)
  return match ? [match[1] ?? text, (match[2] ?? '').trim() || null] : [text, null]
}

/** „A · B”, „A·B”, „A  ·  B” — the parts of a line split by middle dots. */
export function splitDots(text: string): string[] {
  return text
    .split(/\s*·\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
}
