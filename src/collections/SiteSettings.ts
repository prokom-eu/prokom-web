import type { CollectionConfig, Field } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { isValidNavHref } from '../lib/site/link'
import { isValidTitleTemplate } from '../lib/site/title'

const linkFields: Field[] = [
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
]

/**
 * Settings of one site (line). Exactly one document per tenant: the multi-tenant plugin runs
 * this collection with `isGlobal: true`, which makes the tenant field unique.
 */
export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  labels: { singular: 'Ustawienia strony', plural: 'Ustawienia stron' },
  // The plugin limits editors to their own tenants; deleting settings is an admin decision.
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'phone', label: 'Telefon linii', type: 'text' },
        { name: 'email', label: 'E-mail linii', type: 'email' },
      ],
    },
    { name: 'navigation', label: 'Nawigacja', type: 'array', maxRows: 8, fields: linkFields },
    {
      name: 'footer',
      label: 'Stopka linii',
      type: 'group',
      fields: [
        { name: 'text', label: 'Tekst', type: 'textarea' },
        { name: 'links', label: 'Linki', type: 'array', maxRows: 12, fields: linkFields },
      ],
    },
    {
      name: 'seo',
      label: 'Domyślne SEO',
      type: 'group',
      fields: [
        {
          name: 'titleTemplate',
          label: 'Szablon tytułu',
          type: 'text',
          validate: (value: unknown) =>
            !value || (typeof value === 'string' && isValidTitleTemplate(value))
              ? true
              : 'Szablon musi zawierać dokładnie jedno %s, np. „%s | PRO-KOM Biznes”.',
          admin: { description: '%s zastępuje tytuł podstrony, np. „%s | PRO-KOM Biznes”.' },
        },
        {
          name: 'description',
          label: 'Opis',
          type: 'textarea',
          maxLength: 160,
          admin: { description: 'Domyślny opis w wynikach wyszukiwania (do 160 znaków).' },
        },
        // TODO(S7): default OG image — needs the Media collection.
      ],
    },
  ],
}
