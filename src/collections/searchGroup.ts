import type { Field } from 'payload'

/**
 * Search settings of a line (`BiznesSettings.search`, `SoftwareSettings.search`): one search
 * engine for both lines (`lib/search.ts`, ADR-014 §4), so one shape of its settings.
 */
export const searchGroup: Field = {
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
}
