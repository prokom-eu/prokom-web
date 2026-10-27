import type { CollectionConfig } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { catalogRevalidationHooks } from '../lib/catalog/revalidate'
import { validateIconPath, validateSvg } from '../lib/catalog/svg'
import { orderField, slugField } from './catalogFields'

/**
 * „Plan Twojej firmy” (K3.1, ADR-012 rozstrz. 15): one record = one scene. The floor plan is
 * SVG code in the record — the plan renders it inline (K31d), styled by our CSS; the check on
 * save keeps it a drawing only. Points link to catalog cards; a hidden card hides its point
 * (K31d). Bundles of a scene come with `Bundles` (K3c).
 */
export const FloorPlans: CollectionConfig = {
  slug: 'floor-plans',
  labels: { singular: 'Plan firmy', plural: 'Plany firmy' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order'],
    group: 'Katalog',
  },
  defaultSort: 'order',
  // Read by the pages through the Local API with the tenant filter, like the industries.
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
      type: 'row',
      fields: [
        {
          name: 'name',
          label: 'Nazwa (zakładka)',
          type: 'text',
          required: true,
          maxLength: 30,
        },
        { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 80 },
      ],
    },
    slugField('floor-plans', 'sklep'),
    orderField,
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    {
      name: 'iconPath',
      label: 'Ikona (ścieżka SVG)',
      type: 'text',
      validate: validateIconPath,
      admin: { description: 'Atrybut „d” ikony 24×24, np. „M3 9l2-5h14l2 5”.' },
    },
    {
      name: 'viewBox',
      label: 'Układ współrzędnych',
      type: 'text',
      required: true,
      defaultValue: '0 0 1600 820',
      validate: (value: unknown) =>
        typeof value === 'string' && /^0 0 \d{1,5} \d{1,5}$/.test(value)
          ? true
          : 'Cztery liczby jak w „viewBox” rzutu, np. „0 0 1600 820”.',
      admin: { description: 'Punkty (x, y) liczą się w tym układzie.' },
    },
    {
      name: 'svg',
      label: 'Rzut (kod SVG)',
      type: 'textarea',
      required: true,
      validate: validateSvg,
      admin: {
        description:
          'Kod SVG rzutu, od „<svg” do „</svg>”. Wygląd z klas CSS strony — bez stylów i skryptów w pliku.',
      },
    },
    {
      name: 'points',
      label: 'Punkty',
      type: 'array',
      labels: { singular: 'Punkt', plural: 'Punkty' },
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'x', label: 'x', type: 'number', required: true, min: 0 },
            { name: 'y', label: 'y', type: 'number', required: true, min: 0 },
            {
              name: 'product',
              label: 'Produkt',
              type: 'relationship',
              relationTo: 'products',
              // Not required: deleting a card must not fail on the plan; a point without a
              // card is not shown (K31d). The import links every point (K31a-2 test).
              admin: { description: 'Punkt bez produktu nie pokazuje się na planie.' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Etykieta', type: 'text', required: true, maxLength: 60 },
            {
              name: 'description',
              label: 'Rola w tym miejscu',
              type: 'text',
              maxLength: 120,
            },
          ],
        },
      ],
    },
  ],
}
