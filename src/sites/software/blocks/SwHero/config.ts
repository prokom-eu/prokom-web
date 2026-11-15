import type { Block } from 'payload'

import { hrefField, linkGroup } from '../../../../blocks/fields'
import { ICON_OPTIONS } from '../../../../lib/catalog/options'

/**
 * Hero of the Software start page (spec. §4 pkt 1–2, ADR-014 rozstrz. SW0 7). Since v24 the block
 * only marks where the hero stands — its texts come from `SoftwareSettings.home.hero`; the fields
 * below are the v23 hero's and are not shown (decision D6, 08.11; removing their columns is a
 * separate migration, `docs/STAN.md` → „Pomysły na później”).
 */
export const SwHeroBlock: Block = {
  slug: 'swHero',
  interfaceName: 'SwHeroBlock',
  labels: { singular: 'Software: hero strony głównej', plural: 'Software: hero strony głównej' },
  fields: [
    {
      name: 'eyebrow',
      label: 'Nad nagłówkiem',
      type: 'text',
      required: true,
      maxLength: 80,
      admin: {
        description: 'Jeden taki blok na stronę, na początku (kotwica #start, nagłówek H1).',
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'title', label: 'Nagłówek (H1)', type: 'text', required: true, maxLength: 80 },
        {
          name: 'titleAccent',
          label: 'Wyróżniona końcówka nagłówka',
          type: 'text',
          maxLength: 60,
          admin: { description: 'W kolorze akcentu, po nagłówku.' },
        },
      ],
    },
    {
      name: 'lead',
      label: 'Wstęp',
      type: 'textarea',
      required: true,
      maxLength: 320,
      admin: { description: 'Wyróżnienie w **gwiazdkach**, np. „**zanim zapłacisz**”.' },
    },
    {
      type: 'row',
      fields: [
        linkGroup('primary', 'Główny przycisk', true),
        {
          name: 'primaryBadge',
          label: 'Plakietka przycisku',
          type: 'text',
          maxLength: 8,
          admin: { description: 'Np. „60 s”. Pusta = bez plakietki.' },
        },
      ],
    },
    linkGroup('secondary', 'Drugi przycisk'),
    {
      name: 'response',
      label: 'Czas odpowiedzi',
      type: 'text',
      maxLength: 120,
      admin: { description: 'Np. „Odpowiadamy w ciągu **[CZAS ODPOWIEDZI]**”. Pusty = bez linii.' },
    },
    {
      name: 'trust',
      label: 'Punkty zaufania',
      type: 'array',
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'text', label: 'Tekst', type: 'text', required: true, maxLength: 60 },
            { name: 'icon', label: 'Ikona', type: 'select', required: true, options: ICON_OPTIONS },
          ],
        },
      ],
    },
    {
      name: 'intents',
      label: 'Kafle intencji',
      type: 'array',
      maxRows: 4,
      admin: { description: 'Pod hero. Na telefonie lista z dwiema liniami opisu.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 60 },
            { name: 'icon', label: 'Ikona', type: 'select', required: true, options: ICON_OPTIONS },
          ],
        },
        { name: 'text', label: 'Opis', type: 'textarea', required: true, maxLength: 160 },
        hrefField('href', 'Link kafla', true),
      ],
    },
  ],
}
