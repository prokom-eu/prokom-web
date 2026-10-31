import type { Block } from 'payload'

import { ICON_OPTIONS } from '../../../../lib/catalog/options'

/** „Jak pracujemy” of the Biznes home page (spec. §4 pkt 7): four steps, people, guarantees. */
export const BzStepsBlock: Block = {
  slug: 'bzSteps',
  interfaceName: 'BzStepsBlock',
  labels: { singular: 'Biznes: jak pracujemy', plural: 'Biznes: jak pracujemy' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text' },
        {
          name: 'heading',
          label: 'Nagłówek',
          type: 'text',
          required: true,
          admin: {
            description: 'Sekcja ma kotwicę #jak-pracujemy — ten blok wstaw na stronie tylko raz.',
          },
        },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    {
      name: 'getsLabel',
      label: 'Podpis ramki z efektem',
      type: 'text',
      defaultValue: 'Dostajesz',
    },
    {
      name: 'steps',
      label: 'Kroki',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 30 },
            { name: 'icon', label: 'Ikona', type: 'select', required: true, options: ICON_OPTIONS },
          ],
        },
        { name: 'text', label: 'Opis', type: 'textarea', required: true, maxLength: 160 },
        { name: 'gets', label: 'Dostajesz', type: 'text', maxLength: 90 },
        {
          type: 'row',
          fields: [
            { name: 'role', label: 'Kto za to odpowiada', type: 'text', maxLength: 40 },
            {
              name: 'roleNote',
              // v150 (board `#s4-jak`): the label above the title; the column keeps its name.
              label: 'Etykieta nad tytułem (np. „Pierwszy kontakt”)',
              type: 'text',
              maxLength: 70,
            },
          ],
        },
      ],
    },
    {
      name: 'guarantees',
      label: 'Nasze zobowiązania (pas pod krokami)',
      type: 'array',
      maxRows: 6,
      admin: {
        description: 'Tytuł i opis oddziela pauza: „60 minut — oddzwaniamy w godzinach pracy”.',
      },
      fields: [{ name: 'text', label: 'Tekst', type: 'text', required: true, maxLength: 90 }],
    },
  ],
}
