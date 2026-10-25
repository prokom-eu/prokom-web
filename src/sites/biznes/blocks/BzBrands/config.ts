import type { Block } from 'payload'

/**
 * „Marki, które sprzedajemy, wdrażamy i serwisujemy” (plansza OFirmie): a grid of the logos of
 * Partners shown on this site, in their order — the logos and their order are managed in
 * Partnerzy, here only the texts.
 */
export const BzBrandsBlock: Block = {
  slug: 'bzBrands',
  interfaceName: 'BzBrandsBlock',
  labels: { singular: 'Biznes: siatka marek', plural: 'Biznes: siatki marek' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 60 },
        { name: 'heading', label: 'Nagłówek', type: 'text', required: true, maxLength: 120 },
      ],
    },
    {
      name: 'note',
      label: 'Notka pod logo',
      type: 'textarea',
      maxLength: 600,
      admin: {
        description:
          'Np. autoryzacje i „Logotypy należą do ich właścicieli”. Statusy partnerów tylko potwierdzone [SZEF].',
      },
    },
  ],
}
