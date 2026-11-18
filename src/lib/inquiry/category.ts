import type { Line } from '../tenant/lines'
import type { InquiryType } from './types'

/** Category of an inquiry from the Instalacje catalog (`/zapytanie`, ADR-029 pkt 5). */
export const INSTALACJE_CATALOG_CATEGORY = 'Instalacje · Sprzęt'

/**
 * Category saved with an inquiry. The catalog list form sends none; on Instalacje its list
 * gets „Instalacje · Sprzęt”, so the office tells it from service requests. A category sent
 * by a form always wins. „Zapytaj o frazę” of the catalog counts too.
 */
export function inquiryCategory(
  line: Line,
  type: InquiryType,
  category: string | undefined,
): string | undefined {
  if (category) return category
  if (line === 'instalacje' && (type === 'list' || type === 'search')) {
    return INSTALACJE_CATALOG_CATEGORY
  }
  return undefined
}
