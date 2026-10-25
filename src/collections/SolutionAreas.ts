import type { CollectionConfig } from 'payload'

import { linkGroup } from '../blocks/fields'
import { adminOnly } from '../lib/auth/access'
import { ICON_OPTIONS } from '../lib/catalog/options'
import { AREA_KEYS } from '../lib/software/options'
import { onlyLineTenant } from '../lib/tenant/onlyLine'
import { orderField } from './catalogFields'

/**
 * The 8 areas of the Software start page (ADR-014 §1.2) — a marketing grouping, not the catalog
 * categories, so their labels and prices are typed here, not counted. The tile gradient follows
 * the key (`--grad-area-<key>`, ADR-015 rozstrz. 4): one source, no colour field.
 */
export const SolutionAreas: CollectionConfig = {
  slug: 'solution-areas',
  labels: { singular: 'Obszar', plural: 'Obszary' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'key', 'order'],
    group: 'Software',
  },
  defaultSort: 'order',
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  hooks: {
    beforeValidate: [onlyLineTenant('software', 'Obszary mają tylko strony linii Software.')],
  },
  indexes: [{ fields: ['tenant', 'key'], unique: true }],
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', label: 'Nazwa', type: 'text', required: true },
        {
          name: 'key',
          label: 'Obszar',
          type: 'select',
          required: true,
          options: [...AREA_KEYS],
          admin: { description: 'Wybiera kolor kafla i ilustrację.' },
        },
        { name: 'icon', label: 'Ikona', type: 'select', options: ICON_OPTIONS },
      ],
    },
    { name: 'short', label: 'Krótki opis', type: 'text', maxLength: 80 },
    { name: 'description', label: 'Opis', type: 'textarea', maxLength: 300 },
    { name: 'gain', label: 'Co zyskujesz', type: 'textarea', maxLength: 200 },
    {
      type: 'row',
      fields: [
        {
          name: 'countLabel',
          label: 'Podpis liczby',
          type: 'text',
          maxLength: 30,
          admin: { description: 'Tekst, nie licznik, np. „7 rozwiązań”, „3 poziomy”.' },
        },
        {
          name: 'priceFrom',
          label: 'Cena od (zł netto)',
          type: 'number',
          min: 0,
        },
        {
          name: 'priceLabel',
          label: 'Podpis ceny',
          type: 'text',
          maxLength: 40,
          admin: {
            description:
              'Wygrywa z liczbą, np. „od 149 zł / mies.”. Pusty = „od {cena} zł” z ceny obok; oba puste = „Zapytaj o wycenę”.',
          },
        },
      ],
    },
    {
      name: 'chips',
      label: 'Pozycje',
      type: 'array',
      admin: { description: 'Pozycja bez rozwiązania nie jest linkiem (np. PWA).' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Etykieta', type: 'text', required: true, maxLength: 40 },
            {
              name: 'solution',
              label: 'Rozwiązanie',
              type: 'relationship',
              relationTo: 'solutions',
            },
          ],
        },
      ],
    },
    linkGroup('cta', 'Przycisk'),
    orderField,
  ],
}
