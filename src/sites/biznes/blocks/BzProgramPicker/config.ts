import type { Block, UploadField } from 'payload'

import { linkGroup } from '../../../../blocks/fields'
import { ICON_OPTIONS } from '../../../../lib/catalog/options'
import { tenantImageFilter } from '../../../../lib/media/access'
import { tenantIdOf } from '../../../../lib/tenant/id'

const image = (name: string, label: string): UploadField => ({
  name,
  label,
  type: 'upload',
  relationTo: 'media',
  filterOptions: tenantImageFilter,
})

/**
 * „Który Subiekt dla mnie?” of /insert (spec. §6.6 pkt 2, plansza Insert; decyzja 24.10: one tile
 * = one program, no scoring): tiles of company traits, the recommended program below with its
 * points, pictures and a switch on the inquiry list. Anchor `#dobor`.
 */
export const BzProgramPickerBlock: Block = {
  slug: 'bzProgramPicker',
  interfaceName: 'BzProgramPickerBlock',
  labels: { singular: 'Biznes: dobór programu', plural: 'Biznes: dobór programu' },
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
          admin: { description: 'Sekcja ma kotwicę #dobor — blok tylko raz na stronie.' },
        },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    {
      type: 'row',
      fields: [
        {
          name: 'resultLabel',
          label: 'Etykieta rekomendacji',
          type: 'text',
          defaultValue: 'Polecamy na start',
          maxLength: 30,
        },
        {
          name: 'initial',
          label: 'Wybrany na start (numer kafla)',
          type: 'number',
          min: 1,
          max: 6,
          defaultValue: 1,
        },
      ],
    },
    linkGroup('talk', 'Drugi przycisk w rekomendacji'),
    {
      name: 'options',
      label: 'Kafle',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 6,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'trait',
              label: 'Cecha firmy (kafel)',
              type: 'text',
              required: true,
              maxLength: 40,
            },
            { name: 'icon', label: 'Ikona', type: 'select', required: true, options: ICON_OPTIONS },
          ],
        },
        { name: 'traitText', label: 'Opis kafla', type: 'text', maxLength: 90 },
        {
          type: 'row',
          fields: [
            { name: 'program', label: 'Program', type: 'text', required: true, maxLength: 40 },
            { name: 'caption', label: 'Podpis w pasku programów', type: 'text', maxLength: 50 },
          ],
        },
        {
          name: 'description',
          label: 'Opis programu',
          type: 'textarea',
          required: true,
          maxLength: 300,
        },
        {
          name: 'points',
          label: 'Punkty',
          type: 'array',
          maxRows: 4,
          fields: [{ name: 'text', label: 'Tekst', type: 'text', required: true, maxLength: 60 }],
        },
        {
          type: 'row',
          fields: [image('screenImage', 'Zrzut ekranu'), image('boxImage', 'Pudełko')],
        },
        {
          name: 'product',
          label: 'Produkt na listę zapytania',
          type: 'relationship',
          relationTo: 'products',
          filterOptions: ({ data }) => {
            const tenant = tenantIdOf(data?.tenant)
            return tenant === null ? false : { tenant: { equals: tenant } }
          },
          admin: {
            description:
              'Opublikowany produkt tej strony; pusty = bez przycisku „Dodaj do zapytania”.',
          },
        },
      ],
    },
  ],
}
