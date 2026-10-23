import type { Block } from 'payload'

import { hrefField } from '../../../../blocks/fields'
import { ICON_OPTIONS } from '../../../../lib/catalog/options'

export const NEED_TONES = [
  { label: 'Zielony', value: 'green' },
  { label: 'Czerwony', value: 'red' },
  { label: 'Niebieski', value: 'blue' },
  { label: 'Fioletowy', value: 'violet' },
] as const

/** Four "what do you need" tiles under the hero (spec. §4 pkt 2). */
export const BzNeedsBlock: Block = {
  slug: 'bzNeeds',
  interfaceName: 'BzNeedsBlock',
  labels: { singular: 'Biznes: kafelki potrzeb', plural: 'Biznes: kafelki potrzeb' },
  fields: [
    {
      name: 'items',
      label: 'Kafelki',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Tytuł', type: 'text', required: true },
            { name: 'icon', label: 'Ikona', type: 'select', required: true, options: ICON_OPTIONS },
            {
              name: 'tone',
              label: 'Kolor',
              type: 'select',
              required: true,
              defaultValue: 'blue',
              options: [...NEED_TONES],
            },
          ],
        },
        { name: 'text', label: 'Opis', type: 'textarea', required: true, maxLength: 160 },
        hrefField('href', 'Link kafelka', true),
        {
          type: 'row',
          fields: [
            {
              name: 'tag',
              label: 'Znacznik w rogu',
              type: 'text',
              maxLength: 24,
              admin: { description: 'Np. „0 zł przegląd”. Pusty = strzałka.' },
            },
            {
              name: 'countdownTo',
              label: 'Licznik dni do daty',
              type: 'date',
              admin: {
                date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
                description:
                  'Do tego dnia zamiast znacznika jest „N dni” (liczone w przeglądarce); potem wraca znacznik albo strzałka.',
              },
            },
          ],
        },
        {
          name: 'badges',
          label: 'Plakietki',
          type: 'array',
          maxRows: 2,
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'value', label: 'Wyróżnik', type: 'text', required: true, maxLength: 12 },
                { name: 'text', label: 'Tekst', type: 'text', required: true, maxLength: 40 },
                {
                  name: 'tone',
                  label: 'Kolor',
                  type: 'select',
                  required: true,
                  defaultValue: 'accent',
                  options: [
                    { label: 'Pomarańczowy (promocja)', value: 'promo' },
                    { label: 'Niebieski', value: 'accent' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
