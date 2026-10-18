import type { Field, FieldHook, GlobalConfig } from 'payload'

import { isValidNip, isValidTime, normalizeNip } from '../lib/site/company'
import { isValidNavHref } from '../lib/site/link'
import { isValidPromoRange } from '../lib/site/promo'
import { isValidSlug } from '../lib/tenant/uniqueSlug'
import { LINES } from '../lib/tenant/lines'

const DAYS = [
  { label: 'Poniedziałek', value: 'mon' },
  { label: 'Wtorek', value: 'tue' },
  { label: 'Środa', value: 'wed' },
  { label: 'Czwartek', value: 'thu' },
  { label: 'Piątek', value: 'fri' },
  { label: 'Sobota', value: 'sat' },
  { label: 'Niedziela', value: 'sun' },
]

/** Date fields may arrive as ISO strings or `Date` objects during validation. */
const toIsoDate = (value: unknown): string | null =>
  value instanceof Date ? value.toISOString() : typeof value === 'string' ? value : null

const normalizeNipField: FieldHook = ({ value }) =>
  typeof value === 'string' ? normalizeNip(value) : value

const timeField = (name: string, label: string): Field => ({
  name,
  label,
  type: 'text',
  required: true,
  validate: (value: unknown) =>
    typeof value === 'string' && isValidTime(value) ? true : 'Format GG:MM, np. 08:00.',
  admin: { width: '25%' },
})

/**
 * Company data shared by every site (ADR-006): one change here shows on all domains.
 * The public site reads it server-side through `lib/site/data`, never through the API.
 */
export const CompanyData: GlobalConfig = {
  slug: 'company-data',
  label: 'Dane firmy',
  // Admins and editors alike (the boss updates phones and hours); there are no other roles.
  access: {
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: 'name', label: 'Nazwa firmy', type: 'text', required: true },
    {
      name: 'nip',
      label: 'NIP',
      type: 'text',
      required: true,
      hooks: { beforeValidate: [normalizeNipField] },
      validate: (value: unknown) =>
        typeof value === 'string' && isValidNip(value) ? true : 'Niepoprawny NIP.',
    },
    { name: 'email', label: 'E-mail ogólny', type: 'email', required: true },
    {
      name: 'phones',
      label: 'Telefony',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'label', label: 'Opis', type: 'text', admin: { placeholder: 'np. Biuro' } },
        { name: 'number', label: 'Numer', type: 'text', required: true },
      ],
    },
    {
      name: 'locations',
      label: 'Oddziały',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'name', label: 'Nazwa', type: 'text', required: true },
        { name: 'street', label: 'Ulica i numer', type: 'text', required: true },
        {
          type: 'row',
          fields: [
            { name: 'postalCode', label: 'Kod pocztowy', type: 'text', required: true },
            { name: 'city', label: 'Miejscowość', type: 'text', required: true },
          ],
        },
        {
          name: 'hours',
          label: 'Godziny otwarcia',
          type: 'array',
          admin: { description: 'Dni, w które oddział jest zamknięty, pomiń.' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'days',
                  label: 'Dni',
                  type: 'select',
                  hasMany: true,
                  required: true,
                  options: DAYS,
                  admin: { width: '50%' },
                },
                timeField('opens', 'Od'),
                timeField('closes', 'Do'),
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'promoBar',
      label: 'Pasek promocji',
      type: 'group',
      admin: { description: 'Widoczny na wybranych stronach, gdy ma tekst i trwa okres od–do.' },
      fields: [
        { name: 'text', label: 'Tekst', type: 'text' },
        {
          name: 'lines',
          label: 'Na stronach linii',
          type: 'select',
          hasMany: true,
          options: [...LINES],
          admin: { description: 'Puste = na wszystkich stronach.' },
        },
        {
          // A visitor's "close" is remembered per campaign (`pk-sz-closed`, spec. §3.6): a new
          // id shows the bar again to everyone who closed the previous one.
          name: 'campaignId',
          label: 'Id kampanii',
          type: 'text',
          validate: (value: unknown) =>
            !value || (typeof value === 'string' && isValidSlug(value))
              ? true
              : 'Małe litery, cyfry i myślniki, np. „kasy-2026”.',
          admin: { description: 'Zmień przy nowej kampanii, np. „kasy-2026”.' },
        },
        {
          name: 'href',
          label: 'Link',
          type: 'text',
          validate: (value: unknown) =>
            !value || (typeof value === 'string' && isValidNavHref(value))
              ? true
              : 'Ścieżka (/kontakt), adres https://, mailto: albo tel:.',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'startsAt',
              label: 'Od',
              type: 'date',
              admin: { date: { pickerAppearance: 'dayAndTime' } },
            },
            {
              name: 'endsAt',
              label: 'Do',
              type: 'date',
              validate: (
                value: unknown,
                { siblingData }: { siblingData: { startsAt?: unknown } },
              ) =>
                isValidPromoRange(toIsoDate(siblingData.startsAt), toIsoDate(value))
                  ? true
                  : 'Data „Do” musi być późniejsza niż „Od”.',
              admin: { date: { pickerAppearance: 'dayAndTime' } },
            },
          ],
        },
      ],
    },
  ],
}
