import type { Field } from 'payload'

import { isValidNavHref } from '../lib/site/link'
import {
  DEFAULT_COLUMN_LIMIT,
  duplicateDropdownError,
  MENU_ITEM_TYPES,
  menuItemHrefError,
  type MenuItemType,
} from '../lib/site/navigation'
import { brandFilter, imageField } from './catalogFields'

const hrefField: Field = {
  name: 'href',
  label: 'Link',
  type: 'text',
  required: true,
  validate: (value: unknown) =>
    typeof value === 'string' && isValidNavHref(value)
      ? true
      : 'Ścieżka (/kontakt), adres https://, mailto: albo tel:.',
}

const labelField: Field = { name: 'label', label: 'Etykieta', type: 'text', required: true }

/**
 * `nawigacja` of ADR-012 (spec. §3.2), inside `SiteSettings.biznes`. Relations to the catalog
 * are narrowed to the tenant by the multi-tenant plugin; images and partners by `filterOptions`.
 * The public reader re-checks all of them (`toPublicNavigation`).
 */
export const biznesNavigation: Field = {
  name: 'navigation',
  label: 'Nawigacja',
  type: 'group',
  admin: { description: 'Nagłówek: kolejność menu i mega menu Oferta.' },
  fields: [
    {
      name: 'menu',
      label: 'Menu',
      type: 'array',
      maxRows: 10,
      admin: { description: 'Kolejność pozycji w nagłówku i w menu na telefonie.' },
      validate: (rows: unknown) =>
        duplicateDropdownError(
          (Array.isArray(rows) ? rows : []).map(
            (row: { type?: MenuItemType }) => row.type ?? 'link',
          ),
        ) ?? true,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'type',
              label: 'Rodzaj',
              type: 'select',
              required: true,
              defaultValue: 'link',
              options: [...MENU_ITEM_TYPES],
            },
            labelField,
            {
              name: 'href',
              label: 'Link',
              type: 'text',
              admin: { description: 'Wymagany dla zwykłej pozycji.' },
              validate: (value: unknown, { siblingData }: { siblingData: { type?: unknown } }) =>
                menuItemHrefError(
                  (siblingData.type ?? 'link') as MenuItemType,
                  typeof value === 'string' ? value : null,
                ) ?? true,
            },
            {
              name: 'partner',
              label: 'Kropka „partner”',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
      ],
    },
    {
      // Unused since the K4 mega menu (v147c: shortcuts are fixed cards). Hidden until a
      // migration drops the column (STAN „Pomysły na później”).
      name: 'shortcuts',
      label: 'Na skróty (mega menu)',
      type: 'array',
      maxRows: 6,
      admin: { hidden: true },
      fields: [{ type: 'row', fields: [labelField, hrefField] }],
    },
    {
      name: 'columnLimit',
      label: 'Kategorii w kolumnie',
      type: 'number',
      min: 3,
      max: 12,
      defaultValue: DEFAULT_COLUMN_LIMIT,
      admin: {
        description:
          'Dalej link „Wszystkie w grupie →” (czytelność: mniej pozycji, nie mniejsza czcionka).',
      },
    },
    {
      name: 'highlights',
      label: 'Wyróżnione na górze kolumny',
      type: 'array',
      maxRows: 10,
      admin: { description: 'Np. GoPOS „partner” w Oprogramowaniu, Opieka IT „abonament”.' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'group',
              label: 'Grupa',
              type: 'relationship',
              relationTo: 'catalog-groups',
              required: true,
            },
            labelField,
            hrefField,
            { name: 'badge', label: 'Etykieta obok', type: 'text' },
          ],
        },
      ],
    },
    {
      // Unused since the K4 mega menu (v147c), like `shortcuts`.
      name: 'cards',
      label: 'Karty w mega menu',
      type: 'array',
      maxRows: 2,
      admin: { hidden: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Tytuł', type: 'text', required: true },
            hrefField,
            { name: 'badge', label: 'Etykieta', type: 'text' },
          ],
        },
        { name: 'text', label: 'Opis', type: 'textarea' },
        {
          type: 'row',
          fields: [
            {
              name: 'partner',
              label: 'Logo partnera',
              type: 'relationship',
              relationTo: 'partners',
              filterOptions: brandFilter,
            },
            imageField('image', 'Obraz'),
            { name: 'dark', label: 'Ciemna karta', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
  ],
}
