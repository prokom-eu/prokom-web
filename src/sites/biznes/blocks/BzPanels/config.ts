import type { Block } from 'payload'

import { linkGroup } from '../../../../blocks/fields'

/** Two panels side by side (plansza Gopos: switching from another system, GoPOS + NFHotel). */
export const BzPanelsBlock: Block = {
  slug: 'bzPanels',
  interfaceName: 'BzPanelsBlock',
  labels: { singular: 'Biznes: dwa panele', plural: 'Biznes: dwa panele' },
  fields: [
    {
      name: 'panels',
      label: 'Panele',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 2,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 50 },
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 60 },
            {
              name: 'style',
              label: 'Wygląd',
              type: 'select',
              required: true,
              defaultValue: 'light',
              options: [
                { label: 'Jasny', value: 'light' },
                { label: 'Ciemny', value: 'dark' },
              ],
            },
          ],
        },
        { name: 'text', label: 'Tekst', type: 'textarea', required: true, maxLength: 300 },
        linkGroup('primary', 'Link główny'),
        linkGroup('secondary', 'Link drugi'),
      ],
    },
  ],
}
