import type { Block } from 'payload'

import { hrefField } from '../../../../blocks/fields'
import { ICON_OPTIONS } from '../../../../lib/catalog/options'
import { tenantImageFilter } from '../../../../lib/media/access'

/**
 * „Dla kogo pracujemy” of the Biznes home page (spec. §4 pkt 9): kinds of companies, reviews
 * and client logos. Reviews show only with „Pokaż opinie klientów”, logos only with „Pokaż
 * logo klientów” (Site settings → Biznes) — and an image needing consent never renders.
 */
export const BzReferencesBlock: Block = {
  slug: 'bzReferences',
  interfaceName: 'BzReferencesBlock',
  labels: { singular: 'Biznes: dla kogo pracujemy', plural: 'Biznes: dla kogo pracujemy' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text' },
        {
          name: 'heading',
          label: 'Nagłówek',
          type: 'text',
          required: true,
          admin: {
            description: 'Sekcja ma kotwicę #referencje — ten blok wstaw na stronie tylko raz.',
          },
        },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    {
      name: 'kinds',
      label: 'Rodzaje firm',
      type: 'array',
      maxRows: 6,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Nazwa', type: 'text', required: true, maxLength: 40 },
            { name: 'icon', label: 'Ikona', type: 'select', required: true, options: ICON_OPTIONS },
          ],
        },
        { name: 'examples', label: 'Przykłady', type: 'text', maxLength: 90 },
        { name: 'solutions', label: 'Co zwykle wdrażamy', type: 'text', maxLength: 90 },
      ],
    },
    {
      name: 'reviews',
      label: 'Opinie (widoczne po włączeniu w Ustawieniach strony)',
      type: 'array',
      maxRows: 3,
      admin: {
        description: 'Tylko prawdziwe opinie, 1:1, ze źródłem i datą. [SZEF] zgody i wybór.',
      },
      fields: [
        { name: 'quote', label: 'Opinia', type: 'textarea', required: true, maxLength: 400 },
        {
          type: 'row',
          fields: [
            { name: 'author', label: 'Autor', type: 'text', required: true, maxLength: 60 },
            { name: 'source', label: 'Źródło i data', type: 'text', maxLength: 80 },
          ],
        },
        hrefField('url', 'Link do źródła'),
      ],
    },
    {
      name: 'logos',
      label: 'Logo klientów (widoczne po włączeniu w Ustawieniach strony)',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      maxRows: 8,
      filterOptions: tenantImageFilter,
      admin: { description: 'Tylko logo z pisemną zgodą klienta (obraz bez „Wymaga zgody”).' },
    },
    {
      name: 'note',
      label: 'Notka, gdy logo są ukryte',
      type: 'text',
      maxLength: 160,
    },
  ],
}
