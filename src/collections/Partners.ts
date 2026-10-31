import path from 'path'
import type { CollectionConfig } from 'payload'

import { restrictedRichTextEditor } from '../blocks/RichText/config'
import { adminOnly } from '../lib/auth/access'
import { catalogRevalidationHooks } from '../lib/catalog/revalidate'
import { validateHttpsUrls } from '../lib/catalog/sources'
import { getEnv } from '../lib/env'
import { createPublicReadAccess, publicPartnerWhere } from '../lib/media/access'
import { isHttpsUrl, isValidNavHref } from '../lib/site/link'
import { isValidSlug } from '../lib/tenant/uniqueSlug'
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
  // Brands of the catalog: their name, address and status are in the index of their sites.
  hooks: catalogRevalidationHooks,
  upload: {
    staticDir: path.resolve(getEnv().MEDIA_DIR, 'partners'),
    mimeTypes: IMAGE_MIME_TYPES,
    // A catalog brand may have no official logo yet (APC, Samsung, PRO-KOM services); the
    // logo wall (`getPartners`) skips records without a file.
    filesRequiredOnCreate: false,
    imageSizes: [
      { name: 'logo', width: 320, formatOptions: { format: 'webp', options: { quality: 85 } } },
    ],
  },
  fields: [
    { name: 'name', label: 'Nazwa', type: 'text', required: true },
    {
      // Address of the brand page in the Biznes catalog (`/oferta?marka=…`, ADR-012). Unique
      // across sites, as the collection is shared; optional, so logo-only partners need none.
      name: 'slug',
      label: 'Adres',
      type: 'text',
      unique: true,
      // A cleared field arrives as '' — stored as NULL, so many logo-only partners can stay
      // without an address (NULLs do not collide in the unique index, '' would).
      hooks: { beforeValidate: [({ value }) => (value === '' ? null : value)] },
      validate: (value: unknown) =>
        !value || (typeof value === 'string' && isValidSlug(value))
          ? true
          : 'Tylko małe litery, cyfry i pojedyncze myślniki, np. „posnet”.',
      admin: { position: 'sidebar', description: 'Np. „posnet”. Potrzebny markom z katalogu.' },
    },
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
        // K4-FINAL §1: Optivendi „Partner”, COMEX „We współpracy” — no other brand has one.
        { label: 'Partner', value: 'partner' },
        { label: 'We współpracy', value: 'cooperation' },
      ],
      admin: {
        description:
          'Tylko: Posnet i Elzab — autoryzowany serwis; GoPOS i InsERT — autoryzowany partner; Optivendi — partner; COMEX — we współpracy.',
      },
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
    {
      // Brand page of the Biznes catalog (`/marki/[slug]`, K3, ADR-012 rozstrz. 15). Shared
      // like the record: the page renders only on the Biznes line.
      name: 'brandPage',
      label: 'Strona marki',
      type: 'group',
      admin: { description: 'Strona marki w katalogu Biznesu (/marki/…).' },
      fields: [
        {
          name: 'hasPage',
          label: 'Ma stronę marki',
          type: 'checkbox',
          defaultValue: false,
        },
        { name: 'country', label: 'Kraj pochodzenia', type: 'text' },
        {
          name: 'shortDescription',
          label: 'Opis krótki',
          type: 'textarea',
          maxLength: 200,
          admin: { description: 'Jedno zdanie pod nazwą marki.' },
        },
        {
          name: 'description',
          label: 'Opis',
          type: 'richText',
          editor: restrictedRichTextEditor,
        },
        {
          name: 'facts',
          label: 'Fakty',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', label: 'Etykieta', type: 'text', required: true },
                { name: 'value', label: 'Wartość', type: 'text', required: true },
              ],
            },
            {
              name: 'sourceUrl',
              label: 'Źródło',
              type: 'text',
              validate: (value: unknown) =>
                !value || (typeof value === 'string' && isHttpsUrl(value))
                  ? true
                  : 'Adres https:// strony, z której pochodzi fakt.',
            },
          ],
        },
        { name: 'productLines', label: 'Linie produktów', type: 'text', hasMany: true },
        {
          name: 'sources',
          label: 'Źródła',
          type: 'text',
          hasMany: true,
          validate: validateHttpsUrls,
        },
      ],
    },
  ],
}
