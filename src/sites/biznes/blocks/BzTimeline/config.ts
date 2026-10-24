import type { Block } from 'payload'

/**
 * Numbered steps on a line (plansza Gopos „Od prezentacji do pierwszego sezonu”); a step may show
 * an hour instead of its number (plansza Branza „Dzień w lokalu”).
 */
export const BzTimelineBlock: Block = {
  slug: 'bzTimeline',
  interfaceName: 'BzTimelineBlock',
  labels: { singular: 'Biznes: kroki na osi', plural: 'Biznes: kroki na osi' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 60 },
        { name: 'heading', label: 'Nagłówek', type: 'text', required: true, maxLength: 120 },
      ],
    },
    {
      name: 'steps',
      label: 'Kroki',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 6,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              label: 'Godzina (opcjonalnie)',
              type: 'text',
              maxLength: 6,
              admin: { description: 'Np. „11:00” w kółku zamiast numeru kroku.' },
            },
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 40 },
          ],
        },
        { name: 'text', label: 'Opis', type: 'textarea', maxLength: 160 },
      ],
    },
  ],
}
