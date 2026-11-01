import type { CollectionConfig } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { SETTINGS_DEFAULTS } from '../lib/instalacje/options'
import { toWhatsAppHref } from '../lib/site/link'
import { onlyLineTenant } from '../lib/tenant/onlyLine'

/**
 * Promises and switches of the Instalacje site — one document per tenant (plugin `isGlobal`),
 * like `BiznesSettings` / `SoftwareSettings` (ADR-I002 §3). Phone and e-mail stay in
 * `SiteSettings`; a change of the boss's decision is one edit here.
 */
export const InstalacjeSettings: CollectionConfig = {
  slug: 'instalacje-settings',
  labels: { singular: 'Ustawienia Instalacji', plural: 'Ustawienia Instalacji' },
  admin: { group: 'Instalacje' },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  hooks: {
    beforeValidate: [
      onlyLineTenant('instalacje', 'Ustawienia Instalacji mają tylko strony linii Instalacje.'),
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'showPrices',
          label: 'Pokaż ceny „od”',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Jeden przełącznik dla kafli i zestawów wszystkich usług.' },
        },
        {
          name: 'noPriceText',
          label: 'Tekst zamiast ceny',
          type: 'text',
          required: true,
          defaultValue: SETTINGS_DEFAULTS.noPriceText,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'warrantyMonths',
          label: 'Gwarancja na montaż (mies.)',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: SETTINGS_DEFAULTS.warrantyMonths,
        },
        {
          name: 'whatsapp',
          label: 'WhatsApp',
          type: 'text',
          validate: (value: unknown) =>
            !value || (typeof value === 'string' && toWhatsAppHref(value) !== null)
              ? true
              : 'Numer telefonu, np. +48 889 003 889.',
          admin: { description: 'Numer z kierunkowym, np. +48 889 003 889.' },
        },
      ],
    },
    {
      name: 'responseText',
      label: 'Obietnica odpowiedzi',
      type: 'textarea',
      required: true,
      defaultValue: SETTINGS_DEFAULTS.responseText,
      admin: { description: '„24 h” to odpowiedź na zgłoszenie, nie przyjazd (spec §2).' },
    },
    {
      // „Twój opiekun” on /dla-architektow (ADR-I005 §1). Empty name → the section is hidden.
      name: 'architects',
      label: 'Opiekun architektów (strona /dla-architektow)',
      type: 'group',
      admin: {
        description:
          'Bez imienia i nazwiska sekcja „Twój opiekun” się nie pokazuje. Znaczniki [SZEF…] nie trafiają na stronę.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', label: 'Imię i nazwisko', type: 'text', maxLength: 80 },
            { name: 'role', label: 'Rola (pod imieniem)', type: 'text', maxLength: 120 },
          ],
        },
        { name: 'photo', label: 'Zdjęcie', type: 'upload', relationTo: 'media' },
        {
          type: 'row',
          fields: [
            {
              name: 'phone',
              label: 'Telefon',
              type: 'text',
              maxLength: 30,
              admin: { description: 'Puste = telefon strony.' },
            },
            { name: 'email', label: 'E-mail', type: 'email' },
          ],
        },
        { name: 'quote', label: 'Cytat', type: 'textarea', maxLength: 300 },
        {
          name: 'responseText',
          label: 'Obietnica odpowiedzi',
          type: 'text',
          maxLength: 120,
          admin: { description: 'Np. „Odpowiadamy do 24 h w dni robocze.”' },
        },
      ],
    },
  ],
}
