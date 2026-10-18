import type { CollectionConfig } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { ICON_OPTIONS } from '../lib/catalog/options'
import {
  faqArray,
  imageField,
  includedField,
  orderField,
  seoGroup,
  slugField,
} from './catalogFields'

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
    },
    orderField,
    seoGroup,
  ],
}
