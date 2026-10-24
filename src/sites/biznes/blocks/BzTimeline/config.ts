import type { Block } from 'payload'

/** Numbered steps on a line (plansza Gopos „Od prezentacji do pierwszego sezonu”). */
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
        { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 40 },
        { name: 'text', label: 'Opis', type: 'textarea', maxLength: 160 },
      ],
    },
  ],
}
