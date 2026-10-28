import type { CollectionConfig } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { hiddenItemsHook } from '../lib/catalog/bundleWarnings'
import { BUNDLE_AREAS, CONTENT_STATUSES } from '../lib/catalog/options'
import { catalogRevalidationHooks } from '../lib/catalog/revalidate'
import { faqArray, orderField, slugField } from './catalogFields'

/**
 * Ready bundles (K3c, ADR-012 rozstrz. 15, spec. §6.10): hardware, programs and services that
 * work together. Items point at catalog cards; a hidden card drops out of the bundle on the page,
 * and a bundle without any required item is not shown. Fields in „Tylko dla zespołu” never
 * reach the pages — the view (`lib/catalog/bundle.ts`) copies public fields only.
 */
export const Bundles: CollectionConfig = {
  slug: 'bundles',
  labels: { singular: 'Zestaw', plural: 'Gotowe zestawy' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'area', 'level', 'contentStatus', 'order'],
    group: 'Katalog',
  },
  defaultSort: 'order',
  // Read by the pages through the Local API with the tenant filter, like the products.
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  hooks: catalogRevalidationHooks,
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    slugField('bundles', 'zestaw-kawiarnia-lada'),
    orderField,
    {
      name: 'contentStatus',
      label: 'Lista',
      type: 'select',
      required: true,
      defaultValue: 'needs-review',
      options: [...CONTENT_STATUSES],
      admin: {
        position: 'sidebar',
        description:
          '„Gotowe” po sprawdzeniu zgodności elementów. „Do sprawdzenia” = widoczny, ale bez Google, mapy strony, planu i stron branż.',
      },
    },
    {
      // Virtual: no column, computed on read (spec. §6.10 — a warning when a card drops out).
      name: 'hiddenItems',
      label: 'Uwaga',
      type: 'textarea',
      virtual: true,
      hooks: { afterRead: [hiddenItemsHook] },
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => Boolean(data?.hiddenItems),
      },
    },
    { name: 'name', label: 'Nazwa', type: 'text', required: true, maxLength: 120 },
    {
      type: 'row',
      fields: [
        {
          name: 'area',
          label: 'Obszar (filtr)',
          type: 'select',
          required: true,
          options: [...BUNDLE_AREAS],
        },
        {
          name: 'series',
          label: 'Seria',
          type: 'text',
          required: true,
          admin: { description: 'Z paczki, np. „gastronomia-lada” — kreator dobiera po niej.' },
        },
        {
          name: 'level',
          label: 'Poziom',
          type: 'text',
          maxLength: 30,
          admin: { description: 'Np. „Mały”, „Średni”, „Standard”.' },
        },
      ],
    },
    {
      name: 'industries',
      label: 'Branże',
      type: 'relationship',
      relationTo: 'industries',
      hasMany: true,
      admin: { description: 'Na stronach tych branż w sekcji „Gotowe zestawy” (tylko „Gotowe”).' },
    },
    { name: 'audience', label: 'Dla kogo', type: 'textarea', required: true, maxLength: 300 },
    { name: 'benefit', label: 'Korzyść', type: 'textarea', required: true, maxLength: 300 },
    {
      name: 'description',
      label: 'Opis',
      type: 'array',
      labels: { singular: 'Akapit', plural: 'Akapity' },
      fields: [{ name: 'text', label: 'Akapit', type: 'textarea', required: true }],
    },
    {
      name: 'items',
      label: 'Elementy',
      type: 'array',
      labels: { singular: 'Element', plural: 'Elementy' },
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'product',
              label: 'Produkt',
              type: 'relationship',
              relationTo: 'products',
              // Not required: deleting a card must not fail on the bundle; the item is then
              // left out on the page (spec. §6.10).
              admin: { description: 'Element bez widocznego produktu nie pokazuje się.' },
            },
            { name: 'role', label: 'Rola', type: 'text', required: true, maxLength: 80 },
            {
              name: 'quantity',
              label: 'Ilość',
              type: 'text',
              required: true,
              defaultValue: '1',
              maxLength: 60,
              admin: { description: 'Liczba albo opis, np. „wg stanowisk”, „1–2”.' },
            },
            { name: 'mandatory', label: 'Obowiązkowy', type: 'checkbox', defaultValue: true },
          ],
        },
        { name: 'suggestedVersion', label: 'Sugerowana wersja', type: 'text', maxLength: 200 },
        {
          name: 'toConfirm',
          label: 'Do potwierdzenia (tylko dla zespołu)',
          type: 'textarea',
          admin: { description: 'Nigdy na stronie. Pusto we wszystkich = można dać „Gotowe”.' },
        },
      ],
    },
    {
      name: 'swaps',
      label: 'Możesz zamienić',
      type: 'array',
      labels: { singular: 'Zamiana', plural: 'Zamiany' },
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'from', label: 'Zamiast', type: 'relationship', relationTo: 'products' },
            { name: 'to', label: 'Można', type: 'relationship', relationTo: 'products' },
          ],
        },
        { name: 'when', label: 'Kiedy', type: 'textarea', required: true },
      ],
    },
    {
      name: 'services',
      label: 'Co robimy przy wdrożeniu',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: { description: 'Karty usług. Nieopublikowane nie pokazują się.' },
    },
    { name: 'reasons', label: 'Dlaczego taki zestaw', type: 'text', hasMany: true },
    faqArray,
    {
      name: 'related',
      label: 'Zobacz też',
      type: 'relationship',
      relationTo: 'catalog-categories',
      hasMany: true,
      admin: { description: 'Kategorie katalogu, np. „Dofinansowania”.' },
    },
    {
      type: 'collapsible',
      label: 'Tylko dla zespołu',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'internalNotes',
          label: 'Notatki wewnętrzne',
          type: 'textarea',
          admin: { description: 'Z importu i dla zespołu — nigdy na stronie.' },
        },
        {
          name: 'compatChecks',
          label: 'Sprawdzone zgodności',
          type: 'array',
          labels: { singular: 'Para', plural: 'Pary' },
          fields: [
            { name: 'pair', label: 'Para', type: 'text', required: true },
            { name: 'source', label: 'Źródło w karcie', type: 'textarea' },
            { name: 'status', label: 'Status', type: 'text' },
          ],
        },
      ],
    },
  ],
}
