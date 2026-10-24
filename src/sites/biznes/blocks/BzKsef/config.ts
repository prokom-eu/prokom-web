import type { Block } from 'payload'

import { linkGroup } from '../../../../blocks/fields'

/**
 * KSeF with a day counter (spec. §6.6 pkt 4, plansza Insert), `#ksef`: the number of days to a
 * date (counted in the browser), what it means and the things to prepare. Legal facts only with a
 * source (plan §4).
 */
export const BzKsefBlock: Block = {
  slug: 'bzKsef',
  interfaceName: 'BzKsefBlock',
  labels: { singular: 'Biznes: licznik KSeF', plural: 'Biznes: licznik KSeF' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          label: 'Etykieta',
          type: 'text',
          maxLength: 60,
          admin: { description: 'Sekcja ma kotwicę #ksef — blok tylko raz na stronie.' },
        },
        {
          name: 'date',
          label: 'Licznik dni do daty',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' } },
        },
        {
          name: 'dateLabel',
          label: 'Podpis pod liczbą',
          type: 'text',
          required: true,
          maxLength: 40,
          admin: { description: 'Np. „dni do 1 stycznia 2027”.' },
        },
      ],
    },
    { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 400 },
    linkGroup('link', 'Przycisk'),
    {
      name: 'checklist',
      label: 'Do przygotowania',
      type: 'array',
      maxRows: 8,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 40 },
            { name: 'text', label: 'Podpis', type: 'text', maxLength: 60 },
          ],
        },
      ],
    },
  ],
}
