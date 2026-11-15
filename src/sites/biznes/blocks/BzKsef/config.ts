import type { Block } from 'payload'

import { linkGroup } from '../../../../blocks/fields'

type Siblings = { variant?: unknown }

const isBand = (data: Siblings | undefined) => data?.variant === 'band'

/** Required in the full card only: the band takes its deadline from the settings. */
const requiredInFull = (value: unknown, { siblingData }: { siblingData: Siblings }) =>
  value || isBand(siblingData) ? true : 'To pole jest wymagane.'

/**
 * KSeF with a day counter (spec. §6.6 pkt 4, plansza Insert), `#ksef`: the number of days to a
 * date (counted in the browser), what it means and the things to prepare. Legal facts only with a
 * source (plan §4). The `band` variant is the home page band (plan 0611 §7.1 pkt 7): deadline,
 * heading and link from `SiteSettings → Biznes → KSeF`, the steps from the checklist here.
 */
export const BzKsefBlock: Block = {
  slug: 'bzKsef',
  interfaceName: 'BzKsefBlock',
  labels: { singular: 'Biznes: licznik KSeF', plural: 'Biznes: licznik KSeF' },
  fields: [
    {
      name: 'variant',
      label: 'Wariant',
      type: 'select',
      defaultValue: 'full',
      required: true,
      options: [
        { label: 'Karta z licznikiem dni', value: 'full' },
        { label: 'Pas na stronie głównej (termin z Ustawień → Biznes → KSeF)', value: 'band' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          label: 'Etykieta',
          type: 'text',
          maxLength: 60,
          admin: { description: 'Sekcja ma kotwicę #ksef — blok tylko raz na stronie.' },
        },
        {
          name: 'date',
          label: 'Licznik dni do daty',
          type: 'date',
          validate: requiredInFull,
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
            condition: (_, siblingData: Siblings) => !isBand(siblingData),
          },
        },
        {
          name: 'dateLabel',
          label: 'Podpis pod liczbą',
          type: 'text',
          maxLength: 40,
          validate: requiredInFull,
          admin: {
            description: 'Np. „dni do 1 stycznia 2027”.',
            condition: (_, siblingData: Siblings) => !isBand(siblingData),
          },
        },
      ],
    },
    { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 400 },
    linkGroup('link', 'Przycisk'),
    {
      name: 'checklist',
      label: 'Do przygotowania (w pasie: kroki, same tytuły)',
      type: 'array',
      maxRows: 8,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 40 },
            { name: 'text', label: 'Podpis', type: 'text', maxLength: 60 },
          ],
        },
      ],
    },
  ],
}
