import type { CollectionConfig } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { WIZARD_BUSINESS_TYPES } from '../lib/catalog/options'
import { faqArray, imageField, orderField, seoGroup, slugField } from './catalogFields'

/**
 * Industries (Branże, ADR-012 §1). One page template for all (spec. §6.7); its sections
 * beyond hero and FAQ come with B10. Inactive = „Wkrótce”: listed, without its own page.
 */
export const Industries: CollectionConfig = {
  slug: 'industries',
  labels: { singular: 'Branża', plural: 'Branże' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'active', 'order'],
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
    slugField('industries', 'gastronomia'),
    {
      name: 'active',
      label: 'Aktywna',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Nieaktywna branża pokazuje się jako „Wkrótce”.',
      },
    },
    {
      name: 'wizardBusinessType',
      label: 'Rodzaj firmy w kreatorze',
      type: 'select',
      options: [...WIZARD_BUSINESS_TYPES],
      admin: {
        position: 'sidebar',
        description: 'Przycisk „Przygotuj ofertę” otwiera kreator z tym rodzajem firmy.',
      },
    },
    {
      name: 'hero',
      label: 'Nagłówek strony branży',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Tytuł (H1)',
          type: 'text',
          admin: { description: 'Puste = nazwa.' },
        },
        { name: 'lead', label: 'Wstęp', type: 'textarea' },
        imageField('image', 'Obraz'),
      ],
    },
    {
      name: 'featuredProducts',
      label: 'Polecane produkty',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
    },
    faqArray,
    orderField,
    seoGroup,
  ],
}
