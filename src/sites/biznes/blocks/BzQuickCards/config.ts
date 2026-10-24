import type { Block } from 'payload'

import { isValidNavHref } from '../../../../lib/site/link'

/** Three cards with the usual matters (plansza Kontakt): awaria, nowa firma, przegląd kasy. */
export const BzQuickCardsBlock: Block = {
  slug: 'bzQuickCards',
  interfaceName: 'BzQuickCardsBlock',
  labels: { singular: 'Biznes: karty spraw', plural: 'Biznes: karty spraw' },
  fields: [
    {
      name: 'cards',
      label: 'Karty',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 3,
      fields: [
        { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 40 },
        { name: 'text', label: 'Opis', type: 'textarea', required: true, maxLength: 220 },
        {
          type: 'row',
          fields: [
            {
              name: 'linkLabel',
              label: 'Tekst linku',
              type: 'text',
              required: true,
              maxLength: 30,
            },
            {
              name: 'href',
              label: 'Link',
              type: 'text',
              required: true,
              validate: (value: unknown) =>
                typeof value === 'string' && isValidNavHref(value)
                  ? true
                  : 'Ścieżka strony (np. /kontakt#kontakt), https://, tel: albo mailto:.',
              admin: { description: 'Np. /kontakt#kontakt — formularz na tej stronie.' },
            },
          ],
        },
      ],
    },
  ],
}
