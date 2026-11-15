import type { Block } from 'payload'

import { tenantImageFilter } from '../../lib/media/access'

import { linkGroup } from '../fields'

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Hero' },
  fields: [
    { name: 'heading', label: 'Nagłówek', type: 'text', required: true },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    linkGroup('cta', 'Przycisk'),
    {
      name: 'image',
      label: 'Obraz',
      type: 'upload',
      relationTo: 'media',
      filterOptions: tenantImageFilter,
      admin: { description: 'Opcjonalny; obok nagłówka na komputerze, pod nim na telefonie.' },
    },
  ],
}
