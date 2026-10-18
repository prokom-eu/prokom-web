import type { CollectionBeforeChangeHook, CollectionConfig, Field } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { tenantImageFilter } from '../lib/media/access'
import { DEPARTMENTS } from '../lib/site/departments'
import { isValidNavHref, toWhatsAppHref } from '../lib/site/link'
import { isValidTitleTemplate } from '../lib/site/title'
import { tenantIdOf } from '../lib/tenant/id'
import { LINES } from '../lib/tenant/lines'
import { lineOfTenant } from '../lib/tenant/lineOf'
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

/**
 * Copy of the tenant's line for the panel only: `admin.condition` is synchronous and sees just
 * this document, so it shows the Biznes fields from here. Set on every save. The public site
 * never trusts it — it uses the tenant's own line (`getSiteSettings`).
 */
const copyTenantLine: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const tenantId = tenantIdOf(data.tenant ?? originalDoc?.tenant)
  if (tenantId === null) return data
  return { ...data, line: await lineOfTenant(tenantId, req) }
}

const isBiznes = (data: { line?: unknown } | undefined) => data?.line === 'biznes'

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
          admin: { description: '[SZEF] np. „Serwis Posnet i Elzab · partner GoPOS i InsERT”.' },
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
          admin: { placeholder: 'np. Oddzwonimy w 60 minut' },
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

/**
 * Settings of one site (line). Exactly one document per tenant: the multi-tenant plugin runs
 * this collection with `isGlobal: true`, which makes the tenant field unique.
 */
export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  labels: { singular: 'Ustawienia strony', plural: 'Ustawienia stron' },
  admin: {
    description: 'Pola linii Biznes pojawiają się w ustawieniach Biznesu po pierwszym zapisie.',
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
  ],
}
