import { APIError } from 'payload'
import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { adminOnly } from '../lib/auth/access'
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
 * Search and wizard configuration of the Biznes site — one document per tenant (plugin
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
  hooks: { beforeValidate: [onlyBiznesTenant] },
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
