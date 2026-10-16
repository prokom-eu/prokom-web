import type { Block } from 'payload'

import { linkGroup } from '../fields'

export const ServiceGridBlock: Block = {
  slug: 'serviceGrid',
  interfaceName: 'ServiceGridBlock',
  labels: { singular: 'Siatka usług', plural: 'Siatki usług' },
  fields: [
    { name: 'heading', label: 'Nagłówek', type: 'text' },
    { name: 'intro', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    {
      name: 'items',
      label: 'Kafelki',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 12,
      fields: [
        { name: 'title', label: 'Tytuł', type: 'text', required: true },
        { name: 'description', label: 'Opis', type: 'textarea', maxLength: 300 },
        linkGroup('link', 'Link'),
      ],
    },
  ],
}
