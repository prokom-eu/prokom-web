import type { Block } from 'payload'

/**
 * „Aktualności” on the Biznes home page (plan 0611 §7.1 pkt 12, D8), `#aktualnosci`: the three
 * newest Biznes posts; with fewer, title-only links to the newest posts of Instalacje and
 * Software on their own sites (no copied text — SEO). No posts at all = no section. (Named
 * `bzNewsHome`: the v150 `bzNews` and its tables were removed.)
 */
export const BzNewsHomeBlock: Block = {
  slug: 'bzNewsHome',
  interfaceName: 'BzNewsHomeBlock',
  labels: { singular: 'Biznes: aktualności (3 karty)', plural: 'Biznes: aktualności (3 karty)' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          label: 'Etykieta',
          type: 'text',
          maxLength: 60,
          admin: { description: 'Sekcja ma kotwicę #aktualnosci — blok tylko raz na stronie.' },
        },
        { name: 'heading', label: 'Nagłówek', type: 'text', required: true, maxLength: 90 },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 240 },
    {
      name: 'allLabel',
      label: 'Link do listy',
      type: 'text',
      maxLength: 40,
      admin: { description: 'Np. „Wszystkie aktualności” → /aktualnosci. Pusty = bez linku.' },
    },
  ],
}
