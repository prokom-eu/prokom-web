import type { CollectionConfig } from 'payload'

import { adminOnly } from '../../lib/auth/access'
import { validateCooperation } from '../../lib/prokom/cooperation'
import { validateDeliveries } from '../../lib/prokom/deliveries'
import { HUB_OPTIONAL_PAGES } from '../../lib/prokom/pages'
import { onlyLineTenant } from '../../lib/tenant/onlyLine'
import { revalidateHub, revalidateHubAfterDelete } from './common'

/**
 * Settings of pro-kom.eu (ADR-H002 §2), one document per tenant — like `BiznesSettings`: page
 * switches of v1.1, the company facts, and the texts of „Inwestycje i dostawy” and „Współpraca”
 * as JSON checked by a schema (the pattern of `SoftwareSettings.home`, ADR-H002 „Rozstrzygnięcia
 * H1” pkt 8). Other page groups (`home`, `about`, …) come with their pages (H2–H5). No drafts
 * (like `SiteSettings`): a fact without „Zatwierdzone” stays off the production site.
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
    afterDelete: [revalidateHubAfterDelete],
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
      name: 'deliveries',
      label: 'Inwestycje i dostawy (JSON)',
      type: 'json',
      validate: validateDeliveries,
      admin: {
        description:
          'Segmenty z formularzem, lista zapytania (klucze pozycji!), usługi, terminy, obiekty z przykładowymi ilościami, zakres, FAQ. Bez cen; konfiguracja, montaż i szkolenie tylko jako opcja.',
      },
    },
    {
      name: 'cooperation',
      label: 'Współpraca (JSON)',
      type: 'json',
      validate: validateCooperation,
      admin: {
        description:
          'Role z formularzem, etapy, zakres, dostawcy, zasady, FAQ. Telefon roli bierze się z jej linii — nie wpisuj numerów.',
      },
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
