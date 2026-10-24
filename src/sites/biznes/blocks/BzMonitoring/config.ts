import type { Block } from 'payload'

import { linkGroup } from '../../../../blocks/fields'
import { ICON_OPTIONS } from '../../../../lib/catalog/options'

export const MONITORING_STATES = [
  { label: 'Działa (zielony)', value: 'ok' },
  { label: 'Zaplanowane (niebieski)', value: 'planned' },
  { label: 'W toku (pomarańczowy)', value: 'wip' },
] as const

/**
 * „Widzimy problemy, zanim Ty je zauważysz” (spec. §6.4 pkt 2, plansza Dzial): text with points
 * and buttons, and a sample care panel — every number and status is panel text, so the mockup
 * stays an illustration editors can change.
 */
export const BzMonitoringBlock: Block = {
  slug: 'bzMonitoring',
  interfaceName: 'BzMonitoringBlock',
  labels: { singular: 'Biznes: panel opieki IT', plural: 'Biznes: panel opieki IT' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 60 },
        { name: 'heading', label: 'Nagłówek', type: 'text', required: true, maxLength: 120 },
      ],
    },
    { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 400 },
    {
      name: 'points',
      label: 'Punkty',
      type: 'array',
      maxRows: 6,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'text', label: 'Tekst', type: 'text', required: true, maxLength: 80 },
            { name: 'icon', label: 'Ikona', type: 'select', required: true, options: ICON_OPTIONS },
          ],
        },
      ],
    },
    linkGroup('primary', 'Przycisk główny'),
    linkGroup('secondary', 'Przycisk drugi'),
    {
      name: 'panel',
      label: 'Przykładowy panel',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 60 },
            { name: 'subtitle', label: 'Podpis', type: 'text', maxLength: 80 },
            { name: 'status', label: 'Status w rogu', type: 'text', maxLength: 30 },
          ],
        },
        {
          name: 'kpis',
          label: 'Kafle z liczbami',
          type: 'array',
          maxRows: 3,
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', label: 'Opis', type: 'text', required: true, maxLength: 30 },
                { name: 'value', label: 'Wartość', type: 'text', required: true, maxLength: 16 },
              ],
            },
          ],
        },
        {
          name: 'rows',
          label: 'Wiersze',
          type: 'array',
          maxRows: 6,
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 50 },
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
                  options: [...MONITORING_STATES],
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
        { name: 'logLabel', label: 'Podpis dziennika', type: 'text', maxLength: 20 },
        {
          name: 'log',
          label: 'Dziennik',
          type: 'array',
          maxRows: 4,
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'time', label: 'Godzina', type: 'text', required: true, maxLength: 5 },
                { name: 'text', label: 'Wpis', type: 'text', required: true, maxLength: 80 },
              ],
            },
          ],
        },
        { name: 'note', label: 'Dopisek pod panelem', type: 'text', maxLength: 140 },
      ],
    },
  ],
}
