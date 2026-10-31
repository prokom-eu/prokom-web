import type { Block } from 'payload'

import { linkGroup } from '../../../../blocks/fields'
import { FACTS_NOTE, iconField, photoFields, textField } from '../fields'

const when = (visual: string) => ({
  condition: (_: unknown, sibling: { visual?: unknown } | undefined) => sibling?.visual === visual,
})

/**
 * Hero of a Software subpage (SW11b; boards `ONas`, `Wszystko`): eyebrow, H1 with the accent
 * part, lead, two buttons and one picture — a collage of up to 3 photos with a badge, or the
 * lines around „Twoja firma”. Carries the page's H1 when it comes first.
 */
export const SwPageHeroBlock: Block = {
  slug: 'swPageHero',
  interfaceName: 'SwPageHeroBlock',
  labels: { singular: 'Software: nagłówek podstrony', plural: 'Software: nagłówki podstron' },
  fields: [
    textField('eyebrow', 'Etykieta', 60),
    {
      type: 'row',
      fields: [
        textField('title', 'Tytuł (H1)', 120, true),
        textField('titleAccent', 'Druga część tytułu (w kolorze)', 80),
      ],
    },
    {
      name: 'lead',
      label: 'Wstęp',
      type: 'textarea',
      maxLength: 400,
      admin: { description: FACTS_NOTE },
    },
    linkGroup('primary', 'Przycisk główny'),
    linkGroup('secondary', 'Przycisk drugi'),
    {
      name: 'visual',
      label: 'Grafika',
      type: 'select',
      required: true,
      defaultValue: 'none',
      options: [
        { label: 'Bez grafiki', value: 'none' },
        { label: 'Kolaż zdjęć', value: 'photos' },
        { label: 'Linie wokół „Twoja firma”', value: 'lines' },
      ],
    },
    {
      name: 'photos',
      label: 'Zdjęcia (pierwsze duże)',
      type: 'array',
      maxRows: 3,
      admin: when('photos'),
      fields: photoFields,
    },
    {
      name: 'badge',
      label: 'Plakietka na kolażu',
      type: 'group',
      admin: when('photos'),
      fields: [
        {
          type: 'row',
          fields: [
            textField('status', 'Status (zielona kropka)', 40),
            textField('title', 'Tytuł', 60),
          ],
        },
        textField('text', 'Opis', 80),
      ],
    },
    {
      name: 'hub',
      label: 'Środek schematu',
      type: 'group',
      admin: when('lines'),
      fields: [
        { type: 'row', fields: [textField('title', 'Tytuł', 40), textField('text', 'Opis', 40)] },
      ],
    },
    {
      name: 'nodes',
      label: 'Linie na schemacie',
      type: 'array',
      maxRows: 4,
      admin: when('lines'),
      fields: [
        { type: 'row', fields: [textField('name', 'Nazwa', 30, true), iconField()] },
        textField('text', 'Opis', 60),
        {
          name: 'current',
          label: 'To ta strona (wyróżniona)',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
}
