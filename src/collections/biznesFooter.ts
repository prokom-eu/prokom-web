import type { Field } from 'payload'

import { isValidNavHref } from '../lib/site/link'

const links = (name: string, label: string, description: string): Field => ({
  name,
  label,
  type: 'array',
  maxRows: 8,
  admin: { description },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', label: 'Etykieta', type: 'text', required: true },
        {
          name: 'href',
          label: 'Link',
          type: 'text',
          required: true,
          validate: (value: unknown) =>
            typeof value === 'string' && isValidNavHref(value)
              ? true
              : 'Ścieżka (/kontakt), adres https://, mailto: albo tel:.',
        },
      ],
    },
  ],
})

/**
 * Link columns of the Biznes footer (spec. §3.4, `Main` design). The other columns come from
 * data: company and hours (`CompanyData`), offer groups (catalog), contact (`SiteSettings`);
 * the description is `footer.text` and the bottom row `footer.links`, shared with other lines.
 */
export const biznesFooter: Field = {
  name: 'footer',
  label: 'Stopka',
  type: 'group',
  fields: [
    links('important', 'Najważniejsze', 'Np. Opieka IT, GoPOS, InsERT, KSeF 2027, kreator.'),
    links('company', 'Branże i firma', 'Np. branże, O firmie, Aktualności, inne linie PRO-KOM.'),
  ],
}
