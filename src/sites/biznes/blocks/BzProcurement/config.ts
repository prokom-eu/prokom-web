import type { Block } from 'payload'

import { validateProcurementHome } from '../../../../lib/biznes/procurement/home'

/**
 * „Zaopatrzenie firm” on the home page (ZAOPATRZENIE §8): right after `bzOffer`, before the
 * brands. Head texts are fields; the two cards and the benefits are JSON from the package
 * (`strona-glowna-k4.json → zaopatrzenie`). A card shows only while its page is published.
 */
export const BzProcurementBlock: Block = {
  slug: 'bzProcurement',
  interfaceName: 'BzProcurementBlock',
  labels: {
    singular: 'Biznes: Zaopatrzenie firm (główna)',
    plural: 'Biznes: Zaopatrzenie firm (główna)',
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text', maxLength: 80 },
        { name: 'heading', label: 'Nagłówek', type: 'text', required: true, maxLength: 160 },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 600 },
    {
      name: 'data',
      label: 'Karty i korzyści (JSON z paczki)',
      type: 'json',
      required: true,
      validate: (value: unknown) => validateProcurementHome(value),
      admin: {
        description:
          'Dwie karty (AGD, IT) z kalkulatorem i pasek korzyści. Zdjęcia to numery z Media. „Odbiór starego sprzętu” pokazuje się po zaznaczeniu flagi na stronie AGD, oddzwanianie — z obietnicy w Ustawieniach strony. Po imporcie z paczki (`pnpm seed:biznes`) wygrywa paczka.',
      },
    },
  ],
}
