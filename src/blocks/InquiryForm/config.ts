import type { Block } from 'payload'

/** Inquiry form (ADR-003). The fields themselves are fixed in code; the editor sets the frame. */
export const InquiryFormBlock: Block = {
  slug: 'inquiryForm',
  interfaceName: 'InquiryFormBlock',
  labels: { singular: 'Formularz zapytania', plural: 'Formularze zapytania' },
  fields: [
    {
      name: 'heading',
      label: 'Nagłówek',
      type: 'text',
      defaultValue: 'Napisz do nas',
      // The section is the `#formularz` anchor other pages link to.
      admin: { description: 'Jeden formularz na stronę — linki „#formularz” prowadzą do niego.' },
    },
    { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 300 },
    {
      name: 'category',
      label: 'Kategoria zapytania',
      type: 'text',
      maxLength: 100,
      admin: {
        description:
          'Opcjonalnie, np. „Kasy fiskalne” — trafia do tematu powiadomienia i do panelu.',
      },
    },
  ],
}
