import type { CollectionConfig } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { OFFER_CATEGORIES } from '../lib/instalacje/options'
import { onlyLineTenant } from '../lib/tenant/onlyLine'

/**
 * The full offer of the Instalacje site (`/uslugi`): 76 solutions in 10 areas, one area per
 * service (ADR-I002 §2). The area texts (family, description, brands) live in `InstServices`.
 */
export const InstSolutions: CollectionConfig = {
  slug: 'inst-solutions',
  labels: { singular: 'Rozwiązanie z oferty', plural: 'Oferta (rozwiązania)' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'service', 'order', '_status', 'updatedAt'],
    group: 'Instalacje',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    beforeValidate: [
      onlyLineTenant('instalacje', 'Oferta Instalacji jest tylko na stronach linii Instalacje.'),
    ],
  },
  indexes: [
    // Postgres lets many rows have no id, so solutions added in the panel do not collide.
    { fields: ['tenant', 'legacyId'], unique: true },
  ],
  fields: [
    {
      // Position in the design package: `pnpm seed:instalacje` finds the solution by it.
      name: 'legacyId',
      label: 'Id z importu',
      type: 'number',
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'name', label: 'Nazwa', type: 'text', required: true },
    { name: 'description', label: 'Opis', type: 'textarea' },
    {
      type: 'row',
      fields: [
        {
          name: 'service',
          label: 'Usługa (obszar)',
          type: 'relationship',
          relationTo: 'inst-services',
          required: true,
        },
        {
          name: 'order',
          label: 'Kolejność w obszarze',
          type: 'number',
          min: 0,
          admin: { description: 'Mniejsza liczba = wcześniej.' },
        },
      ],
    },
    {
      name: 'categories',
      label: 'Dla kogo (filtr oferty)',
      type: 'select',
      hasMany: true,
      options: [...OFFER_CATEGORIES],
    },
  ],
}
