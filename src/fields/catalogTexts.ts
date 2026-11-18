import type { Field } from 'payload'

import { CATALOG_TEXT_DEFAULTS, type CatalogTextLine } from '../lib/catalog/texts'

const HINT = 'Puste pole = tekst domyślny linii (widoczny pod polem).'

/**
 * Group `catalog` of the line settings (ADR-029 pkt 3): texts of `/oferta` and `/marki`. Every
 * field is optional; an empty one keeps the line's default from `lib/catalog/texts`.
 */
export function catalogTextsGroup(line: CatalogTextLine): Field {
  const d = CATALOG_TEXT_DEFAULTS[line]
  const admin = (name: keyof typeof d) => ({ description: `${HINT} Domyślnie: „${d[name]}”` })
  const text = (name: keyof typeof d, label: string): Field => ({
    name,
    label,
    type: 'text',
    admin: admin(name),
  })
  const textarea = (name: keyof typeof d, label: string, maxLength?: number): Field => ({
    name,
    label,
    type: 'textarea',
    ...(maxLength ? { maxLength } : {}),
    admin: admin(name),
  })
  return {
    name: 'catalog',
    label: 'Katalog — teksty stron Oferta i Marki',
    type: 'group',
    fields: [
      text('offerTitle', 'Oferta: nagłówek H1'),
      text('offerMetaTitle', 'Oferta: tytuł w Google'),
      textarea('offerDescription', 'Oferta: opis w Google (do 155 znaków)', 155),
      textarea('offerLead', 'Oferta: wstęp pod nagłówkiem'),
      text('brandsTitle', 'Marki: tytuł w Google'),
      textarea('brandsDescription', 'Marki: opis w Google (do 155 znaków)', 155),
    ],
  }
}
