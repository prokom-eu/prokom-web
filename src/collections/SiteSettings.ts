import type { CollectionConfig, Field } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { tenantImageFilter } from '../lib/media/access'
import { DEPARTMENTS } from '../lib/site/departments'
import { isValidNavHref, toWhatsAppHref } from '../lib/site/link'
import { isValidTitleTemplate } from '../lib/site/title'
import { FACT_KEY } from '../lib/software/facts'
import { validateNavigation } from '../lib/software/navigation'
import { LINES } from '../lib/tenant/lines'
import { copyTenantLine, onLine } from '../lib/tenant/copyLine'
import { biznesFooter } from './biznesFooter'
import { biznesNavigation } from './biznesNavigation'

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

const isBiznes = onLine('biznes')

const text = (name: string, label: string, description?: string): Field => ({
  name,
  label,
  type: 'textarea',
  ...(description && { admin: { description } }),
})

/**
 * Data of the Biznes line (ADR-012, rozstrzygnięcie 2). Shown in the panel only for Biznes;
 * the public reader ignores it on other lines (`toPublicSiteSettings` with the tenant's line). [SZEF] = the boss's
 * wording, edited here, never a constant in code (spec. §1).
 */
const biznesGroup: Field = {
  name: 'biznes',
  label: 'Biznes',
  type: 'group',
  admin: { condition: (data) => isBiznes(data) },
  fields: [
    {
      name: 'contactChannels',
      label: 'Kanały kontaktu działów',
      type: 'array',
      admin: { description: 'W nagłówku zostaje jeden numer główny (telefon linii wyżej).' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'department',
              label: 'Dział',
              type: 'select',
              required: true,
              options: [...DEPARTMENTS],
            },
            { name: 'phone', label: 'Telefon', type: 'text' },
            { name: 'email', label: 'E-mail', type: 'email' },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'hours',
              label: 'Godziny',
              type: 'text',
              admin: { placeholder: 'np. pn–pt 8:00–16:00' },
            },
            {
              name: 'showInFooter',
              label: 'Pokaż w stopce',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
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
        {
          name: 'trustLine',
          label: 'Linia zaufania',
          type: 'text',
          admin: {
            description:
              '[SZEF] np. „Autoryzowany serwis Posnet i Elzab · Autoryzowany partner GoPOS i InsERT” (K4-FINAL §1: pełne brzmienie statusów).',
          },
        },
      ],
    },
    {
      name: 'serviceAreas',
      label: 'Miejscowości obsługi',
      type: 'text',
      hasMany: true,
    },
    {
      name: 'promises',
      label: 'Obietnice [SZEF]',
      type: 'group',
      admin: { description: 'Tylko prawdziwe obietnice; pusta = niewidoczna na stronie.' },
      fields: [
        {
          name: 'callbackTime',
          label: 'Czas oddzwonienia',
          type: 'text',
          admin: {
            placeholder: 'np. Oddzwaniamy w ciągu 60 minut',
            description:
              'Krótko, bez „w godzinach pracy” — strona główna dopisuje to sama, w katalogu to tytuł kroku.',
          },
        },
        text('itReview', 'Przegląd IT'),
        text('includedWithRegister', 'W cenie kasy'),
        text('serviceTakeover', 'Przejęcie serwisu'),
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'showReviews',
          label: 'Pokaż opinie klientów',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'showClientLogos',
          label: 'Pokaż logo klientów',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Tylko logo z pisemną zgodą (obrazy bez „Wymaga zgody”).' },
        },
      ],
    },
    biznesNavigation,
    biznesFooter,
  ],
}

const isSoftware = onLine('software')

/**
 * Data of the Software line (ADR-014 §1.4, rozstrz. v20 4–5). Shown in the panel only for
 * Software. Phone and e-mail stay the line's fields above (rozstrz. SW0 4).
 */
const softwareGroup: Field = {
  name: 'software',
  label: 'Software',
  type: 'group',
  admin: { condition: (data) => isSoftware(data) },
  fields: [
    {
      name: 'navigation',
      label: 'Nawigacja (JSON)',
      type: 'json',
      validate: validateNavigation,
      admin: {
        description:
          'Nagłówek, mega menu, stopka, dolny pasek i menu na telefonie, „Twój projekt”. Linki jako [etykieta, adres]. Zapis sprawdza kształt — zmieniaj ostrożnie.',
      },
    },
    {
      name: 'facts',
      label: 'Fakty [SZEF]',
      type: 'array',
      admin: {
        description:
          'Wartości wstawiane w teksty w miejsce [KLUCZ], np. CZAS ODPOWIEDZI → „1 dnia roboczego”. Pusta wartość = zdanie z tym kluczem nie pokazuje się na stronie.',
      },
      validate: (rows: unknown) => {
        const keys = (Array.isArray(rows) ? rows : []).map((row: { key?: string }) =>
          row.key?.trim(),
        )
        const twice = keys.find((value, index) => value && keys.indexOf(value) !== index)
        return twice ? `Klucz „${twice}” jest dwa razy.` : true
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'key',
              label: 'Klucz',
              type: 'text',
              required: true,
              validate: (value: unknown) =>
                typeof value === 'string' && FACT_KEY.test(value.trim())
                  ? true
                  : 'Wielkie litery bez nawiasów, np. CZAS ODPOWIEDZI.',
            },
            { name: 'value', label: 'Wartość', type: 'text' },
          ],
        },
      ],
    },
  ],
}

/**
 * Settings of one site (line). Exactly one document per tenant: the multi-tenant plugin runs
 * this collection with `isGlobal: true`, which makes the tenant field unique.
 */
export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  labels: { singular: 'Ustawienia strony', plural: 'Ustawienia stron' },
  admin: {
    description:
      'Pola linii Biznes i Software pojawiają się w ustawieniach tej linii po pierwszym zapisie.',
  },
  // The plugin limits editors to their own tenants; deleting settings is an admin decision.
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  hooks: { beforeChange: [copyTenantLine] },
  fields: [
    {
      name: 'line',
      label: 'Linia',
      type: 'select',
      options: [...LINES],
      // Always overwritten by `copyTenantLine` on save, whatever the request sends.
      admin: { hidden: true },
    },
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
        {
          name: 'ogImage',
          label: 'Obraz do udostępnień',
          type: 'upload',
          relationTo: 'media',
          filterOptions: tenantImageFilter,
          admin: {
            description: 'Pokazuje się przy linku na Facebooku czy w komunikatorach (1200×630).',
          },
        },
      ],
    },
    biznesGroup,
    softwareGroup,
  ],
}
