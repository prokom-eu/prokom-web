import type { Block } from 'payload'

import { hrefField, linkGroup } from '../../../../blocks/fields'
import { ICON_OPTIONS } from '../../../../lib/catalog/options'
import { AREA_KEYS } from '../../../../lib/software/options'

/**
 * Hero of the Software start page with the „Twój system” mock-up and the 4 intent tiles
 * (spec. §4 pkt 1–2, ADR-014 rozstrz. SW0 7). Texts are edited here; the modules of the mock-up
 * come from `SoftwareSettings.home.heroModules`. Facts (`[CZAS ODPOWIEDZI]`) and `**bold**` are
 * filled on render.
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
    { name: 'lead', label: 'Wstęp', type: 'textarea', required: true, maxLength: 320 },
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
      admin: { description: 'Pod hero. Na telefonie bez opisów (2×2).' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 60 },
            { name: 'icon', label: 'Ikona', type: 'select', required: true, options: ICON_OPTIONS },
            {
              name: 'tone',
              label: 'Kolor (obszar)',
              type: 'select',
              required: true,
              defaultValue: 'www',
              options: [...AREA_KEYS],
            },
          ],
        },
        { name: 'text', label: 'Opis', type: 'textarea', required: true, maxLength: 160 },
        hrefField('href', 'Link kafla', true),
      ],
    },
  ],
}
