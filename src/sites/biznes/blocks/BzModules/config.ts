import type { Block } from 'payload'

import { ICON_OPTIONS } from '../../../../lib/catalog/options'
import { tenantImageFilter } from '../../../../lib/media/access'

/**
 * Module explorer of /gopos (spec. §6.5 pkt 4, plansza Gopos): modules listed on the left, the
 * chosen one on the right with its description, points and picture.
 */
export const BzModulesBlock: Block = {
  slug: 'bzModules',
  interfaceName: 'BzModulesBlock',
  labels: { singular: 'Biznes: eksplorator modułów', plural: 'Biznes: eksplorator modułów' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 60 },
        { name: 'heading', label: 'Nagłówek', type: 'text', required: true, maxLength: 120 },
      ],
    },
    {
      name: 'modules',
      label: 'Moduły',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 12,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', label: 'Nazwa', type: 'text', required: true, maxLength: 40 },
            { name: 'subtitle', label: 'Podpis', type: 'text', maxLength: 50 },
            { name: 'icon', label: 'Ikona', type: 'select', required: true, options: ICON_OPTIONS },
          ],
        },
        { name: 'description', label: 'Opis', type: 'textarea', required: true, maxLength: 300 },
        {
          name: 'points',
          label: 'Punkty',
          type: 'array',
          maxRows: 4,
          fields: [{ name: 'text', label: 'Tekst', type: 'text', required: true, maxLength: 70 }],
        },
        {
          name: 'image',
          label: 'Obraz',
          type: 'upload',
          relationTo: 'media',
          filterOptions: tenantImageFilter,
        },
      ],
    },
  ],
}
