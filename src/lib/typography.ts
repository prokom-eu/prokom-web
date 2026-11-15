/**
 * Polish typography of headings (K4-FINAL §1): a no-break space after one-letter words
 * (a, i, o, u, w, z), so none is left at the end of a line. For texts from the panel or seed.
 */
export function bindShortWords(text: string): string {
  return text.replace(/(?<=^|[\s („"])([aiouwzAIOUWZ]) /g, '$1 ')
}
