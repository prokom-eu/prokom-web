import type { CollectionConfig } from 'payload'

import { linkGroup } from '../blocks/fields'
import { adminOnly } from '../lib/auth/access'
import { catalogRevalidationHooks } from '../lib/catalog/revalidate'
import { validateIconPath } from '../lib/catalog/svg'
import { validateWizard } from '../lib/catalog/wizard'
import { onlyLineTenant } from '../lib/tenant/onlyLine'
import { brandFilter } from './catalogFields'
import { searchGroup } from './searchGroup'

/** Only a tenant of the Biznes line may have these settings (ADR-012, rozstrzygnięcie 2). */
const onlyBiznesTenant = onlyLineTenant(
  'biznes',
  'Ustawienia Biznesu mają tylko strony linii Biznes.',
)

/**
 * Search, news and wizard configuration of the Biznes site — one document per tenant (plugin
 * `isGlobal`), kept apart so `SiteSettings` of other lines does not grow (ADR-012).
 */
export const BiznesSettings: CollectionConfig = {
  slug: 'biznes-settings',
  labels: { singular: 'Ustawienia Biznesu', plural: 'Ustawienia Biznesu' },
  admin: { group: 'Katalog' },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  hooks: { beforeValidate: [onlyBiznesTenant], ...catalogRevalidationHooks },
  fields: [
    searchGroup,
    {
      name: 'news',
      label: 'Aktualności',
      type: 'group',
      fields: [
        {
          name: 'ksef',
          label: 'Panel KSeF nad listą wpisów',
          type: 'group',
          admin: {
            description:
              'Licznik dni, tekst i kroki (plansza Aktualności). Bez daty i podpisu panel się nie pokazuje. Fakty prawne tylko ze źródłem — w notce albo we wpisie, do którego prowadzi przycisk.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 60 },
                {
                  name: 'date',
                  label: 'Licznik dni do daty',
                  type: 'date',
                  admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' } },
                },
                {
                  name: 'dateLabel',
                  label: 'Podpis pod liczbą',
                  type: 'text',
                  maxLength: 40,
                  admin: { description: 'Np. „dni do 1 stycznia 2027”.' },
                },
              ],
            },
            { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 400 },
            linkGroup('link', 'Przycisk główny'),
            linkGroup('secondaryLink', 'Przycisk drugi'),
            {
              name: 'steps',
              label: 'Kroki',
              type: 'array',
              maxRows: 6,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 40 },
                    { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 160 },
                  ],
                },
              ],
            },
            {
              name: 'note',
              label: 'Notka pod krokami',
              type: 'textarea',
              maxLength: 400,
              admin: { description: 'Stan prawny i data sprawdzenia, np. „stan na 15.10.2026”.' },
            },
          ],
        },
      ],
    },
    {
      // K4 (`marki-k4.json`): per site, as `Partners` is shared; a brand may sit in two groups
      // (Samsung: computers and screens).
      name: 'brands',
      label: 'Marki',
      type: 'group',
      fields: [
        {
          name: 'home',
          label: 'Marki na stronie głównej',
          type: 'relationship',
          relationTo: 'partners',
          hasMany: true,
          filterOptions: brandFilter,
          admin: { description: 'W tej kolejności; obok kafel „Zobacz wszystkie”.' },
        },
        {
          name: 'groups',
          label: 'Grupy na stronie „Marki”',
          type: 'array',
          labels: { singular: 'Grupa', plural: 'Grupy' },
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
            { name: 'description', label: 'Opis', type: 'text', maxLength: 120 },
            {
              name: 'partners',
              label: 'Marki',
              type: 'relationship',
              relationTo: 'partners',
              hasMany: true,
              filterOptions: brandFilter,
            },
          ],
        },
      ],
    },
    {
      name: 'wizard',
      label: 'Reguły kreatora',
      type: 'json',
      validate: validateWizard,
      admin: {
        description:
          'Rodzaje firm, potrzeby, propozycje i plakietki kreatora (/kreator). Zmieniaj ostrożnie — zapis sprawdza, czy reguły się zgadzają.',
      },
    },
  ],
}
