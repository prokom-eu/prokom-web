import type { Block } from 'payload'

import { linkGroup } from '../../../../blocks/fields'

/**
 * Downtime calculator (spec. §6.4 pkt 3, plansza Dzial). Texts here; the inputs, the formula and
 * the result sentence are in `lib/biznes/downtime.ts` — counted in the browser only.
 */
export const BzDowntimeCalcBlock: Block = {
  slug: 'bzDowntimeCalc',
  interfaceName: 'BzDowntimeCalcBlock',
  labels: { singular: 'Biznes: kalkulator przestoju', plural: 'Biznes: kalkulator przestoju' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 60 },
        { name: 'heading', label: 'Nagłówek', type: 'text', required: true, maxLength: 120 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'kicker', label: 'Etykieta kalkulatora', type: 'text', maxLength: 30 },
        {
          name: 'title',
          label: 'Pytanie kalkulatora',
          type: 'text',
          required: true,
          maxLength: 80,
        },
      ],
    },
    { name: 'text', label: 'Opis kalkulatora', type: 'textarea', maxLength: 240 },
    {
      type: 'row',
      fields: [
        {
          name: 'revenueLabel',
          label: 'Podpis suwaka',
          type: 'text',
          required: true,
          defaultValue: 'Dzienny utarg',
          maxLength: 40,
        },
        {
          name: 'hoursLabel',
          label: 'Pytanie o godziny',
          type: 'text',
          required: true,
          defaultValue: 'Ile godzin dziennie pracujesz?',
          maxLength: 60,
        },
        {
          name: 'outageLabel',
          label: 'Pytanie o czas awarii',
          type: 'text',
          required: true,
          defaultValue: 'Ile trwa awaria bez szybkiej pomocy?',
          maxLength: 60,
        },
      ],
    },
    { name: 'resultKicker', label: 'Etykieta wyniku', type: 'text', maxLength: 50 },
    linkGroup('cta', 'Przycisk pod wynikiem'),
    { name: 'note', label: 'Dopisek pod wynikiem', type: 'textarea', maxLength: 200 },
  ],
}
