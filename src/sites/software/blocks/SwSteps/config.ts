import type { Block } from 'payload'

import { FACTS_NOTE, iconField, sectionHeadFields, textField } from '../fields'

/**
 * A list section of a Software subpage (ADR-014 rozstrz. SW0 7 `swSteps`; boards `ONas`,
 * `Wszystko`): big numbers („Konkretnie, bez dmuchania.”), cards with an icon („Pracujesz z
 * firmą…”, „Jeden kontakt zamiast pięciu.”) or a timeline with years („Najpierw sprzęt…”).
 * An item whose text has a missing fact is left out on production (e.g. `[ROK SERWIS KAS]`).
 */
export const SwStepsBlock: Block = {
  slug: 'swSteps',
  interfaceName: 'SwStepsBlock',
  labels: { singular: 'Software: lista (liczby, karty, oś)', plural: 'Software: listy' },
  fields: [
    {
      name: 'variant',
      label: 'Wygląd',
      type: 'select',
      required: true,
      defaultValue: 'cards',
      options: [
        { label: 'Duże liczby', value: 'stats' },
        { label: 'Karty z ikoną', value: 'cards' },
        { label: 'Oś czasu', value: 'timeline' },
      ],
    },
    ...sectionHeadFields,
    {
      name: 'items',
      label: 'Pozycje',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 8,
      admin: { description: FACTS_NOTE },
      fields: [
        {
          type: 'row',
          fields: [
            textField(
              'marker',
              'Liczba albo rok',
              30,
              false,
              'Liczby i oś czasu: „2004”, „100+”, „[ROK SERWIS KAS]”.',
            ),
            iconField(),
          ],
        },
        textField('title', 'Tytuł', 80),
        { name: 'text', label: 'Opis', type: 'textarea', maxLength: 300 },
      ],
    },
  ],
}
