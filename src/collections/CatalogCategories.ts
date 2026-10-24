import type { CollectionConfig, Field } from 'payload'

import { linkGroup } from '../blocks/fields'
import { adminOnly } from '../lib/auth/access'
import { catalogRevalidationHooks } from '../lib/catalog/revalidate'
import { ICON_OPTIONS } from '../lib/catalog/options'
import { isHttpsUrl } from '../lib/site/link'
import {
  faqArray,
  imageField,
  includedField,
  orderField,
  seoGroup,
  slugField,
} from './catalogFields'

/** Eyebrow and H2 of a category page section. */
const sectionHeading: Field = {
  type: 'row',
  fields: [
    { name: 'eyebrow', label: 'Nadtytuł', type: 'text', maxLength: 60 },
    { name: 'title', label: 'Nagłówek', type: 'text', maxLength: 90 },
  ],
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
          label: 'Sekcja „W cenie”',
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
        {
          name: 'help',
          label: 'Karta „Nie wiesz, którą wybrać?”',
          type: 'group',
          admin: { description: 'Wypełnia ostatni rząd siatki produktów.' },
          fields: [
            { name: 'title', label: 'Tytuł', type: 'text', maxLength: 90 },
            { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 200 },
          ],
        },
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
