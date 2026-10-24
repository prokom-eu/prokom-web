import type { Block } from 'payload'

import { linkGroup } from '../../../../blocks/fields'
import { ICON_OPTIONS } from '../../../../lib/catalog/options'

/**
 * Section of cards on the Biznes subpages (plansze Dzial, Gopos, Insert): what you get, related
 * services, why us. A card has an optional icon and link; three or four in a row.
 */
export const BzCardsBlock: Block = {
  slug: 'bzCards',
  interfaceName: 'BzCardsBlock',
  labels: { singular: 'Biznes: karty', plural: 'Biznes: karty' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 60 },
        { name: 'heading', label: 'Nagłówek', type: 'text', required: true, maxLength: 140 },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    {
      type: 'row',
      fields: [
        {
          name: 'surface',
          label: 'Tło sekcji',
          type: 'select',
          required: true,
          defaultValue: 'default',
          options: [
            { label: 'Białe', value: 'default' },
            { label: 'Szare', value: 'muted' },
          ],
        },
        {
          name: 'columns',
          label: 'Kart w rzędzie (komputer)',
          type: 'select',
          required: true,
          defaultValue: '3',
          options: [
            { label: '3', value: '3' },
            { label: '4', value: '4' },
          ],
        },
        {
          name: 'tone',
          label: 'Kolor akcentu',
          type: 'select',
          required: true,
          defaultValue: 'accent',
          options: [
            { label: 'Niebieski (Biznes)', value: 'accent' },
            { label: 'Zielony (GoPOS)', value: 'green' },
          ],
          admin: { description: 'Etykieta nad nagłówkiem i ikony kart.' },
        },
      ],
    },
    {
      name: 'cards',
      label: 'Karty',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 12,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 60 },
            {
              name: 'icon',
              label: 'Ikona',
              type: 'select',
              options: ICON_OPTIONS,
              admin: { description: 'Pusta = karta bez ikony.' },
            },
          ],
        },
        { name: 'text', label: 'Opis', type: 'textarea', required: true, maxLength: 300 },
        linkGroup('link', 'Link pod opisem'),
      ],
    },
  ],
}
