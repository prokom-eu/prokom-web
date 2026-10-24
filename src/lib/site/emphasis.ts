export type TextPart = { text: string; bold: boolean }

/**
 * Text typed in the panel with bold fragments marked `**like this**` (a lead with one strong
 * sentence, plansza Dzial). Pairs only: an unclosed `**` stays as plain text.
 */
export function splitBold(value: string): TextPart[] {
  const parts: TextPart[] = []
  const pattern = /\*\*(.+?)\*\*/g
  let last = 0
  for (const match of value.matchAll(pattern)) {
    const start = match.index ?? 0
    if (start > last) parts.push({ text: value.slice(last, start), bold: false })
    parts.push({ text: match[1] ?? '', bold: true })
    last = start + match[0].length
  }
  if (last < value.length) parts.push({ text: value.slice(last), bold: false })
  return parts
}
