import { APIError } from 'payload'
import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { linkGroup } from '../blocks/fields'
import { adminOnly } from '../lib/auth/access'
import { catalogRevalidationHooks } from '../lib/catalog/revalidate'
import { validateWizard } from '../lib/catalog/wizard'
import { tenantIdOf } from '../lib/tenant/id'
import { lineOfTenant } from '../lib/tenant/lineOf'

/** Only a tenant of the Biznes line may have these settings (ADR-012, rozstrzygnięcie 2). */
const onlyBiznesTenant: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  const tenantId = tenantIdOf(data?.tenant ?? originalDoc?.tenant)
  if (tenantId === null) return data // the plugin's tenant field reports the missing tenant
  if ((await lineOfTenant(tenantId, req)) !== 'biznes') {
    throw new APIError('Ustawienia Biznesu mają tylko strony linii Biznes.', 400, null, true)
  }
  return data
}

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
    {
      name: 'search',
      label: 'Wyszukiwarka',
      type: 'group',
      fields: [
        {
          name: 'synonyms',
          label: 'Synonimy',
          type: 'array',
          admin: { description: 'Fraza klienta → słowa, które też szukamy (bez polskich znaków).' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'phrase', label: 'Fraza', type: 'text', required: true },
                {
                  name: 'expansions',
                  label: 'Szukaj też',
                  type: 'text',
                  hasMany: true,
                  required: true,
                },
              ],
            },
          ],
        },
        { name: 'stopWords', label: 'Pomijane słowa', type: 'text', hasMany: true },
        {
          name: 'popular',
          label: 'Popularne wyszukiwania',
          type: 'text',
          hasMany: true,
          maxRows: 12,
        },
      ],
    },
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
