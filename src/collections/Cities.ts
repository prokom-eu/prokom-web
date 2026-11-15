import type { CollectionConfig, Field } from 'payload'

import { linkGroup } from '../blocks/fields'
import { adminOnly } from '../lib/auth/access'
import { onlyLineTenant } from '../lib/tenant/onlyLine'
import { faqArray, seoGroup, slugField } from './catalogFields'

/** Just the part of a city document the `active` check reads. */
type CityHeroData = { hero?: { title?: string | null; lead?: string | null } | null }

const sectionTitle: Field = { name: 'title', label: 'Nagłówek', type: 'text', maxLength: 90 }

const titleText = (titleMax: number, textMax: number): Field[] => [
  { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: titleMax },
  { name: 'text', label: 'Tekst', type: 'textarea', maxLength: textMax },
]

const buttons = (name: string, label: string): Field => ({
  name,
  label,
  type: 'array',
  maxRows: 2,
  fields: [linkGroup('link', 'Przycisk', true)],
})

/**
 * City pages of the Software line (ADR-014 §1.5, spec. §6.9). Only a city with its own unique
 * text is active: inactive = 404 and no sitemap entry.
 */
export const Cities: CollectionConfig = {
  slug: 'cities',
  labels: { singular: 'Miejscowość', plural: 'Miejscowości' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'active'],
    group: 'Software',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  hooks: {
    beforeValidate: [onlyLineTenant('software', 'Miejscowości mają tylko strony linii Software.')],
  },
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', label: 'Nazwa', type: 'text', required: true },
        {
          name: 'locative',
          label: 'Odmiana „z …”',
          type: 'text',
          admin: { description: 'Np. „z Rabki-Zdroju”.' },
        },
      ],
    },
    slugField('cities', 'rabka-zdroj'),
    {
      name: 'active',
      label: 'Aktywna',
      type: 'checkbox',
      defaultValue: false,
      // ADR-014 §1.5: no page without its own text — at least the heading and the lead.
      validate: (value: unknown, { data }: { data: CityHeroData }) =>
        !value || (data.hero?.title?.trim() && data.hero?.lead?.trim())
          ? true
          : 'Najpierw uzupełnij tytuł i wstęp nagłówka strony.',
      admin: {
        position: 'sidebar',
        description: 'Tylko z własną, unikalną treścią. Nieaktywna = brak strony i wpisu w mapie.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nagłówek',
          fields: [
            {
              name: 'hero',
              label: 'Nagłówek strony',
              type: 'group',
              fields: [
                { name: 'eyebrow', label: 'Nadtytuł', type: 'text', maxLength: 80 },
                {
                  type: 'row',
                  fields: [
                    { name: 'title', label: 'Tytuł (H1)', type: 'text', maxLength: 80 },
                    {
                      name: 'titleAccent',
                      label: 'Wyróżnione zakończenie',
                      type: 'text',
                      maxLength: 60,
                    },
                  ],
                },
                { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 400 },
                buttons('ctas', 'Przyciski'),
                {
                  name: 'badges',
                  label: 'Plakietki przy zdjęciu',
                  type: 'array',
                  maxRows: 2,
                  fields: [{ type: 'row', fields: titleText(40, 80) }],
                },
              ],
            },
          ],
        },
        {
          label: 'Treść',
          fields: [
            {
              name: 'who',
              label: 'Dla kogo',
              type: 'group',
              fields: [
                sectionTitle,
                { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
                {
                  name: 'items',
                  label: 'Branże lokalne',
                  type: 'array',
                  maxRows: 6,
                  fields: [
                    { name: 'name', label: 'Nazwa', type: 'text', required: true, maxLength: 60 },
                    { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 240 },
                    {
                      type: 'row',
                      fields: [
                        { name: 'cta', label: 'Tekst linku', type: 'text', maxLength: 40 },
                        {
                          name: 'solution',
                          label: 'Rozwiązanie',
                          type: 'relationship',
                          relationTo: 'solutions',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'local',
              label: 'Dlaczego lokalnie',
              type: 'group',
              fields: [
                sectionTitle,
                {
                  name: 'items',
                  label: 'Powody',
                  type: 'array',
                  maxRows: 6,
                  fields: titleText(60, 240),
                },
              ],
            },
            faqArray,
            {
              name: 'nearby',
              label: 'Okolica',
              type: 'text',
              hasMany: true,
              admin: { description: 'Miejscowości w okolicy (sam tekst).' },
            },
            {
              name: 'cta',
              label: 'Wezwanie na końcu',
              type: 'group',
              fields: [
                { name: 'title', label: 'Tytuł', type: 'text', maxLength: 80 },
                { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 300 },
                buttons('buttons', 'Przyciski'),
              ],
            },
          ],
        },
        { label: 'SEO', fields: [seoGroup] },
      ],
    },
  ],
}
