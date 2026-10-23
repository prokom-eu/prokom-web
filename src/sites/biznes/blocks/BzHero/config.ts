import type { Block } from 'payload'

import { linkGroup } from '../../../../blocks/fields'
import { ICON_OPTIONS } from '../../../../lib/catalog/options'

/**
 * Hero of the Biznes home page (spec. §4 pkt 1, v20). The department wheel comes from the
 * catalog (groups, counts, pictures); the phone, the callback promise and the trust line from
 * the site settings, so they are typed in once.
 */
export const BzHeroBlock: Block = {
  slug: 'bzHero',
  interfaceName: 'BzHeroBlock',
  labels: { singular: 'Biznes: hero z kołem działów', plural: 'Biznes: hero z kołem działów' },
  fields: [
    { name: 'pill', label: 'Pigułka nad nagłówkiem', type: 'text' },
    {
      type: 'row',
      fields: [
        { name: 'heading', label: 'Nagłówek H1', type: 'text', required: true },
        {
          name: 'headingAccent',
          label: 'Druga część H1 (w kolorze akcentu)',
          type: 'text',
        },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    linkGroup('cta', 'Przycisk główny', true),
    {
      name: 'showPhone',
      label: 'Przycisk z telefonem linii',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Numer z Ustawień strony.' },
    },
    {
      name: 'trustItems',
      label: 'Punkty zaufania',
      type: 'array',
      maxRows: 4,
      admin: {
        description:
          'Pierwszy punkt to zawsze „Linia zaufania” z Ustawień strony (Biznes), gdy jest wpisana.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'icon', label: 'Ikona', type: 'select', required: true, options: ICON_OPTIONS },
            { name: 'text', label: 'Tekst', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'wheelHint', label: 'Podpowiedź pod kołem', type: 'text' },
        {
          name: 'planLinkLabel',
          label: 'Link do planu firmy (#plan)',
          type: 'text',
          admin: { description: 'Prowadzi do sekcji „Plan Twojej firmy” na tej stronie.' },
        },
      ],
    },
  ],
}
