import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { adminOnly } from '../../lib/auth/access'
import { revalidatePageTags } from '../../lib/pages/revalidate'
import { HUB_OPTIONAL_PAGES } from '../../lib/prokom/pages'
import { hubTag } from '../../lib/prokom/tags'
import { tenantIdOf } from '../../lib/tenant/id'
import { onlyLineTenant } from '../../lib/tenant/onlyLine'

const revalidateHub: CollectionAfterChangeHook = ({ doc, req }) => {
  const tenantId = tenantIdOf(doc?.tenant)
  if (!req.context.seed && tenantId !== null) revalidatePageTags([hubTag(tenantId)], req.payload)
  return doc
}

/**
 * Settings of pro-kom.eu (ADR-H002 §2), one document per tenant — like `BiznesSettings`. H1 brings
 * the groups the shell needs: page switches of v1.1 and the company facts. The page groups
 * (`deliveries`, `cooperation`, `home`, …) come with their pages (H1-1c, H2–H5), each with an
 * additive migration. No drafts (like `SiteSettings`): a fact without „Zatwierdzone” stays off the
 * production site.
 */
export const HubSettings: CollectionConfig = {
  slug: 'hub-settings',
  labels: { singular: 'Ustawienia pro-kom.eu', plural: 'Ustawienia pro-kom.eu' },
  admin: { group: 'pro-kom.eu', useAsTitle: 'id' },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  hooks: {
    beforeValidate: [
      onlyLineTenant('prokom', 'Ustawienia pro-kom.eu są tylko na stronie pro-kom.eu.'),
    ],
    afterChange: [revalidateHub],
  },
  fields: [
    {
      name: 'pages',
      label: 'Strony wersji 1.1',
      type: 'group',
      admin: {
        description:
          'Włącz stronę dopiero, gdy jest gotowa. Wyłączona = brak linków w menu, stopce i wyszukiwarce.',
      },
      fields: HUB_OPTIONAL_PAGES.map(({ key, path, label }) => ({
        name: key,
        label: `${label} (${path})`,
        type: 'checkbox' as const,
        defaultValue: false,
      })),
    },
    {
      name: 'trust',
      label: 'Fakty o firmie (liczby, autoryzacje)',
      type: 'array',
      admin: {
        description:
          'Na produkcji widać tylko zatwierdzone fakty (spec §3). Źródło jest wewnętrzne — nie pokazujemy go.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', label: 'Wartość', type: 'text', required: true, maxLength: 40 },
            { name: 'label', label: 'Opis', type: 'text', required: true, maxLength: 80 },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'source', label: 'Źródło (wewnętrzne)', type: 'text' },
            { name: 'approved', label: 'Zatwierdzone', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
  ],
}
