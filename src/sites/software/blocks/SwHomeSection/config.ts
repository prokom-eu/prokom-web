import type { Block } from 'payload'

import { HOME_SECTIONS } from '../../../../lib/software/homeSections'

/**
 * One fixed section of the Software start page (ADR-014 rozstrz. SW0 7, v20 6): a component with
 * logic, its texts in `SoftwareSettings.home`, its lists from the collections. The block only
 * picks the section and its place — the order of these blocks is the order on the page.
 */
export const SwHomeSectionBlock: Block = {
  slug: 'swHomeSection',
  interfaceName: 'SwHomeSectionBlock',
  labels: {
    singular: 'Software: sekcja strony głównej',
    plural: 'Software: sekcje strony głównej',
  },
  fields: [
    {
      name: 'section',
      label: 'Sekcja',
      type: 'select',
      required: true,
      options: HOME_SECTIONS.map(({ value, label }) => ({ value, label })),
      admin: {
        description:
          'Każda sekcja raz na stronie (ma swoją kotwicę, np. #oferta). Teksty sekcji edytuje się w Ustawieniach Software → strona główna.',
      },
    },
  ],
}
