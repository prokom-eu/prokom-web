import { hubCollection, lineField, orderField, textList } from './common'

/** „Co zrobić, gdy…” (ADR-H002 §3): one situation = one page `/pomoc/[slug]` from H5-1. */
export const HubHelp = hubCollection({
  slug: 'hub-help',
  labels: { singular: 'Sytuacja (pomoc)', plural: 'Co zrobić, gdy… (pomoc)' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'group', 'line', '_status'],
  },
  defaultSort: 'order',
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  visible: {
    title: 'Tytuł',
    group: 'Grupa',
    steps: 'Kroki',
    prep: 'Co przygotować',
    ctaLabel: 'Przycisk',
    seoTitle: 'Tytuł w Google',
    seoDescription: 'Opis w Google',
  },
  fields: [
    {
      name: 'slug',
      label: 'Adres (/pomoc/…)',
      type: 'text',
      required: true,
      admin: { position: 'sidebar' },
      validate: (value: unknown) =>
        typeof value === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)
          ? true
          : 'Małe litery, cyfry i myślniki.',
    },
    orderField,
    {
      type: 'row',
      fields: [lineField, { name: 'group', label: 'Grupa', type: 'text', required: true }],
    },
    { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 90 },
    textList('steps', 'Kroki', 8),
    textList('prep', 'Co przygotować', 8),
    { name: 'ctaLabel', label: 'Przycisk', type: 'text', maxLength: 60 },
    {
      name: 'relatedTool',
      label: 'Powiązane narzędzie',
      type: 'relationship',
      relationTo: 'hub-tools',
    },
    { name: 'seoTitle', label: 'Tytuł w Google', type: 'text', maxLength: 70 },
    { name: 'seoDescription', label: 'Opis w Google', type: 'textarea', maxLength: 160 },
  ],
})
