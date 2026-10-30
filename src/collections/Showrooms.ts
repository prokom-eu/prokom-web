import type { CollectionConfig, Field } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { catalogRevalidationHooks } from '../lib/catalog/revalidate'
import { validateIconPath } from '../lib/catalog/svg'
import { isHttpsUrl, isValidNavHref } from '../lib/site/link'
import { brandFilter, faqArray, orderField, slugField } from './catalogFields'

/** Products of the record's tenant: the multi-tenant plugin narrows the relationship. */
function products(name: string, label: string, description?: string): Field {
  return {
    name,
    label,
    type: 'relationship',
    relationTo: 'products',
    hasMany: true,
    ...(description && { admin: { description } }),
  }
}

/** A short title with a line under it (hero card, service, rollout steps). */
const titledItems = (name: string, label: string, maxRows?: number): Field => ({
  name,
  label,
  type: 'array',
  ...(maxRows && { maxRows }),
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 60 },
        { name: 'text', label: 'Opis', type: 'text', maxLength: 160 },
      ],
    },
  ],
})

/** Recommended models (`plans`, K4-FINAL §6); `alt` rows form the secondary section. */
const plansGroup = (name: string, label: string): Field => ({
  name,
  label,
  type: 'group',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Nadtytuł', type: 'text', maxLength: 60 },
        { name: 'title', label: 'Nagłówek', type: 'text', maxLength: 90 },
        {
          name: 'big',
          label: 'Duże zdjęcia',
          type: 'checkbox',
          defaultValue: false,
          admin: { width: '20%' },
        },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 400 },
    {
      name: 'altTitle',
      label: 'Nagłówek sekcji drugorzędnej',
      type: 'text',
      maxLength: 90,
      admin: { description: 'Nad modelami oznaczonymi „Drugorzędny”.' },
    },
    {
      name: 'items',
      label: 'Modele',
      type: 'array',
      labels: { singular: 'Model', plural: 'Modele' },
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', label: 'Nazwa', type: 'text', required: true, maxLength: 80 },
            { name: 'audience', label: 'Dla kogo', type: 'text', maxLength: 120 },
          ],
        },
        {
          name: 'product',
          label: 'Produkt',
          type: 'relationship',
          relationTo: 'products',
          admin: { description: 'Zdjęcie, „Szczegóły” i „Zapytaj”. Bez produktu karta znika.' },
        },
        {
          name: 'features',
          label: 'Punkty',
          type: 'text',
          hasMany: true,
          maxRows: 4,
          admin: { description: '3–4 krótkie punkty.' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'tag',
              label: 'Plakietka',
              type: 'text',
              maxLength: 40,
              admin: { description: 'Np. „polecamy na start”.' },
            },
            { name: 'alt', label: 'Drugorzędny', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
  ],
})

/**
 * Showrooms 2.0 (K4, D-K4-3, ADR-017): one template, every block optional (K4-FINAL §6). A
 * showroom belongs to one brand (Lenovo) or joins several (Druk: Konica Minolta + Kyocera).
 * Brand data (logo, status, facts on the brand page) stays in `Partners`; numbers shown in the
 * hero (positions, series) are counted from the catalog, not stored.
 */
export const Showrooms: CollectionConfig = {
  slug: 'showrooms',
  labels: { singular: 'Salon', plural: 'Salony marek' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order'],
    group: 'Katalog',
  },
  defaultSort: 'order',
  // Read by the pages through the Local API with the tenant filter, like the bundles.
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  hooks: catalogRevalidationHooks,
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    {
      name: 'name',
      label: 'Nazwa salonu',
      type: 'text',
      required: true,
      maxLength: 60,
      admin: { description: 'W panelu i w tytule paska na telefonie, np. „Niszczarki”, „Lenovo”.' },
    },
    slugField('showrooms', 'druk'),
    orderField,
    {
      name: 'brands',
      label: 'Marki',
      type: 'relationship',
      relationTo: 'partners',
      hasMany: true,
      required: true,
      minRows: 1,
      filterOptions: brandFilter,
      admin: { description: 'Salon marki — jedna; salon tematyczny — kilka (logo w nagłówku).' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nagłówek',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'pill', label: 'Etykieta', type: 'text', maxLength: 90 },
                { name: 'pillMobile', label: 'Etykieta (telefon)', type: 'text', maxLength: 40 },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'h1a', label: 'H1 — część 1', type: 'text', required: true, maxLength: 80 },
                { name: 'h1b', label: 'H1 — część 2', type: 'text', maxLength: 80 },
              ],
            },
            { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 400 },
            {
              name: 'hero',
              label: 'Zdjęcia w nagłówku',
              type: 'array',
              maxRows: 3,
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'product',
                      label: 'Produkt',
                      type: 'relationship',
                      relationTo: 'products',
                      required: true,
                    },
                    { name: 'label', label: 'Podpis', type: 'text', maxLength: 40 },
                  ],
                },
              ],
            },
            {
              name: 'heroCard',
              label: 'Karta w nagłówku',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  label: 'Tytuł',
                  type: 'text',
                  maxLength: 60,
                  admin: { description: 'Np. „Kupujesz sprzęt — dostajesz”.' },
                },
                titledItems('items', 'Punkty', 4),
                { name: 'chips', label: 'Plakietki', type: 'text', hasMany: true },
              ],
            },
            {
              name: 'facts',
              label: 'Krótkie fakty',
              type: 'array',
              maxRows: 3,
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'value',
                      label: 'Wartość',
                      type: 'text',
                      required: true,
                      maxLength: 40,
                    },
                    { name: 'label', label: 'Podpis', type: 'text', maxLength: 80 },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Modele',
          fields: [
            plansGroup('plans', 'Polecane modele'),
            plansGroup('morePlans', 'Druga sekcja modeli'),
            {
              name: 'compare',
              label: 'Porównanie',
              type: 'group',
              admin: { description: 'W komórce: 1 = ✓, 0 = —, inny tekst = wartość.' },
              fields: [
                { name: 'title', label: 'Nagłówek', type: 'text', maxLength: 90 },
                { name: 'columns', label: 'Kolumny', type: 'text', hasMany: true },
                {
                  name: 'rows',
                  label: 'Wiersze',
                  type: 'array',
                  admin: { initCollapsed: true },
                  fields: [
                    { name: 'label', label: 'Cecha', type: 'text', required: true },
                    {
                      name: 'values',
                      label: 'Wartości (w kolejności kolumn)',
                      type: 'text',
                      hasMany: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Oferta i dobór',
          fields: [
            {
              name: 'family',
              label: 'Pełna oferta — zakładki',
              type: 'array',
              labels: { singular: 'Zakładka', plural: 'Zakładki' },
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', label: 'Nazwa', type: 'text', required: true, maxLength: 60 },
                    {
                      name: 'iconPath',
                      label: 'Ikona (ścieżka SVG)',
                      type: 'text',
                      validate: validateIconPath,
                    },
                  ],
                },
                products('products', 'Produkty'),
              ],
            },
            {
              name: 'chooser',
              label: '„Pomóż mi wybrać”',
              type: 'group',
              admin: { description: 'Pusty = w nagłówku drugi przycisk „Zapytaj o ofertę”.' },
              fields: [
                { name: 'question', label: 'Pytanie', type: 'text', maxLength: 90 },
                {
                  name: 'options',
                  label: 'Odpowiedzi',
                  type: 'array',
                  fields: [
                    { name: 'label', label: 'Odpowiedź', type: 'text', required: true },
                    products('products', 'Polecane modele'),
                    { name: 'why', label: 'Dlaczego', type: 'textarea', maxLength: 300 },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Serwis i wdrożenie',
          fields: [
            {
              name: 'service',
              label: 'Serwis (Posnet, Elzab)',
              type: 'group',
              fields: [
                { name: 'title', label: 'Nagłówek', type: 'text', maxLength: 90 },
                { name: 'description', label: 'Opis', type: 'textarea', maxLength: 500 },
                titledItems('items', 'Usługi'),
                products('products', 'Produkty obok'),
              ],
            },
            {
              name: 'rollout',
              label: 'Wdrożenie',
              type: 'group',
              fields: [
                { name: 'title', label: 'Nagłówek', type: 'text', maxLength: 90 },
                { name: 'description', label: 'Opis', type: 'textarea', maxLength: 500 },
                titledItems('steps', 'Kroki', 4),
                {
                  type: 'row',
                  fields: [
                    { name: 'button', label: 'Przycisk', type: 'text', maxLength: 40 },
                    {
                      name: 'buttonHref',
                      label: 'Adres przycisku',
                      type: 'text',
                      validate: (value: unknown) =>
                        !value || (typeof value === 'string' && isValidNavHref(value))
                          ? true
                          : 'Adres strony, np. „/gopos”.',
                      admin: { description: 'Pusty = przycisk otwiera zapytanie.' },
                    },
                  ],
                },
                products('products', 'Produkty obok'),
              ],
            },
          ],
        },
        {
          label: 'O marce i pytania',
          fields: [
            {
              name: 'about',
              label: 'O marce — akapity',
              type: 'array',
              fields: [{ name: 'text', label: 'Akapit', type: 'textarea', required: true }],
            },
            {
              name: 'brandFacts',
              label: 'Fakty',
              type: 'array',
              admin: { description: 'U innych firm tylko miasto, bez adresu (K4-FINAL §1).' },
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
            faqArray,
            {
              type: 'collapsible',
              label: 'Nagłówki salonu tematycznego',
              admin: {
                initCollapsed: true,
                description: 'Puste = domyślne („Pytania o …”, „… w faktach”).',
              },
              fields: [
                {
                  name: 'headings',
                  type: 'group',
                  label: false,
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'faq', label: 'Pytania', type: 'text', maxLength: 90 },
                        { name: 'facts', label: 'Fakty', type: 'text', maxLength: 90 },
                        { name: 'offer', label: 'Oferta', type: 'text', maxLength: 90 },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        { name: 'more', label: 'Więcej', type: 'text', maxLength: 90 },
                        { name: 'ask', label: 'Zapytaj', type: 'text', maxLength: 90 },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
