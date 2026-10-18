import type { CollectionConfig, Field } from 'payload'

import { restrictedRichTextEditor } from '../blocks/RichText/config'
import { adminOnly } from '../lib/auth/access'
import { ICON_OPTIONS, PRODUCT_KINDS, REGISTER_TYPES } from '../lib/catalog/options'
import {
  brandFilter,
  faqArray,
  imageField,
  includedField,
  seoGroup,
  slugField,
} from './catalogFields'

const percent = (name: string, label: string): Field => ({
  name,
  label,
  type: 'number',
  required: true,
  min: 0,
  max: 100,
  admin: { width: '50%', description: '0–100 % szerokości/wysokości zdjęcia.' },
})

const labelValue: Field[] = [
  {
    type: 'row',
    fields: [
      { name: 'label', label: 'Etykieta', type: 'text', required: true },
      { name: 'value', label: 'Wartość', type: 'text', required: true },
    ],
  },
]

/** Seed keys of `parametry_kasy` (labels: `porownanie_kas_etykiety`). Comparison is stage 2. */
const comparisonText = (name: string, label: string): Field => ({ name, label, type: 'text' })

/**
 * Products of the catalog (ADR-012 §1.1) — no prices, ever. Drafts: a product goes public
 * only once published. The public site reads published ones through the Local API.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Produkt', plural: 'Produkty' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'categories', '_status', 'updatedAt'],
    group: 'Katalog',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    slugField('products', 'posnet-ergo-online'),
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
                  name: 'kind',
                  label: 'Rodzaj',
                  type: 'select',
                  required: true,
                  defaultValue: 'device',
                  options: [...PRODUCT_KINDS],
                },
                {
                  name: 'brand',
                  label: 'Marka',
                  type: 'relationship',
                  relationTo: 'partners',
                  filterOptions: brandFilter,
                  admin: { description: 'Partnerzy widoczni na tej stronie.' },
                },
              ],
            },
            {
              name: 'categories',
              label: 'Kategorie',
              type: 'relationship',
              relationTo: 'catalog-categories',
              hasMany: true,
              required: true,
              minRows: 1,
              admin: { description: 'Pierwsza jest główna (okruszki, „Podobne”).' },
            },
            {
              name: 'industries',
              label: 'Branże',
              type: 'relationship',
              relationTo: 'industries',
              hasMany: true,
              admin: { description: 'Produkt pokazuje się tylko w tych branżach.' },
            },
            {
              name: 'benefit',
              label: 'Korzyść',
              type: 'text',
              maxLength: 160,
              admin: { description: 'Jedno zdanie na karcie produktu.' },
            },
            { name: 'features', label: 'Cechy', type: 'text', hasMany: true, maxRows: 3 },
            {
              name: 'badge',
              label: 'Odznaka',
              type: 'text',
              maxLength: 40,
              admin: { description: 'Krótki tekst na karcie, np. „Nowość 2026”. Bez cen.' },
            },
            {
              name: 'keywords',
              label: 'Słowa kluczowe',
              type: 'textarea',
              admin: { description: 'Dla wyszukiwarki, niewidoczne na stronie.' },
            },
            imageField('images', 'Zdjęcia', true),
          ],
        },
        {
          label: 'Strona produktu',
          fields: [
            {
              name: 'keyParams',
              label: 'Kluczowe parametry',
              type: 'array',
              maxRows: 4,
              fields: labelValue,
            },
            {
              name: 'specs',
              label: 'Specyfikacja',
              type: 'array',
              fields: [{ name: 'group', label: 'Grupa', type: 'text' }, ...labelValue],
            },
            {
              name: 'description',
              label: 'Opis',
              type: 'richText',
              editor: restrictedRichTextEditor,
            },
            {
              name: 'hotspots',
              label: 'Punkty na zdjęciu',
              type: 'array',
              fields: [
                { type: 'row', fields: [percent('x', 'X (%)'), percent('y', 'Y (%)')] },
                { name: 'title', label: 'Tytuł', type: 'text', required: true },
                { name: 'description', label: 'Opis', type: 'textarea' },
              ],
            },
            {
              name: 'modules',
              label: 'Moduły',
              type: 'array',
              fields: [
                { name: 'name', label: 'Nazwa', type: 'text', required: true },
                { name: 'description', label: 'Opis', type: 'textarea' },
                { name: 'icon', label: 'Ikona', type: 'select', options: ICON_OPTIONS },
              ],
            },
            includedField('Puste = „W cenie” z kategorii głównej.'),
            faqArray,
            {
              name: 'fitsWith',
              label: 'Skompletuj stanowisko',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
            },
            {
              name: 'alternatives',
              label: 'Kiedy wybrać inną',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
            },
          ],
        },
        {
          label: 'Kasy fiskalne',
          description: 'Tylko dla kas: dobór na stronie kategorii i porównywarka (etap 2).',
          fields: [
            {
              name: 'registerTypes',
              label: 'Typ kasy',
              type: 'select',
              hasMany: true,
              options: [...REGISTER_TYPES],
            },
            {
              name: 'comparison',
              label: 'Porównanie',
              type: 'group',
              fields: [
                comparisonText('type', 'Typ'),
                comparisonText('display', 'Wyświetlacz'),
                comparisonText('keyboard', 'Klawiatura'),
                comparisonText('plu', 'Baza towarów (PLU)'),
                comparisonText('printer', 'Drukarka'),
                comparisonText('connectivity', 'Łączność'),
                comparisonText('weight', 'Waga'),
                comparisonText('audience', 'Dla kogo'),
              ],
            },
          ],
        },
        { label: 'SEO', fields: [seoGroup] },
      ],
    },
    {
      name: 'isNew',
      label: 'Nowość',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'authorized',
      label: 'Autoryzacja',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Etykieta zależy od statusu marki (serwis / partner) i rodzaju.',
      },
    },
    {
      name: 'popularity',
      label: 'Popularność',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 50,
      admin: { position: 'sidebar', description: '0–100: kolejność „Popularne” i wyszukiwarka.' },
    },
    {
      name: 'featured',
      label: 'Wyróżniony na stronie głównej',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'featuredOrder',
      label: 'Kolejność wyróżnienia',
      type: 'number',
      admin: { position: 'sidebar', condition: (data) => Boolean(data?.featured) },
    },
    {
      // Short id of the seed package (`ergo`), so the B2 import is idempotent.
      name: 'legacyId',
      label: 'Id z importu',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
