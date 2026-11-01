import { metaDescription } from '../seo/description'

/** Shortest meta description worth showing in results (audit 01.11: 50–160 characters). */
export const META_DESCRIPTION_MIN = 50

/** What a short text from the panel is completed with: who offers it and where. */
const CONTEXT = 'Dobór, wdrożenie i serwis — PRO-KOM Biznes, Rabka-Zdrój.'

/**
 * Meta description of a Biznes page from a text of the panel: cut to 155 characters, and a text
 * too short to say anything („Drukarki etykiet”, 16 characters) completed with `CONTEXT`.
 */
export function biznesDescription(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length >= META_DESCRIPTION_MIN) return metaDescription(clean)
  const sentence = clean.replace(/[\s.,;:–—-]+$/, '')
  return metaDescription(sentence ? `${sentence}. ${CONTEXT}` : CONTEXT)
}
