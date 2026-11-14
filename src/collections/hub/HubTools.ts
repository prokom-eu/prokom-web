import { hubCollection, keyField, lineField, orderField, textList, urlField } from './common'

export const HUB_TOOL_ACTIONS = [
  { label: 'Zgłosić', value: 'zglos' },
  { label: 'Sprawdzić', value: 'sprawdz' },
  { label: 'Policzyć i dobrać', value: 'policz' },
  { label: 'Zaplanować', value: 'zaplanuj' },
  { label: 'Zapytać', value: 'zapytaj' },
] as const

/**
 * „Załatw online” (ADR-H002 §3): tools of the lines. A tool with „Wkrótce” never links to a page
 * that does not exist — its button leads to the contact form with the topic.
 */
export const HubTools = hubCollection({
  slug: 'hub-tools',
  labels: { singular: 'Narzędzie online', plural: 'Narzędzia online (Załatw online)' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'line', 'action', 'badge', 'featuredOnHome', '_status'],
  },
  defaultSort: 'order',
  indexes: [{ fields: ['tenant', 'key'], unique: true }],
  visible: {
    title: 'Nazwa',
    desc: 'Opis',
    inputs: 'Co przygotować',
    result: 'Co dostajesz',
    ctaLabel: 'Przycisk',
    badge: 'Plakietka',
  },
  fields: [
    keyField(),
    orderField,
    {
      name: 'featuredOnHome',
      label: 'Na stronie głównej (2 na linię)',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        lineField,
        {
          name: 'action',
          label: 'Co chcesz zrobić',
          type: 'select',
          required: true,
          options: [...HUB_TOOL_ACTIONS],
        },
      ],
    },
    { name: 'title', label: 'Nazwa', type: 'text', required: true, maxLength: 80 },
    { name: 'desc', label: 'Opis', type: 'textarea', required: true, maxLength: 400 },
    textList('inputs', 'Co przygotować', 6),
    { name: 'result', label: 'Co dostajesz', type: 'text', maxLength: 200 },
    { name: 'ctaLabel', label: 'Przycisk', type: 'text', maxLength: 60 },
    urlField(
      'url',
      'Adres narzędzia',
      'Głęboki link na stronie linii; puste = formularz kontaktu.',
    ),
    {
      name: 'badge',
      label: 'Plakietka',
      type: 'text',
      maxLength: 30,
      admin: { description: '„Wkrótce” = bez linku do strony linii.' },
    },
    {
      name: 'preview',
      label: 'Podgląd (dane z planszy)',
      type: 'json',
      admin: { description: 'Rodzaj podglądu (form, steps, rows, grid, win) i jego dane.' },
    },
  ],
})
