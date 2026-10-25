import type { Block } from 'payload'

import { linkGroup } from '../../../../blocks/fields'

/**
 * „Jedna firma, cztery linie” (plansza OFirmie): the PRO-KOM lines as cards with a link to each
 * site; the card of this site is outlined. Texts per card — the lines are not tenants here
 * (Tech has no site of ours yet).
 */
export const BzLinesBlock: Block = {
  slug: 'bzLines',
  interfaceName: 'BzLinesBlock',
  labels: { singular: 'Biznes: linie PRO-KOM', plural: 'Biznes: linie PRO-KOM' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 60 },
        { name: 'heading', label: 'Nagłówek', type: 'text', required: true, maxLength: 120 },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    {
      name: 'lines',
      label: 'Linie',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', label: 'Linia', type: 'text', required: true, maxLength: 30 },
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 80 },
          ],
        },
        { name: 'text', label: 'Opis', type: 'textarea', maxLength: 200 },
        linkGroup('link', 'Link do strony'),
        {
          name: 'current',
          label: 'To ta strona (karta wyróżniona)',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
}
