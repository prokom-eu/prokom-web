import type { Block } from 'payload'

/**
 * „Najczęściej wybierane” of the Biznes home page (spec. §4 pkt 5, ZMIANY-v20 §2.3): the eight
 * products come from the catalog (`featured` + `featuredOrder`), the block holds the texts
 * (v150: no cards under the list, K35 7a).
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
  ],
}
