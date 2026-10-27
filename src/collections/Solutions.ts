import type { CollectionConfig, Field } from 'payload'

import { adminOnly } from '../lib/auth/access'
import {
  CARD_GRADIENTS,
  INDUSTRY_GROUPS,
  SITUATIONS,
  SOLUTION_CATEGORIES,
  SOLUTION_SIZES,
  type SolutionSize,
} from '../lib/software/options'
import { solutionsRevalidationHooks } from '../lib/software/revalidate'
import { onlyLineTenant } from '../lib/tenant/onlyLine'
import { slugField } from './catalogFields'

const features = (description?: string): Field => ({
  name: 'features',
  label: 'Cechy',
  type: 'text',
  hasMany: true,
  maxRows: 3,
  ...(description && { admin: { description } }),
})

const SIZE_LABELS: Record<SolutionSize, string> = {
  start: 'Na start',
  std: 'Standard',
  full: 'Pełna',
}

const sizeRow = (type: 'number' | 'text'): Field => ({
  type: 'row',
  fields: SOLUTION_SIZES.map((name): Field =>
    type === 'number'
      ? { name, label: SIZE_LABELS[name], type: 'number', min: 0, admin: { width: '33%' } }
      : {
          name,
          label: SIZE_LABELS[name],
          type: 'text',
          maxLength: 40,
          admin: { width: '33%' },
        },
  ),
})

/**
 * Solutions of the Software catalog (ADR-014 §1.1). Prices and terms are numbers from the panel,
 * one per wizard size; the „od” price and the term are computed (`lib/software/price`, ADR-014
 * rozstrz. SW0 5). Drafts: a solution goes public only once published. The full solution page
 * (`page`) comes with SW10.
 */
export const Solutions: CollectionConfig = {
  slug: 'solutions',
  labels: { singular: 'Rozwiązanie', plural: 'Rozwiązania' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', '_status', 'updatedAt'],
    group: 'Software',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    beforeValidate: [onlyLineTenant('software', 'Rozwiązania mają tylko strony linii Software.')],
    // The public solutions index (`/api/solutions-index`) follows a published change at once.
    ...solutionsRevalidationHooks,
  },
  indexes: [
    { fields: ['tenant', 'slug'], unique: true },
    // Postgres lets many rows have no id, so solutions added in the panel do not collide.
    { fields: ['tenant', 'legacyId'], unique: true },
  ],
  fields: [
    slugField('solutions', 'strona-firmowa-z-panelem'),
    {
      // Id from the design package: `pnpm seed:software` finds the solution by it (SW3).
      name: 'legacyId',
      label: 'Id z importu',
      type: 'number',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Karta',
          fields: [
            { name: 'name', label: 'Nazwa', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  label: 'Kategoria',
                  type: 'select',
                  required: true,
                  options: [...SOLUTION_CATEGORIES],
                  admin: { description: 'Filtr katalogu i zakładka cennika.' },
                },
                {
                  name: 'label',
                  label: 'Rodzaj',
                  type: 'text',
                  maxLength: 30,
                  admin: { description: 'Np. „Strona”, „System”.' },
                },
                {
                  name: 'tag',
                  label: 'Plakietka',
                  type: 'text',
                  maxLength: 30,
                  admin: { description: 'Np. „PANEL TREŚCI”.' },
                },
              ],
            },
            { name: 'lead', label: 'Opis na karcie', type: 'textarea', maxLength: 240 },
            features('Trzy krótkie cechy na karcie. {termin} = termin tego rozwiązania.'),
            { name: 'forWhom', label: 'Dla kogo', type: 'text', maxLength: 160 },
            {
              type: 'row',
              fields: [
                {
                  name: 'situations',
                  label: 'Sytuacje klienta',
                  type: 'select',
                  hasMany: true,
                  options: [...SITUATIONS],
                },
                {
                  name: 'industryGroups',
                  label: 'Grupy branż',
                  type: 'select',
                  hasMany: true,
                  options: [...INDUSTRY_GROUPS],
                },
              ],
            },
            {
              name: 'keywords',
              label: 'Słowa dla wyszukiwarki',
              type: 'text',
              admin: { description: 'Po spacji; polskie znaki niepotrzebne.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'hasLivePreview',
                  label: 'Ma podgląd na żywo',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'toast',
                  label: 'Powiadomienie w podglądzie',
                  type: 'text',
                  maxLength: 80,
                  admin: { description: 'Np. „Nowe zapytanie z formularza”.' },
                },
                {
                  name: 'cardGradient',
                  label: 'Tło miniatury karty',
                  type: 'select',
                  options: [...CARD_GRADIENTS],
                  admin: { description: 'Puste = karta bez miniatury.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Ceny i terminy',
          description:
            'Kwoty netto w zł, jedna na rozmiar z kreatora. Na stronie „od” = najniższa podana. Pusta cena = „Zapytaj o wycenę”, pusty termin = „po krótkiej rozmowie”. 0 to cena (np. bezpłatny audyt).',
          fields: [
            {
              name: 'prices',
              label: 'Ceny (zł netto)',
              type: 'group',
              fields: [sizeRow('number')],
            },
            {
              name: 'priceMonthly',
              label: 'Cena miesięczna',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Np. opieka: ceny to kwoty za miesiąc — na karcie „od 149 zł / mies.” (wzór z Ustawień Software → Kreator).',
              },
            },
            {
              name: 'sizeNames',
              label: 'Nazwy wersji',
              type: 'group',
              admin: {
                description:
                  'Puste = „Na start”, „Standard”, „Pełna”. Np. opieka: „Podstawowa”, „Standard”, „Systemy”.',
              },
              fields: [sizeRow('text')],
            },
            {
              name: 'leadTimes',
              label: 'Terminy',
              type: 'group',
              admin: { description: 'Np. „2 tygodnie”, „4–5 tygodni”.' },
              fields: [sizeRow('text')],
            },
            {
              name: 'priceNote',
              label: 'Zakres przy cenie',
              type: 'textarea',
              maxLength: 240,
              admin: {
                description:
                  'Linia pod ceną, np. „Na start = jeden moduł na gotowym fundamencie, do 5 użytkowników”.',
              },
            },
          ],
        },
        {
          label: '12 rzeczy',
          description:
            'Karta w sekcji „12 rzeczy” na stronie głównej. Puste pola = te z karty katalogu. Kolejność kart ustala się w Ustawieniach Software.',
          fields: [
            {
              name: 'featured',
              label: 'Karta na stronie głównej',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', label: 'Nazwa', type: 'text', maxLength: 60 },
                    { name: 'tag', label: 'Plakietka', type: 'text', maxLength: 30 },
                  ],
                },
                { name: 'lead', label: 'Opis', type: 'textarea', maxLength: 240 },
                features(),
              ],
            },
          ],
        },
      ],
    },
  ],
}
