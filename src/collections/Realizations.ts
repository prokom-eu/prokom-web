import { APIError } from 'payload'
import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { REALIZATION_KINDS, SERVICE_KEYS } from '../lib/instalacje/options'
import { publishWithoutConsent } from '../lib/instalacje/realizations'
import { onlyLineTenant } from '../lib/tenant/onlyLine'
import { imageField } from './catalogFields'

const requireConsent: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (publishWithoutConsent(data, originalDoc)) {
    throw new APIError(
      'Realizację można opublikować dopiero po zaznaczeniu zgody klienta.',
      400,
      null,
      true,
    )
  }
  return data
}

/**
 * Realizations of the Instalacje site (ADR-I002 §2). They name real clients, so publishing needs
 * the client's consent (hook); the import publishes them with it (the clients agreed, 01.11.2026)
 * and taking the consent back in the panel unpublishes nothing by itself — set a draft too.
 */
export const Realizations: CollectionConfig = {
  slug: 'realizations',
  labels: { singular: 'Realizacja', plural: 'Realizacje' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'place', 'clientConsent', '_status', 'updatedAt'],
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
      onlyLineTenant('instalacje', 'Realizacje mają tylko strony linii Instalacje.'),
    ],
    beforeChange: [requireConsent],
  },
  indexes: [{ fields: ['tenant', 'legacyId'], unique: true }],
  fields: [
    {
      name: 'legacyId',
      label: 'Id z importu',
      type: 'number',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'clientConsent',
      label: 'Klient zgodził się na publikację',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Bez zgody realizacja zostaje wersją roboczą.' },
    },
    {
      name: 'featured',
      label: 'Na stronie głównej',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    { name: 'title', label: 'Klient / tytuł', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          label: 'Rodzaj prac',
          type: 'text',
          admin: { description: 'Np. „Audio, projekcja, IT”.' },
        },
        { name: 'year', label: 'Rok', type: 'number', min: 1990, max: 2100 },
      ],
    },
    { name: 'place', label: 'Miejsce i obiekt', type: 'text' },
    { name: 'scope', label: 'Zakres', type: 'textarea' },
    { name: 'description', label: 'Opis', type: 'textarea' },
    {
      name: 'services',
      label: 'Usługi',
      type: 'select',
      hasMany: true,
      options: [...SERVICE_KEYS],
    },
    {
      name: 'kind',
      label: 'Rodzaj obiektu (filtr)',
      type: 'select',
      options: [...REALIZATION_KINDS],
      admin: { description: 'Filtr „Każdy obiekt” na /realizacje.' },
    },
    imageField('photos', 'Zdjęcia', true),
  ],
}
