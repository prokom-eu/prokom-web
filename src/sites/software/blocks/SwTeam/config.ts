import type { Block } from 'payload'

import { FACTS_NOTE, photoFields, sectionHeadFields, textField } from '../fields'

/**
 * People and places of a Software subpage (ADR-014 rozstrz. SW0 7 `swTeam`; boards `ONas`,
 * `Wszystko`): „Kto z Tobą pracuje.” — photo, role, name, text — or „Dwa salony…” — name,
 * address lines, photo. On production a card whose name has a missing fact (`[IMIĘ I NAZWISKO]`)
 * is left out; a detail line with one (e.g. `[GODZINY]`) goes, the card stays.
 */
export const SwTeamBlock: Block = {
  slug: 'swTeam',
  interfaceName: 'SwTeamBlock',
  labels: { singular: 'Software: ludzie i miejsca', plural: 'Software: ludzie i miejsca' },
  fields: [
    {
      name: 'variant',
      label: 'Wygląd',
      type: 'select',
      required: true,
      defaultValue: 'people',
      options: [
        { label: 'Ludzie (zdjęcie u góry)', value: 'people' },
        { label: 'Miejsca (adres, potem zdjęcie)', value: 'places' },
      ],
    },
    ...sectionHeadFields,
    {
      name: 'members',
      label: 'Karty',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 6,
      admin: { description: FACTS_NOTE },
      fields: [
        {
          type: 'row',
          fields: [textField('role', 'Rola / etykieta', 60), textField('name', 'Nazwa', 80, true)],
        },
        { name: 'text', label: 'Opis', type: 'textarea', maxLength: 300 },
        {
          name: 'details',
          label: 'Szczegóły (każda linia osobno)',
          type: 'textarea',
          maxLength: 400,
          admin: { description: 'Miejsca: adres, telefon, godziny, NIP — każda w nowej linii.' },
        },
        ...photoFields,
      ],
    },
  ],
}
