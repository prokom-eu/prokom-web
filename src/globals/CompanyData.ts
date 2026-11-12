import type { Field, FieldHook, GlobalConfig } from 'payload'

import { isValidNip, isValidTime, normalizeNip } from '../lib/site/company'
import { isValidNavHref } from '../lib/site/link'
import { isValidPromoRange } from '../lib/site/promo'
import { isValidSlug } from '../lib/tenant/uniqueSlug'
import { LINES } from '../lib/tenant/lines'
import { SHARED_LINE_KEYS } from '../lib/shared/lines'

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

const geoGroup: Field = {
  name: 'geo',
  label: 'Położenie (mapa)',
  type: 'group',
  admin: { description: 'Z OpenStreetMap, np. 49.6086 i 19.9602.' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'lat', label: 'Szerokość', type: 'number', min: -90, max: 90 },
        { name: 'lng', label: 'Długość', type: 'number', min: -180, max: 180 },
      ],
    },
  ],
}

const httpsUrl = (value: unknown): true | string =>
  !value || (typeof value === 'string' && /^https:\/\/\S+$/.test(value)) ? true : 'Adres https://…'

const pathField = (name: string, label: string, defaultValue: string): Field => ({
  name,
  label,
  type: 'text',
  defaultValue,
  validate: (value: unknown) =>
    !value || (typeof value === 'string' && /^\/[a-z0-9-/]*$/.test(value))
      ? true
      : 'Ścieżka, np. /cookies.',
})

/** Shared facts of the company (spec §4.1): one copy for every line's bar, footer and pages. */
const companyFields: Field[] = [
  {
    type: 'row',
    fields: [
      { name: 'mapsUrl', label: 'Link „Wyznacz trasę”', type: 'text', validate: httpsUrl },
      { name: 'ceidgUrl', label: 'Link do CEIDG', type: 'text', validate: httpsUrl },
    ],
  },
  {
    name: 'legal',
    label: 'Strony prawne (te same ścieżki na wszystkich stronach linii)',
    type: 'group',
    fields: [
      {
        type: 'row',
        fields: [
          pathField('privacy', 'Polityka prywatności', '/polityka-prywatnosci'),
          pathField('cookies', 'Cookies', '/cookies'),
          pathField('accessibility', 'Dostępność', '/dostepnosc'),
          pathField('sitemap', 'Mapa strony', '/mapa-strony'),
        ],
      },
    ],
  },
  {
    name: 'consent',
    label: 'Zgoda w formularzach',
    type: 'group',
    admin: {
      description:
        'Jeszcze nie działa: formularze pokazują klauzulę z kodu i zawsze pole do zaznaczenia (ADR-022 „Rozstrzygnięcia D2-3a”). Nie zmieniaj przed opinią prawnika i osobnym ADR.',
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'mode',
            label: 'Tryb',
            type: 'select',
            defaultValue: 'checkbox',
            options: [
              { label: 'Pole do zaznaczenia', value: 'checkbox' },
              { label: 'Klauzula informacyjna', value: 'info' },
            ],
          },
          { name: 'version', label: 'Wersja klauzuli', type: 'text' },
        ],
      },
      { name: 'clause', label: 'Treść klauzuli', type: 'textarea' },
    ],
  },
  {
    name: 'recentlyViewed',
    label: 'Ostatnio oglądane w wyszukiwarce',
    type: 'checkbox',
    defaultValue: false,
    admin: { description: 'Włącz dopiero po opinii prawnika (zapis na urządzeniu użytkownika).' },
  },
]

const holidaysField: Field = {
  name: 'holidays',
  label: 'Dni zamknięte (święta)',
  type: 'array',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'date', label: 'Data', type: 'date', required: true },
        {
          name: 'label',
          label: 'Opis',
          type: 'text',
          admin: { placeholder: 'np. Boże Narodzenie' },
        },
      ],
    },
  ],
}

const hexColor = (value: unknown): true | string =>
  !value || (typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value)) ? true : 'Kolor #RRGGBB.'

/** Lines and brands of PRO-KOM (spec §4.1): the bar switcher, the lines band, the family. */
const linesField: Field = {
  name: 'lines',
  label: 'Linie i marki',
  type: 'array',
  admin: { description: 'Na stronach tylko opublikowane, w kolejności „Kolejność”.' },
  validate: (rows: unknown) => {
    const keys = (Array.isArray(rows) ? rows : []).map((row: { key?: string }) => row.key)
    const twice = keys.find((key, index) => key && keys.indexOf(key) !== index)
    return twice ? `Linia „${twice}” jest dwa razy.` : true
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'key',
          label: 'Linia',
          type: 'select',
          required: true,
          options: SHARED_LINE_KEYS.map((value) => ({ label: value, value })),
        },
        { name: 'name', label: 'Nazwa', type: 'text', required: true },
        {
          name: 'kind',
          label: 'Rodzaj',
          type: 'select',
          required: true,
          defaultValue: 'linia',
          options: [
            { label: 'Linia', value: 'linia' },
            { label: 'Marka', value: 'marka' },
          ],
        },
        { name: 'order', label: 'Kolejność', type: 'number', required: true, defaultValue: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'domain',
          label: 'Domena',
          type: 'text',
          admin: { placeholder: 'prokombiznes.pl' },
        },
        { name: 'url', label: 'Adres', type: 'text', validate: httpsUrl },
        { name: 'logoLabel', label: 'Napis w znaku', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'color', label: 'Kolor znaku', type: 'text', validate: hexColor },
        { name: 'colorOnDark', label: 'Kolor na ciemnym', type: 'text', validate: hexColor },
        { name: 'published', label: 'Pokazuj', type: 'checkbox', defaultValue: false },
      ],
    },
    { name: 'description', label: 'Opis krótki', type: 'text' },
    { name: 'descriptionLong', label: 'Opis (O firmie)', type: 'textarea' },
  ],
}

/** One list of service zones for every line (spec §4.1): maps, forms, FAQ. */
const serviceZonesField: Field = {
  name: 'serviceZones',
  label: 'Strefy dojazdu',
  type: 'array',
  fields: [
    { name: 'name', label: 'Nazwa strefy', type: 'text', required: true },
    { name: 'towns', label: 'Miejscowości', type: 'text', hasMany: true },
    { name: 'note', label: 'Uwaga', type: 'text' },
  ],
}

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
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Firma',
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
            ...companyFields,
          ],
        },
        {
          label: 'Salony i godziny',
          fields: [
            {
              name: 'locations',
              label: 'Oddziały',
              type: 'array',
              required: true,
              minRows: 1,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', label: 'Nazwa', type: 'text', required: true },
                    {
                      name: 'key',
                      label: 'Klucz',
                      type: 'text',
                      validate: (value: unknown) =>
                        !value || (typeof value === 'string' && isValidSlug(value))
                          ? true
                          : 'Małe litery, cyfry i myślniki, np. „rabka”.',
                      admin: {
                        description: 'Np. „rabka”, „zakopane” — po nim linie wybierają salony.',
                      },
                    },
                    {
                      name: 'published',
                      label: 'Pokazuj na stronach',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: { description: 'Wyłącz, dopóki adres i godziny nie są potwierdzone.' },
                    },
                  ],
                },
                { name: 'street', label: 'Ulica i numer', type: 'text', required: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'postalCode', label: 'Kod pocztowy', type: 'text', required: true },
                    { name: 'city', label: 'Miejscowość', type: 'text', required: true },
                  ],
                },
                geoGroup,
                { name: 'parkingNote', label: 'Parking i wejście', type: 'textarea' },
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
            holidaysField,
          ],
        },
        { label: 'Linie', fields: [linesField] },
        { label: 'Strefy dojazdu', fields: [serviceZonesField] },
        {
          label: 'Pasek promocji',
          fields: [
            {
              name: 'promoBar',
              label: 'Pasek promocji',
              type: 'group',
              admin: {
                description: 'Widoczny na wybranych stronach, gdy ma tekst i trwa okres od–do.',
              },
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
                  admin: {
                    description:
                      'Zmień przy nowej kampanii, np. „kasy-2026”. Bez id paska nie da się zamknąć.',
                  },
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
        },
      ],
    },
  ],
}
