import type { Block } from 'payload'

import { hrefField } from '../../../../blocks/fields'
import { tenantImageFilter } from '../../../../lib/media/access'

/**
 * „Opinie” of the Biznes home page (board v150 `#s4-opinie`, ADR-017 D-K4-6): reviews and client
 * logos. The section shows only with „Pokaż opinie klientów”, logos only with „Pokaż logo
 * klientów” (Site settings → Biznes) — and an image needing consent never renders.
 */
export const BzReferencesBlock: Block = {
  slug: 'bzReferences',
  interfaceName: 'BzReferencesBlock',
  labels: { singular: 'Biznes: opinie', plural: 'Biznes: opinie' },
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
            description: 'Sekcja ma kotwicę #opinie — ten blok wstaw na stronie tylko raz.',
          },
        },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
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
  ],
}
