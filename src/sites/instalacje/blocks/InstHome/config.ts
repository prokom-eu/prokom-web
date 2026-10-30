import type { Block } from 'payload'

/** Icons a trust point may use (keys of `INST_ICONS`). */
export const TRUST_ICONS = ['check', 'pin', 'doc', 'shield', 'clock', 'wrench'] as const

/**
 * The home page of the Instalacje line (ADR-I002 §0): one block for the whole page. I5 brings
 * the hero „Twój obiekt na żywo” — its texts are edited here (ADR-I002 §1), the scene and the
 * texts inside it live in code; I6 adds the other home sections. The block carries the h1.
 */
export const InstHomeBlock: Block = {
  slug: 'instHome',
  interfaceName: 'InstHomeBlock',
  labels: {
    singular: 'Instalacje: strona główna',
    plural: 'Instalacje: strony główne',
  },
  fields: [
    {
      type: 'group',
      name: 'hero',
      label: 'Hero „Twój obiekt na żywo”',
      admin: {
        description:
          'Tekst obok sceny. Scenę (obiekty, pory, instalacje) i jej opisy zmienia się w kodzie.',
      },
      fields: [
        { name: 'eyebrow', label: 'Pigułka nad tytułem', type: 'text', required: true },
        {
          name: 'kicker',
          label: 'Mała linia tytułu',
          type: 'text',
          required: true,
          admin: { description: 'Pierwsza, mała część nagłówka H1 (słowa kluczowe).' },
        },
        { name: 'h1a', label: 'Tytuł', type: 'text', required: true },
        {
          name: 'h1b',
          label: 'Tytuł — wyróżnienie',
          type: 'text',
          required: true,
          admin: { description: 'Końcówka tytułu w kolorze akcentu.' },
        },
        { name: 'lead', label: 'Wstęp', type: 'textarea', required: true },
        {
          name: 'trust',
          label: 'Punkty zaufania',
          type: 'array',
          maxRows: 3,
          fields: [
            {
              name: 'icon',
              label: 'Ikona',
              type: 'select',
              required: true,
              defaultValue: 'check',
              options: TRUST_ICONS.map((value) => ({ label: value, value })),
            },
            { name: 'text', label: 'Tekst', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
