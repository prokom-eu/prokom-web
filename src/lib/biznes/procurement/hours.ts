const HOURS = '{hours}'

/**
 * Opening hours from the panel in a procurement text (review of B2-1a): `{hours}` → „pn–pt
 * 9:00–17:00” (`hoursSummary` of the company's office). Without hours the placeholder goes, with
 * the parenthesis around it („w godzinach pracy ({hours})” → „w godzinach pracy”).
 */
export function fillHours(text: string, hours: string | null | undefined): string {
  if (!text.includes(HOURS)) return text
  const value = hours?.trim()
  if (value) return text.replaceAll(HOURS, value)
  return text
    .replace(/\s*\(\s*\{hours\}\s*\)/g, '')
    .replaceAll(HOURS, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
