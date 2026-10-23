import type { CollectionConfig, Field } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { tenantImageFilter } from '../lib/media/access'
import { catalogRevalidationHooks } from '../lib/catalog/revalidate'
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
  hooks: catalogRevalidationHooks,
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    { name: 'name', label: 'Nazwa', type: 'text', required: true },
    slugField('catalog-groups', 'sprzedaz'),
    { name: 'icon', label: 'Ikona', type: 'select', required: true, options: ICON_OPTIONS },
    {
      name: 'description',
      label: 'Opis',
      type: 'text',
      maxLength: 90,
      admin: {
        description:
          'Krótka lista tego, co jest w dziale, np. „kasy, drukarki fiskalne, POS, terminale”. Strona główna: koło działów i karty Oferty.',
      },
    },
    {
      type: 'row',
      fields: [
        gradientStop('gradientFrom', 'Gradient — od'),
        gradientStop('gradientTo', 'Gradient — do'),
      ],
    },
    {
      name: 'showcase',
      label: 'Witryna karty działu (strona główna)',
      type: 'group',
      admin: {
        description: 'Górna część karty działu w sekcji Oferta: 2 zdjęcia albo 2 paski statusu.',
      },
      fields: [
        {
          name: 'mode',
          label: 'Rodzaj',
          type: 'radio',
          defaultValue: 'images',
          options: [
            { label: 'Zdjęcia', value: 'images' },
            { label: 'Paski statusu', value: 'statuses' },
          ],
        },
        {
          name: 'images',
          label: 'Zdjęcia (większe, potem mniejsze)',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          maxRows: 2,
          filterOptions: tenantImageFilter,
          admin: { condition: (_, sibling) => sibling?.mode !== 'statuses' },
        },
        {
          name: 'statuses',
          label: 'Paski statusu',
          type: 'array',
          maxRows: 2,
          admin: { condition: (_, sibling) => sibling?.mode === 'statuses' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', label: 'Etykieta', type: 'text', required: true, maxLength: 40 },
                { name: 'value', label: 'Wartość', type: 'text', required: true, maxLength: 24 },
                {
                  name: 'tone',
                  label: 'Kropka',
                  type: 'select',
                  required: true,
                  defaultValue: 'ok',
                  options: [
                    { label: 'Zielona', value: 'ok' },
                    { label: 'Pomarańczowa', value: 'warn' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    orderField,
  ],
}
