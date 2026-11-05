import type { Field, TextField } from 'payload'

import { isValidNavHref } from '../lib/site/link'

/**
 * Shared fields of every line (spec §4.2, ADR-022 „Poprawki w F0”): one definition in
 * `SiteSettings`, one document per tenant, so each line has its own values. The line's phone,
 * second phone, e-mail and footer text are the existing `SiteSettings` fields — not repeated here.
 * Fields of a line's own sections belong to that line's settings (sessions D3), not here.
 */

const MARKER_NOTE = 'Tekst ze znacznikiem [SZEF…] albo [Krystian…] nie pokazuje się na stronie.'

const href = (name = 'href', required = true): Field => ({
  name,
  label: 'Link',
  type: 'text',
  required,
  validate: (value: unknown) =>
    (!required && !value) || (typeof value === 'string' && isValidNavHref(value))
      ? true
      : 'Ścieżka (/kontakt), adres https://, mailto: albo tel:.',
})

const text = (name: string, label: string, required = false): TextField => ({
  name,
  label,
  type: 'text',
  required,
})

const textarea = (name: string, label: string): Field => ({ name, label, type: 'textarea' })

const link = (name: string, label: string): Field => ({
  name,
  label,
  type: 'group',
  fields: [{ type: 'row', fields: [text('label', 'Etykieta'), href('href', false)] }],
})

/** `{ title, text }` rows: steps, rules, „Co dalej”. */
const titled = (name: string, label: string, extra: Field[] = []): Field => ({
  name,
  label,
  type: 'array',
  fields: [text('title', 'Tytuł', true), textarea('text', 'Opis'), ...extra],
})

const railFields: Field[] = [
  {
    name: 'sections',
    label: 'Sekcje strony głównej',
    type: 'array',
    admin: {
      description:
        'W kolejności sekcji strony głównej. Pozycja bez sekcji o tym id na stronie się nie pokazuje.',
    },
    fields: [
      {
        type: 'row',
        fields: [
          text('anchorId', 'Id sekcji', true),
          text('label', 'Etykieta', true),
          { name: 'icon', label: 'Ikona', type: 'text', required: true },
        ],
      },
    ],
  },
  {
    name: 'searchPopular',
    label: 'Najczęściej szukane',
    type: 'text',
    hasMany: true,
  },
  {
    name: 'searchShortcuts',
    label: 'Na skróty',
    type: 'array',
    fields: [{ type: 'row', fields: [text('label', 'Etykieta', true), href()] }],
  },
  {
    name: 'synonyms',
    label: 'Synonimy wyszukiwarki',
    type: 'text',
    hasMany: true,
    admin: { description: 'Grupy słów oddzielone przecinkiem, np. „kamera, monitoring, CCTV”.' },
  },
]

const contactFields: Field[] = [
  text('h1', 'Nagłówek H1'),
  textarea('lead', 'Wstęp'),
  {
    type: 'row',
    fields: [
      text('writeCta', 'Przycisk „Napisz”'),
      {
        name: 'placeKind',
        label: 'Rodzaj miejsca',
        type: 'select',
        options: [
          { label: 'Salon', value: 'salon' },
          { label: 'Spotkanie', value: 'spotkanie' },
          { label: 'Serwis', value: 'serwis' },
        ],
      },
    ],
  },
  {
    name: 'facts',
    label: 'Fakty w hero',
    type: 'array',
    maxRows: 3,
    admin: {
      description:
        'E-mail i telefony linii wybierz jako rodzaj — wartość przyjdzie z pól linii wyżej, bez przepisywania.',
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'kind',
            label: 'Rodzaj',
            type: 'select',
            required: true,
            defaultValue: 'text',
            options: [
              { label: 'Tekst', value: 'text' },
              { label: 'E-mail linii', value: 'email' },
              { label: 'Telefon linii', value: 'phone' },
              { label: 'Drugi telefon linii', value: 'phone2' },
            ],
          },
          text('label', 'Etykieta', true),
          {
            ...text('value', 'Wartość'),
            admin: { condition: (_data, sibling) => sibling?.kind === 'text' },
          },
          text('icon', 'Ikona'),
        ],
      },
    ],
  },
  {
    name: 'routes',
    label: 'Z czym dzwonisz?',
    type: 'array',
    maxRows: 3,
    fields: [
      text('title', 'Tytuł', true),
      textarea('text', 'Opis'),
      { type: 'row', fields: [text('cta', 'Przycisk'), href('href', false)] },
    ],
  },
  { name: 'topics', label: 'Tematy formularza (chipy)', type: 'text', hasMany: true },
  text('formTitle', 'Tytuł formularza'),
  text('placeholder', 'Podpowiedź w polu wiadomości'),
  text('sendLabel', 'Przycisk wysyłki'),
  titled('nextSteps', 'Co dalej po wysłaniu'),
  text('mapTitle', 'Dojazd — tytuł'),
  textarea('mapLead', 'Dojazd — wstęp'),
  {
    name: 'salonKeys',
    label: 'Salony linii (klucze z Danych firmy)',
    type: 'text',
    hasMany: true,
    admin: { description: 'Np. „rabka”. Pokazujemy tylko opublikowane salony.' },
  },
  {
    name: 'faq',
    label: 'Pytania',
    type: 'array',
    fields: [text('question', 'Pytanie', true), textarea('answer', 'Odpowiedź')],
  },
]

const aboutFields: Field[] = [
  text('h1', 'Nagłówek H1'),
  textarea('lead', 'Wstęp'),
  text('authTitle', 'Tytuł autoryzacji'),
  { name: 'auth', label: 'Autoryzacje (plakietki)', type: 'text', hasMany: true },
  {
    name: 'stats',
    label: 'Liczby linii',
    type: 'array',
    maxRows: 2,
    fields: [
      {
        type: 'row',
        fields: [
          text('value', 'Liczba', true),
          text('label', 'Opis', true),
          {
            name: 'flag',
            label: 'Plakietka',
            type: 'text',
            admin: {
              description:
                'Np. „do potwierdzenia przez szefa” — liczba z plakietką nie idzie na produkcję.',
            },
          },
        ],
      },
    ],
  },
  titled('rules', 'Zasady („Dlaczego PRO-KOM”)'),
  titled('steps', 'Krok po kroku'),
  titled('verify', 'Sprawdź nas', [href('href', false)]),
  textarea('visitText', 'Zaproszenie do salonu'),
]

export const sharedLineFields: Field = {
  name: 'shared',
  label: 'Wspólne elementy linii',
  type: 'group',
  admin: {
    description: `Pasek marki, nagłówek, telefon, szyna, stopka, Kontakt i O firmie (spec elementów wspólnych §4.2). ${MARKER_NOTE}`,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { ...text('phoneLabel', 'Opis telefonu'), admin: { placeholder: 'np. Biznes:' } },
        {
          ...text('hours', 'Godziny linii'),
          admin: { description: 'Puste = godziny z Danych firmy.' },
        },
      ],
    },
    {
      ...text('responsePromise', 'Obietnica odpowiedzi'),
      admin: { description: 'Krótko, pod przyciskiem formularza i w stopce.' },
    },
    link('brandBarSlot', 'Pasek marki — odnośnik linii'),
    {
      name: 'headerCta',
      label: 'Nagłówek — przycisk',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            text('label', 'Etykieta'),
            href('href', false),
            {
              name: 'counter',
              label: 'Licznik',
              type: 'select',
              defaultValue: 'none',
              options: [
                { label: 'Brak', value: 'none' },
                { label: 'Zapytanie', value: 'inquiry' },
                { label: 'Twój projekt', value: 'project' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'tabBar',
      label: 'Dolny pasek na telefonie',
      type: 'group',
      admin: { description: 'Start, Kontakt i Menu są stałe.' },
      fields: [
        link('second', 'Druga pozycja'),
        {
          name: 'center',
          label: 'Środek (wyróżniony)',
          type: 'group',
          fields: [
            {
              type: 'row',
              fields: [text('label', 'Etykieta'), href('href', false), text('icon', 'Ikona')],
            },
          ],
        },
      ],
    },
    { name: 'rail', label: 'Boczna szyna i wyszukiwarka', type: 'group', fields: railFields },
    {
      name: 'footerPromises',
      label: 'Stopka — obietnice',
      type: 'text',
      hasMany: true,
      maxRows: 3,
    },
    {
      name: 'footerColumns',
      label: 'Stopka — kolumny linków',
      type: 'array',
      maxRows: 4,
      fields: [
        text('heading', 'Nagłówek', true),
        {
          name: 'links',
          label: 'Linki',
          type: 'array',
          fields: [{ type: 'row', fields: [text('label', 'Etykieta', true), href()] }],
        },
      ],
    },
    text('legalNote', 'Stopka — druga linijka paska prawnego'),
    { name: 'contact', label: 'Kontakt (szablon)', type: 'group', fields: contactFields },
    { name: 'about', label: 'O firmie (szablon)', type: 'group', fields: aboutFields },
  ],
}
