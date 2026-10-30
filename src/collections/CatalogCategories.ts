import type { CollectionConfig, Field } from 'payload'

import { linkGroup } from '../blocks/fields'
import { adminOnly } from '../lib/auth/access'
import { catalogRevalidationHooks } from '../lib/catalog/revalidate'
import { HELP_ACTIONS, ICON_OPTIONS } from '../lib/catalog/options'
import { validateSubcategories, type SubcategoryRow } from '../lib/catalog/subcategories'
import { isHttpsUrl } from '../lib/site/link'
import { isValidSlug } from '../lib/tenant/uniqueSlug'
import {
  faqArray,
  imageField,
  includedField,
  orderField,
  sectionHeading,
  seoGroup,
  slugField,
} from './catalogFields'

// K4 (D-K4-2): "Do czego" chips and the "Nie wiesz, co wybrać?" card, on a category and on
// each subcategory (`slowniki-k4.json` → `do_czego`, `dobor`).
// TODO(krystian): K4d shows `useCases`, `help.button` / `help.action` and the subcategory
// rows on the page — until then the page reads only `help.title` / `help.text` of a category.
const useCasesField: Field = {
  name: 'useCases',
  label: 'Do czego (filtr)',
  type: 'text',
  hasMany: true,
  admin: { description: 'Chipy filtra „Do czego”. Jeszcze niewidoczne na stronie.' },
}

function helpGroup(description: string): Field {
  return {
    name: 'help',
    label: 'Karta „Nie wiesz, co wybrać?”',
    type: 'group',
    admin: { description },
    fields: [
      { name: 'title', label: 'Tytuł', type: 'text', maxLength: 90 },
      { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 200 },
      {
        type: 'row',
        fields: [
          { name: 'button', label: 'Przycisk', type: 'text', maxLength: 40 },
          {
            name: 'action',
            label: 'Przycisk prowadzi do',
            type: 'select',
            options: HELP_ACTIONS,
            admin: { description: 'Przycisk jeszcze niewidoczny na stronie.' },
          },
        ],
      },
    ],
  }
}

/**
 * Categories of the catalog, each in one group (ADR-012 §1). A category without published
 * products is hidden everywhere and its page is 404 (rozstrzygnięcie 7) — decided on read.
 */
export const CatalogCategories: CollectionConfig = {
  slug: 'catalog-categories',
  labels: { singular: 'Kategoria', plural: 'Kategorie' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'group', 'slug', 'order'],
    group: 'Katalog',
  },
  defaultSort: 'order',
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  hooks: catalogRevalidationHooks,
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    { name: 'name', label: 'Nazwa', type: 'text', required: true },
    slugField('catalog-categories', 'kasy-fiskalne'),
    {
      name: 'group',
      label: 'Grupa',
      type: 'relationship',
      relationTo: 'catalog-groups',
      required: true,
      index: true,
    },
    { name: 'icon', label: 'Ikona', type: 'select', options: ICON_OPTIONS },
    {
      name: 'description',
      label: 'Krótki opis',
      type: 'textarea',
      maxLength: 200,
      admin: { description: 'Jedno zdanie pod nazwą w menu i na kafelku.' },
    },
    {
      // K3 (ADR-012 rozstrz. 15): chips inside the category; a subcategory with a slug also
      // gets its own address `/oferta/<kategoria>/<slug>` (K3b′).
      name: 'subcategories',
      label: 'Podkategorie',
      type: 'array',
      validate: (rows: unknown) =>
        validateSubcategories(Array.isArray(rows) ? (rows as SubcategoryRow[]) : null),
      admin: {
        description:
          'Kolejność chipów. Nazwa jak w polu „Podkategoria” produktu; adres tylko dla podkategorii z własną stroną.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', label: 'Nazwa', type: 'text', required: true },
            {
              name: 'slug',
              label: 'Adres',
              type: 'text',
              validate: (value: unknown) =>
                !value || (typeof value === 'string' && isValidSlug(value))
                  ? true
                  : 'Tylko małe litery, cyfry i pojedyncze myślniki, np. „laptopy”.',
            },
          ],
        },
        useCasesField,
        helpGroup('Karta doboru podkategorii. Jeszcze niewidoczna na stronie.'),
      ],
    },
    useCasesField,
    {
      name: 'hero',
      label: 'Nagłówek strony kategorii',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Tytuł (H1)',
          type: 'text',
          admin: { description: 'Puste = nazwa.' },
        },
        { name: 'lead', label: 'Wstęp', type: 'textarea' },
        { name: 'highlights', label: 'Zalety', type: 'text', hasMany: true, maxRows: 3 },
        imageField('image', 'Obraz'),
      ],
    },
    includedField(),
    faqArray,
    {
      name: 'frequentlyBoughtWith',
      label: 'Często dobierane',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: { description: 'Na stronie kategorii jako kafle kategorii tych produktów.' },
    },
    {
      type: 'collapsible',
      label: 'Strona kategorii — sekcje',
      admin: {
        initCollapsed: true,
        description: 'Puste pola = ogólne teksty z nazwą kategorii.',
      },
      fields: [
        {
          name: 'includedSection',
          label: 'Sekcja „Co robimy przy zakupie”',
          type: 'group',
          fields: [
            sectionHeading,
            {
              name: 'cards',
              label: 'Karty',
              type: 'array',
              maxRows: 9,
              admin: { description: 'Puste = karty z samych pozycji listy „W cenie”.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'icon', label: 'Ikona', type: 'select', options: ICON_OPTIONS },
                    { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 60 },
                  ],
                },
                { name: 'text', label: 'Opis', type: 'textarea', maxLength: 200 },
              ],
            },
          ],
        },
        {
          name: 'facts',
          label: 'Przepisy w pigułce',
          type: 'group',
          fields: [
            sectionHeading,
            {
              name: 'items',
              label: 'Karty',
              type: 'array',
              maxRows: 3,
              admin: {
                description:
                  'Fakt prawny tylko ze źródłem: karta bez nazwy przepisu i linku do niego nie pokazuje się na stronie.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'value', label: 'Liczba', type: 'text', required: true, maxLength: 12 },
                    { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 80 },
                  ],
                },
                { name: 'text', label: 'Opis', type: 'textarea', required: true, maxLength: 300 },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'source',
                      label: 'Źródło (wyświetlane)',
                      type: 'text',
                      maxLength: 120,
                      admin: { description: 'Np. „Art. 111 ust. 4 ustawy o VAT · sprawdzono …”.' },
                    },
                    {
                      name: 'sourceUrl',
                      label: 'Link do przepisu',
                      type: 'text',
                      validate: (value: unknown) =>
                        !value || (typeof value === 'string' && isHttpsUrl(value))
                          ? true
                          : 'Adres https://, np. https://isap.sejm.gov.pl/….',
                    },
                  ],
                },
                linkGroup('link', 'Link pod kartą (opcjonalnie)'),
              ],
            },
          ],
        },
        {
          name: 'faqIntro',
          label: 'Nagłówek pytań',
          type: 'group',
          fields: [
            sectionHeading,
            { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 400 },
          ],
        },
        helpGroup('Wypełnia ostatni rząd siatki produktów.'),
        {
          name: 'contact',
          label: 'Kontakt',
          type: 'group',
          fields: [
            { name: 'heading', label: 'Nagłówek', type: 'text', maxLength: 90 },
            { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
          ],
        },
      ],
    },
    orderField,
    seoGroup,
  ],
}
