import type { Block } from 'payload'

import { linkGroup } from '../../../../blocks/fields'
import { ICON_OPTIONS } from '../../../../lib/catalog/options'
import { tenantImageFilter } from '../../../../lib/media/access'
import { tenantIdOf } from '../../../../lib/tenant/id'

/**
 * Hero of a Biznes subpage (spec. §6.4–6.6, plansze Dzial, Gopos, Insert): breadcrumbs, a label
 * with a dot, H1 with an optional accent part, lead, two buttons, chips and — per variant — the
 * right side: the dark „Jak to działa” card (B9a, Opieka IT) or a photo behind a navy hero with the
 * partner's logo and status and sourced figures (B9b, GoPOS), or a program screen in a laptop frame
 * with its box and two floating notes (B9c, InsERT).
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
      options: [
        { label: 'Karta „Jak to działa”', value: 'card' },
        { label: 'Zdjęcie w tle i liczby (ciemny)', value: 'photo' },
        { label: 'Zrzut programu i pudełko', value: 'screen' },
      ],
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
    {
      name: 'photo',
      label: 'Zdjęcie i liczby',
      type: 'group',
      admin: { condition: (_, siblingData) => siblingData?.variant === 'photo' },
      fields: [
        {
          name: 'image',
          label: 'Zdjęcie w tle',
          type: 'upload',
          relationTo: 'media',
          filterOptions: tenantImageFilter,
        },
        {
          name: 'partner',
          label: 'Partner (logo i status)',
          type: 'relationship',
          relationTo: 'partners',
          // Only partners shown on this site; the page is checked again when rendered.
          filterOptions: ({ data }) => {
            const tenant = tenantIdOf(data?.tenant)
            return tenant === null ? false : { tenants: { in: [tenant] } }
          },
          admin: {
            description:
              'Logo partnera, a obok status z kolekcji Partnerzy ([SZEF]); bez statusu — bez plakietki.',
          },
        },
        {
          name: 'stats',
          label: 'Liczby',
          type: 'array',
          maxRows: 4,
          admin: {
            description:
              'Każda liczba partnera tylko ze źródłem (plan Biznesu §4); bez źródła jej nie wpisuj.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'value', label: 'Liczba', type: 'text', required: true, maxLength: 12 },
                { name: 'label', label: 'Opis', type: 'text', required: true, maxLength: 60 },
              ],
            },
            {
              name: 'source',
              label: 'Źródło (link albo opis, nie jest wyświetlane)',
              type: 'text',
              required: true,
              maxLength: 300,
            },
          ],
        },
      ],
    },
    {
      name: 'screen',
      label: 'Zrzut programu',
      type: 'group',
      admin: { condition: (_, siblingData) => siblingData?.variant === 'screen' },
      fields: [
        {
          name: 'partner',
          label: 'Partner (logo i status)',
          type: 'relationship',
          relationTo: 'partners',
          // Only partners shown on this site; the page is checked again when rendered.
          filterOptions: ({ data }) => {
            const tenant = tenantIdOf(data?.tenant)
            return tenant === null ? false : { tenants: { in: [tenant] } }
          },
          admin: {
            description:
              'Logo partnera, a obok status z kolekcji Partnerzy ([SZEF]); bez statusu — bez plakietki.',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'screenImage',
              label: 'Zrzut ekranu (tylko z materiałów producenta)',
              type: 'upload',
              relationTo: 'media',
              filterOptions: tenantImageFilter,
            },
            {
              name: 'boxImage',
              label: 'Pudełko programu',
              type: 'upload',
              relationTo: 'media',
              filterOptions: tenantImageFilter,
            },
          ],
        },
        {
          name: 'notes',
          label: 'Pływające notki',
          type: 'array',
          maxRows: 2,
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 30 },
                { name: 'text', label: 'Podpis', type: 'text', maxLength: 40 },
                {
                  name: 'icon',
                  label: 'Ikona',
                  type: 'select',
                  required: true,
                  options: ICON_OPTIONS,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
