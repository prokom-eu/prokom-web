import type { Block } from 'payload'

export const FaqBlock: Block = {
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: { singular: 'FAQ', plural: 'FAQ' },
  fields: [
    { name: 'heading', label: 'Nagłówek', type: 'text', defaultValue: 'Najczęstsze pytania' },
    {
      name: 'items',
      label: 'Pytania',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 30,
      fields: [
        { name: 'question', label: 'Pytanie', type: 'text', required: true },
        { name: 'answer', label: 'Odpowiedź', type: 'textarea', required: true },
      ],
    },
  ],
}
