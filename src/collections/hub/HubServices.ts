import { hubCollection, keyField, lineField, orderField, textList, urlField } from './common'

/**
 * „Cała oferta” (ADR-H002 §3): short entries of the lines' services with a link to the line's
 * site — never a copy of its page. Used by `/linie`, the „Oferta” mega menu and the search.
 */
export const HubServices = hubCollection({
  slug: 'hub-services',
  labels: { singular: 'Usługa linii', plural: 'Usługi linii (Cała oferta)' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'line', 'audience', 'order', '_status'],
    description: 'Krótkie wpisy usług linii na pro-kom.eu — pełna treść zostaje na stronie linii.',
  },
  defaultSort: 'order',
  indexes: [{ fields: ['tenant', 'key'], unique: true }],
  visible: {
    title: 'Nazwa',
    short: 'Opis krótki',
    long: 'Opis',
    includes: 'W zakresie',
    ctaLabel: 'Przycisk',
  },
  fields: [
    keyField(),
    orderField,
    {
      name: 'visible',
      label: 'Widoczna',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        lineField,
        {
          name: 'audience',
          label: 'Dla kogo',
          type: 'select',
          required: true,
          defaultValue: 'oba',
          options: [
            { label: 'Firma', value: 'firma' },
            { label: 'Dom', value: 'dom' },
            { label: 'Firma i dom', value: 'oba' },
          ],
        },
      ],
    },
    { name: 'title', label: 'Nazwa', type: 'text', required: true, maxLength: 80 },
    { name: 'short', label: 'Opis krótki', type: 'text', required: true, maxLength: 200 },
    { name: 'long', label: 'Opis', type: 'textarea', maxLength: 800 },
    textList('includes', 'W zakresie (chipy)', 6),
    {
      name: 'related',
      label: 'Powiązane usługi',
      type: 'relationship',
      relationTo: 'hub-services',
      hasMany: true,
      maxRows: 4,
    },
    {
      name: 'keywords',
      label: 'Słowa do wyszukiwarki',
      type: 'textarea',
      admin: { description: 'Synonimy i odmiany po spacji (bez polskich znaków też działa).' },
    },
    urlField('url', 'Adres', 'Strona usługi u linii albo ścieżka huba; puste = strona linii.'),
    { name: 'ctaLabel', label: 'Przycisk', type: 'text', maxLength: 60 },
  ],
})
