import type { Block } from 'payload'

import { linkGroup } from '../fields'

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Hero' },
  fields: [
    { name: 'heading', label: 'Nagłówek', type: 'text', required: true },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    linkGroup('cta', 'Przycisk'),
    // TODO(S7): image — needs the Media collection.
  ],
}
