import type { CollectionConfig, Field } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { ICON_OPTIONS, isHexColor } from '../lib/catalog/options'
import { orderField, slugField } from './catalogFields'

const gradientStop = (name: string, label: string): Field => ({
  name,
  label,
  type: 'text',
  required: true,
  validate: (value: unknown) =>
    isHexColor(value) ? true : 'Kolor w formacie #RRGGBB, np. #244FB0.',
  admin: { width: '50%' },
})

/** Top level of the catalog: 5 groups of categories (ADR-012 §1). */
export const CatalogGroups: CollectionConfig = {
  slug: 'catalog-groups',
  labels: { singular: 'Grupa katalogu', plural: 'Grupy katalogu' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'order'], group: 'Katalog' },
  defaultSort: 'order',
  // The plugin limits editors to their own tenants; the site reads through the Local API.
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    { name: 'name', label: 'Nazwa', type: 'text', required: true },
    slugField('catalog-groups', 'sprzedaz'),
    { name: 'icon', label: 'Ikona', type: 'select', required: true, options: ICON_OPTIONS },
    {
      type: 'row',
      fields: [
        gradientStop('gradientFrom', 'Gradient — od'),
        gradientStop('gradientTo', 'Gradient — do'),
      ],
    },
    orderField,
  ],
}
