import type { Block } from 'payload'

import { linkGroup } from '../../../../blocks/fields'

/**
 * Hero of a Biznes subpage (spec. §6.4–6.6, plansze Dzial, Gopos, Insert): breadcrumbs, a label
 * with a dot, H1 with an optional accent part, lead, two buttons, chips and — per variant — the
 * right side. B9a: the dark „Jak to działa” card; the photo (GoPOS) and screen (InsERT) variants
 * come with their pages.
 */
export const BzPageHeroBlock: Block = {
  slug: 'bzPageHero',
  interfaceName: 'BzPageHeroBlock',
  labels: { singular: 'Biznes: nagłówek podstrony', plural: 'Biznes: nagłówki podstron' },
  fields: [
    {
      name: 'pill',
      label: 'Etykieta nad nagłówkiem',
      type: 'text',
      maxLength: 80,
      admin: {
        description:
          'Wstaw ten blok tylko raz, jako pierwszy — jego nagłówek to H1, a nad nim są okruszki.',
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'heading', label: 'Nagłówek (H1)', type: 'text', required: true, maxLength: 120 },
        {
          name: 'headingAccent',
          label: 'Druga część nagłówka w kolorze',
          type: 'text',
          maxLength: 80,
        },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 400 },
    linkGroup('primary', 'Przycisk główny', true),
    linkGroup('secondary', 'Przycisk drugi'),
    {
      name: 'chips',
      label: 'Wyróżniki pod przyciskami',
      type: 'array',
      maxRows: 6,
      fields: [{ name: 'text', label: 'Tekst', type: 'text', required: true, maxLength: 60 }],
    },
    linkGroup('parent', 'Okruszek pośredni (np. Oferta → /oferta)'),
    {
      name: 'variant',
      label: 'Prawa strona',
      type: 'select',
      required: true,
      defaultValue: 'card',
      options: [{ label: 'Karta „Jak to działa”', value: 'card' }],
    },
    {
      name: 'card',
      label: 'Karta „Jak to działa”',
      type: 'group',
      admin: { condition: (_, siblingData) => siblingData?.variant === 'card' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 40 },
            { name: 'title', label: 'Tytuł', type: 'text', maxLength: 120 },
          ],
        },
        {
          name: 'steps',
          label: 'Punkty (numerowane)',
          type: 'array',
          maxRows: 5,
          fields: [
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 60 },
            { name: 'text', label: 'Opis', type: 'textarea', required: true, maxLength: 220 },
          ],
        },
        linkGroup('button', 'Przycisk karty'),
      ],
    },
  ],
}
