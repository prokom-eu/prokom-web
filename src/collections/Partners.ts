import path from 'path'
import type { CollectionConfig } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { getEnv } from '../lib/env'
import { createPublicReadAccess, publicPartnerWhere } from '../lib/media/access'
import { isValidNavHref } from '../lib/site/link'
import { IMAGE_MIME_TYPES } from './Media'

/**
 * Partners and brands, shared by all sites (ADR-006, ADR-012: one collection for both).
 * The record is the logo itself (upload) — only official files. `tenants` decides on which
 * sites the partner is shown; outside the multi-tenant plugin on purpose.
 */
export const Partners: CollectionConfig = {
  slug: 'partners',
  labels: { singular: 'Partner', plural: 'Partnerzy' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'partnerStatus', 'tenants', 'order'] },
  defaultSort: 'order',
  access: {
    read: createPublicReadAccess(publicPartnerWhere),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  upload: {
    staticDir: path.resolve(getEnv().MEDIA_DIR, 'partners'),
    mimeTypes: IMAGE_MIME_TYPES,
    imageSizes: [
      { name: 'logo', width: 320, formatOptions: { format: 'webp', options: { quality: 85 } } },
    ],
  },
  fields: [
    { name: 'name', label: 'Nazwa', type: 'text', required: true },
    {
      // Not `url`: upload collections already have `url` (the file's address).
      name: 'website',
      label: 'Strona partnera',
      type: 'text',
      validate: (value: unknown) =>
        !value ||
        (typeof value === 'string' && value.startsWith('https://') && isValidNavHref(value))
          ? true
          : 'Adres https://, np. https://www.posnet.com.pl.',
    },
    {
      name: 'partnerStatus',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'none',
      options: [
        { label: 'Marka (bez statusu)', value: 'none' },
        { label: 'Autoryzowany serwis', value: 'authorized-service' },
        { label: 'Autoryzowany partner', value: 'authorized-partner' },
      ],
    },
    {
      name: 'tenants',
      label: 'Widoczny na stronach',
      type: 'relationship',
      relationTo: 'tenants',
      hasMany: true,
    },
    {
      name: 'order',
      label: 'Kolejność',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Mniejsza liczba = wcześniej.' },
    },
  ],
}
