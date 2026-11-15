import type { Block } from 'payload'

/**
 * „Inne linie PRO-KOM” on the Biznes home page (runda 1411, board `Koniec.dc.html`): a tile per
 * sister line with its own short text — never the line's own texts (SEO) — and its address, name,
 * colour and logo from `CompanyData → Linie` (a line not shown there has no tile).
 */
export const BzLinesBlock: Block = {
  slug: 'bzLines',
  interfaceName: 'BzLinesBlock',
  labels: { singular: 'Biznes: inne linie PRO-KOM', plural: 'Biznes: inne linie PRO-KOM' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Nadtytuł', type: 'text' },
        { name: 'heading', label: 'Nagłówek H2', type: 'text', required: true },
      ],
    },
    { name: 'note', label: 'Dopisek po prawej', type: 'text' },
    {
      name: 'lines',
      label: 'Kafle linii',
      type: 'array',
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'line',
              label: 'Linia',
              type: 'select',
              required: true,
              options: [
                { label: 'Instalacje', value: 'instalacje' },
                { label: 'Software', value: 'software' },
                { label: 'Tech', value: 'tech' },
              ],
            },
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 60 },
          ],
        },
        {
          name: 'text',
          label: 'Krótki opis (własny, nie kopiuj tekstów linii)',
          type: 'textarea',
          required: true,
          maxLength: 160,
        },
      ],
    },
  ],
}
