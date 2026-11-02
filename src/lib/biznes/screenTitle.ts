/** Abbreviations whose dot does not end a sentence („np.”, „ok.”, „Sp. z o.o.”). */
const ABBREVIATIONS = ['np', 'ok', 'Sp', 'tj', 'tzn', 'ul', 'tel', 'nr', 'in']

const CUT = new RegExp(`\\s[—–-]\\s|:\\s|(?<!\\b(?:${ABBREVIATIONS.join('|')}))\\.\\s`, 'u')

/**
 * Title of a phone screen in the top bar (MOBILE-APLIKACJA §1, prompt 3): the short name of the
 * page — up to a dash (also a plain „ - ” typed in the panel), a colon or the end of the first
 * sentence — never a cut-off H1.
 */
export function screenTitle(name: string): string {
  const clean = name.replace(/\s+/g, ' ').trim()
  return clean.split(CUT)[0]?.trim() || clean
}
