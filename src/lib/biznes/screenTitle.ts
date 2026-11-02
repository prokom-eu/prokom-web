/**
 * Title of a phone screen in the top bar (MOBILE-APLIKACJA §1, prompt 3): the short name of the
 * page — up to a dash, a colon or the end of the first sentence — never a cut-off H1.
 */
export function screenTitle(name: string): string {
  const clean = name.replace(/\s+/g, ' ').trim()
  return clean.split(/\s[—–]\s|:\s|\.\s/)[0]?.trim() || clean
}
