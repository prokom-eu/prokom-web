import type { Block } from 'payload'

import { tenantImageFilter } from '../../../../lib/media/access'
import { tenantIdOf } from '../../../../lib/tenant/id'

/**
 * Kits of /gopos (spec. §6.5 pkt 6, plansza Gopos): three typical venues, no prices; „Dodaj
 * zestaw do zapytania” puts all the kit's products on the inquiry list. Anchor `#zestawy`.
 */
export const BzKitsBlock: Block = {
  slug: 'bzKits',
  interfaceName: 'BzKitsBlock',
  labels: { singular: 'Biznes: zestawy', plural: 'Biznes: zestawy' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 60 },
        {
          name: 'heading',
          label: 'Nagłówek',
          type: 'text',
          required: true,
          maxLength: 120,
          admin: { description: 'Sekcja ma kotwicę #zestawy — blok tylko raz na stronie.' },
        },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    {
      name: 'kits',
      label: 'Zestawy',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 3,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', label: 'Nazwa', type: 'text', required: true, maxLength: 40 },
            {
              name: 'tag',
              label: 'Wyróżnienie',
              type: 'text',
              maxLength: 24,
              admin: { description: 'Np. „Polecany na start” — zestaw z ramką.' },
            },
          ],
        },
        { name: 'description', label: 'Opis', type: 'text', required: true, maxLength: 100 },
        {
          name: 'images',
          label: 'Obrazy (do 3)',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          maxRows: 3,
          filterOptions: tenantImageFilter,
        },
        {
          name: 'products',
          label: 'Produkty zestawu',
          type: 'relationship',
          relationTo: 'products',
          hasMany: true,
          required: true,
          minRows: 1,
          maxRows: 12,
          filterOptions: ({ data }) => {
            const tenant = tenantIdOf(data?.tenant)
            return tenant === null ? false : { tenant: { equals: tenant } }
          },
          admin: {
            description:
              'Pokazywane są tylko opublikowane produkty tej strony; przycisk dodaje je wszystkie do zapytania.',
          },
        },
      ],
    },
  ],
}
