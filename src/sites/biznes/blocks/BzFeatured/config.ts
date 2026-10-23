import type { Block, Field } from 'payload'

import { linkGroup } from '../../../../blocks/fields'

const cardTexts = (): Field[] => [
  { name: 'eyebrow', label: 'Etykieta', type: 'text' },
  { name: 'heading', label: 'Nagłówek', type: 'text', required: true },
  { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 220 },
  linkGroup('button', 'Przycisk', true),
]

/**
 * „Najczęściej wybierane” of the Biznes home page (spec. §4 pkt 5, ZMIANY-v20 §2.3): the eight
 * products come from the catalog (`featured` + `featuredOrder`), the block holds the texts and
 * the two call-to-action cards under them.
 */
export const BzFeaturedBlock: Block = {
  slug: 'bzFeatured',
  interfaceName: 'BzFeaturedBlock',
  labels: { singular: 'Biznes: najczęściej wybierane', plural: 'Biznes: najczęściej wybierane' },
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
            description: 'Sekcja ma kotwicę #wybierane — ten blok wstaw na stronie tylko raz.',
          },
        },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    {
      name: 'catalogLabel',
      label: 'Przycisk do katalogu',
      type: 'text',
      admin: {
        description: 'Np. „Cały katalog” — liczba pozycji dochodzi sama. Pusty = bez przycisku.',
      },
    },
    {
      name: 'offerCard',
      label: 'Karta „Cała oferta”',
      type: 'group',
      admin: { description: 'Miniatury mozaiki biorą się z działów katalogu.' },
      fields: cardTexts(),
    },
    {
      name: 'wizardCard',
      label: 'Karta kreatora',
      type: 'group',
      fields: [
        ...cardTexts(),
        {
          name: 'steps',
          label: 'Podgląd kroków',
          type: 'array',
          maxRows: 4,
          admin: { description: 'Trzeci krok jest wyróżniony („w trakcie”).' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', label: 'Krok', type: 'text', required: true, maxLength: 24 },
                { name: 'value', label: 'Przykład', type: 'text', required: true, maxLength: 40 },
              ],
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'summaryLabel', label: 'Podpis zestawu', type: 'text', maxLength: 30 },
            { name: 'summary', label: 'Przykładowy zestaw', type: 'text', maxLength: 90 },
          ],
        },
      ],
    },
  ],
}
