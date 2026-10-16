import type { Block } from 'payload'

import { linkGroup } from '../fields'

export const CallToActionBlock: Block = {
  slug: 'callToAction',
  interfaceName: 'CallToActionBlock',
  labels: { singular: 'Wezwanie do działania (CTA)', plural: 'Wezwania do działania (CTA)' },
  fields: [
    { name: 'heading', label: 'Nagłówek', type: 'text', required: true },
    { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 300 },
    linkGroup('link', 'Przycisk', true),
  ],
}
