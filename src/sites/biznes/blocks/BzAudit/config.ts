import type { Block } from 'payload'

import { linkGroup } from '../../../../blocks/fields'
import { ICON_OPTIONS } from '../../../../lib/catalog/options'

export const AUDIT_STATES = [
  { label: 'Pilne (czerwony)', value: 'urgent' },
  { label: 'Do poprawy (pomarańczowy)', value: 'fix' },
  { label: 'Do obserwacji (pomarańczowy)', value: 'watch' },
  { label: 'Termin (pomarańczowy)', value: 'term' },
  { label: 'W porządku (zielony)', value: 'ok' },
] as const

/**
 * Free IT audit `#przeglad` (spec. §6.4 pkt 5, plansza Dzial) [SZEF: zakres i raport]: why,
 * three steps, the call to action and a sample report. The report summary is counted from the
 * rows, so it always matches them.
 */
export const BzAuditBlock: Block = {
  slug: 'bzAudit',
  interfaceName: 'BzAuditBlock',
  labels: { singular: 'Biznes: bezpłatny przegląd IT', plural: 'Biznes: bezpłatny przegląd IT' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'badgeValue',
          label: 'Wyróżnik etykiety',
          type: 'text',
          maxLength: 10,
          admin: {
            description: 'Np. „0 zł”. Sekcja ma kotwicę #przeglad — blok tylko raz na stronie.',
          },
        },
        { name: 'badgeLabel', label: 'Etykieta', type: 'text', maxLength: 50 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'heading', label: 'Nagłówek', type: 'text', required: true, maxLength: 80 },
        { name: 'headingAccent', label: 'Druga część w kolorze', type: 'text', maxLength: 60 },
      ],
    },
    {
      name: 'lead',
      label: 'Wstęp',
      type: 'textarea',
      maxLength: 400,
      admin: { description: 'Fragment między **gwiazdkami** będzie pogrubiony.' },
    },
    {
      name: 'needs',
      label: 'Kafle „po co”',
      type: 'array',
      maxRows: 3,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 60 },
            { name: 'icon', label: 'Ikona', type: 'select', required: true, options: ICON_OPTIONS },
          ],
        },
        { name: 'text', label: 'Opis', type: 'textarea', required: true, maxLength: 160 },
        {
          name: 'countdownTo',
          label: 'Licznik dni do daty',
          type: 'date',
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
            description: 'Do tego dnia w rogu jest „N dni” (liczone w przeglądarce).',
          },
        },
      ],
    },
    {
      name: 'steps',
      label: 'Kroki',
      type: 'array',
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 40 },
            { name: 'text', label: 'Opis', type: 'text', maxLength: 80 },
          ],
        },
      ],
    },
    linkGroup('cta', 'Przycisk', true),
    {
      name: 'showPhone',
      label: 'Pokaż telefon z Ustawień strony obok przycisku',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'guarantees',
      label: 'Gwarancje',
      type: 'array',
      maxRows: 5,
      fields: [{ name: 'text', label: 'Tekst', type: 'text', required: true, maxLength: 50 }],
    },
    {
      name: 'report',
      label: 'Przykładowy raport',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'tag', label: 'Etykieta w rogu', type: 'text', maxLength: 30 },
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 50 },
            { name: 'subtitle', label: 'Podpis', type: 'text', maxLength: 80 },
          ],
        },
        {
          name: 'rows',
          label: 'Wiersze',
          type: 'array',
          maxRows: 10,
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 40 },
                { name: 'detail', label: 'Szczegół', type: 'text', maxLength: 70 },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'icon',
                  label: 'Ikona',
                  type: 'select',
                  required: true,
                  options: ICON_OPTIONS,
                },
                {
                  name: 'state',
                  label: 'Kolor statusu',
                  type: 'select',
                  required: true,
                  defaultValue: 'ok',
                  options: [...AUDIT_STATES],
                },
                {
                  name: 'stateLabel',
                  label: 'Status',
                  type: 'text',
                  required: true,
                  maxLength: 20,
                },
              ],
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'planTitle', label: 'Plan działań', type: 'text', maxLength: 80 },
            { name: 'planNote', label: 'Dopisek planu', type: 'text', maxLength: 80 },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'signature', label: 'Podpis', type: 'text', maxLength: 30 },
            { name: 'stamp', label: 'Pieczątka', type: 'text', maxLength: 20 },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'floatValue', label: 'Plakietka — wyróżnik', type: 'text', maxLength: 10 },
            { name: 'floatText', label: 'Plakietka — tekst', type: 'text', maxLength: 30 },
          ],
        },
      ],
    },
  ],
}
