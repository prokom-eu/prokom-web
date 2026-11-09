import { PHRASE_PARAM } from '@/lib/shared/search/provider'

import { PROJECT_SEND_HREF } from './project'

/**
 * „Zapytaj o tę ofertę →” with the chips of „Potrzebujesz więcej?” (OKNO-OFERTY-PREMIUM §2.3):
 * the solution goes into „Twój projekt” as before (`?projekt=1`), the chosen extras start the
 * message of the shared form (`?fraza=`). No prices — they are quoted in writing.
 */
export function askHref(name: string, extras: readonly string[]): string {
  if (extras.length === 0) return PROJECT_SEND_HREF
  const [path, hash] = PROJECT_SEND_HREF.split('#')
  const phrase = `${name} — dodatkowo: ${extras.join(', ')}`
  return `${path}&${PHRASE_PARAM}=${encodeURIComponent(phrase)}${hash ? `#${hash}` : ''}`
}

/** The bar's state (§2.4): „W zapytaniu: Galeria, Opinie”. */
export function extrasLabel(extras: readonly string[]): string | null {
  return extras.length > 0 ? `W zapytaniu: ${extras.join(', ')}` : null
}
