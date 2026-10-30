import path from 'path'
import type { CollectionConfig, Field, Where } from 'payload'

import { restrictedRichTextEditor } from '../blocks/RichText/config'
import { adminOnly } from '../lib/auth/access'
import { catalogRevalidationHooks } from '../lib/catalog/revalidate'
import { validateHttpsUrls } from '../lib/catalog/sources'
import { validateIconPath } from '../lib/catalog/svg'
import { validateYoutubeId } from '../lib/catalog/videos'
import { getEnv } from '../lib/env'
import { createPublicReadAccess, publicPartnerWhere } from '../lib/media/access'
import { isHttpsUrl, isValidNavHref } from '../lib/site/link'
import { tenantIdOf } from '../lib/tenant/id'
import { isValidSlug } from '../lib/tenant/uniqueSlug'
import { IMAGE_MIME_TYPES } from './Media'

const iconPathField: Field = {
  name: 'iconPath',
  label: 'Ikona (ścieżka SVG)',
  type: 'text',
  validate: validateIconPath,
}

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
    {
      // Showroom of the brand page (K3.1 `marki-salony-k31.json`, ADR-012 rozstrz. 15): only
      // Lenovo and Dell have one. Rendered on the Biznes line (K31c).
      name: 'showroom',
      label: 'Salon marki',
      type: 'group',
      admin: {
        description:
          'Salon na stronie marki (Lenovo, Dell): działy, serie, dobór w 3 pytaniach. Pusty = strona marki bez salonu. Produkty tylko ze stron, na których marka jest widoczna — przed zdjęciem marki ze strony usuń jej produkty z salonu.',
      },
      fields: [
        { name: 'h1', label: 'Nagłówek H1', type: 'text', maxLength: 120 },
        { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 400 },
        productsField('heroProducts', 'Produkty w nagłówku', 'Zdjęcia w nagłówku salonu.'),
        {
          type: 'row',
          fields: [
            { name: 'compareTitle', label: 'Nagłówek porównania serii', type: 'text' },
            { name: 'wizardTitle', label: 'Nagłówek doboru', type: 'text' },
          ],
        },
        {
          name: 'segments',
          label: 'Działy',
          type: 'array',
          labels: { singular: 'Dział', plural: 'Działy' },
          admin: { initCollapsed: true },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', label: 'Nazwa', type: 'text', required: true },
                {
                  name: 'key',
                  label: 'Klucz',
                  type: 'text',
                  required: true,
                  validate: (value: unknown) =>
                    typeof value === 'string' && isValidSlug(value)
                      ? true
                      : 'Małe litery, cyfry i myślniki, np. „laptopy”.',
                },
                iconPathField,
              ],
            },
            {
              name: 'series',
              label: 'Serie',
              type: 'array',
              labels: { singular: 'Seria', plural: 'Serie' },
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'name',
                      label: 'Nazwa',
                      type: 'text',
                      required: true,
                      admin: { description: 'Ta sama pisownia co „Seria” w produktach.' },
                    },
                    { name: 'tier', label: 'Klasa', type: 'text', admin: { width: '30%' } },
                  ],
                },
                { name: 'audience', label: 'Dla kogo', type: 'textarea', maxLength: 200 },
                { name: 'highlight', label: 'Wyróżnik', type: 'textarea', maxLength: 200 },
                {
                  name: 'imageProduct',
                  label: 'Zdjęcie z produktu',
                  type: 'relationship',
                  relationTo: 'products',
                  filterOptions: productsOfPartnerSites,
                },
                productsField('products', 'Produkty serii'),
              ],
            },
          ],
        },
        {
          name: 'wizard',
          label: 'Dobór — pytania',
          type: 'array',
          labels: { singular: 'Pytanie', plural: 'Pytania' },
          admin: { initCollapsed: true },
          fields: [
            { name: 'question', label: 'Pytanie', type: 'text', required: true },
            {
              name: 'options',
              label: 'Odpowiedzi',
              type: 'array',
              minRows: 2,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', label: 'Odpowiedź', type: 'text', required: true },
                    {
                      name: 'key',
                      label: 'Klucz',
                      type: 'text',
                      required: true,
                      admin: { description: 'Używany w regułach, np. „teren”.' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'wizardRules',
          label: 'Dobór — reguły',
          type: 'array',
          labels: { singular: 'Reguła', plural: 'Reguły' },
          admin: {
            initCollapsed: true,
            description: 'Pierwsza reguła, której wszystkie klucze pasują do odpowiedzi, wygrywa.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'when', label: 'Gdy odpowiedzi', type: 'text', hasMany: true },
                { name: 'series', label: 'Seria', type: 'text', required: true },
              ],
            },
            { name: 'why', label: 'Dlaczego', type: 'textarea', required: true },
            productsField('products', 'Polecane produkty'),
          ],
        },
        {
          name: 'services',
          label: 'Usługi',
          type: 'array',
          labels: { singular: 'Usługa', plural: 'Usługi' },
          admin: { initCollapsed: true },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'title', label: 'Tytuł', type: 'text', required: true },
                iconPathField,
              ],
            },
            { name: 'description', label: 'Opis', type: 'textarea', required: true },
          ],
        },
        {
          // Films of a whole series (ADR-016); the series name as in the package — matched to
          // the series tiles by the showroom view (K31c).
          name: 'videos',
          label: 'Filmy serii',
          type: 'array',
          labels: { singular: 'Film', plural: 'Filmy' },
          admin: {
            initCollapsed: true,
            description:
              'Tylko z oficjalnych kanałów producenta (ADR-016). Film „nieaktywny” znika ze strony — ustawia go też cotygodniowe sprawdzenie YouTube.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'series', label: 'Seria', type: 'text', required: true },
                {
                  name: 'youtubeId',
                  label: 'Identyfikator YouTube',
                  type: 'text',
                  required: true,
                  validate: validateYoutubeId,
                },
                { name: 'active', label: 'Aktywny', type: 'checkbox', defaultValue: true },
              ],
            },
            { name: 'title', label: 'Tytuł', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                { name: 'channel', label: 'Kanał', type: 'text' },
                { name: 'lang', label: 'Język', type: 'text', admin: { width: '20%' } },
              ],
            },
          ],
        },
      ],
    },
  ],
}

/** Products of the sites the partner is shown on (products belong to one tenant each). */
function productsOfPartnerSites({ data }: { data?: { tenants?: unknown } }): Where | false {
  const ids = (Array.isArray(data?.tenants) ? data.tenants : [])
    .map(tenantIdOf)
    .filter((id): id is number => id !== null)
  return ids.length > 0 ? { tenant: { in: ids } } : false
}

function productsField(name: string, label: string, description?: string): Field {
  return {
    name,
    label,
    type: 'relationship',
    relationTo: 'products',
    hasMany: true,
    filterOptions: productsOfPartnerSites,
    ...(description ? { admin: { description } } : {}),
  }
}
