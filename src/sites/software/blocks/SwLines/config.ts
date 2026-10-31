import type { Block } from 'payload'

import { hrefField } from '../../../../blocks/fields'
import { FACTS_NOTE, iconField, sectionHeadFields, textField } from '../fields'

const when = (variant: string) => (_: unknown, sibling: { variant?: unknown } | undefined) =>
  sibling?.variant === variant

/**
 * The PRO-KOM lines on a Software subpage (ADR-014 rozstrz. SW0 7 `swLines`; board `Wszystko`):
 * „Każda robi swoje…” — a card per line with its address and what it does (links only to sites
 * that exist, spec. §6.7) — or „Dwa przykłady z Podhala.” — what each line did for one client.
 */
export const SwLinesBlock: Block = {
  slug: 'swLines',
  interfaceName: 'SwLinesBlock',
  labels: { singular: 'Software: linie PRO-KOM', plural: 'Software: linie PRO-KOM' },
  fields: [
    {
      name: 'variant',
      label: 'Wygląd',
      type: 'select',
      required: true,
      defaultValue: 'lines',
      options: [
        { label: 'Karty linii', value: 'lines' },
        { label: 'Przykłady klientów', value: 'examples' },
      ],
    },
    ...sectionHeadFields,
    {
      name: 'lines',
      label: 'Linie',
      type: 'array',
      maxRows: 6,
      admin: { condition: when('lines'), description: FACTS_NOTE },
      fields: [
        { type: 'row', fields: [textField('name', 'Nazwa', 40, true), iconField()] },
        {
          type: 'row',
          fields: [
            textField(
              'address',
              'Adres / podpis',
              80,
              false,
              'Np. „prokombiznes.pl”, „salon · [ADRES SALONU W ZAKOPANEM]”.',
            ),
            hrefField('href', 'Link (tylko istniejąca strona)'),
          ],
        },
        {
          name: 'points',
          label: 'Co robi',
          type: 'array',
          maxRows: 5,
          fields: [textField('text', 'Punkt', 80, true)],
        },
        textField('cta', 'Napis linku na karcie', 40, false, 'Np. „Zobacz ofertę →”.'),
        {
          name: 'current',
          label: 'To ta strona (karta wyróżniona)',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'examples',
      label: 'Przykłady',
      type: 'array',
      maxRows: 3,
      admin: { condition: when('examples') },
      fields: [
        textField('eyebrow', 'Etykieta', 40),
        textField('title', 'Tytuł', 80, true),
        textField('text', 'Opis', 160),
        {
          name: 'rows',
          label: 'Co zrobiła każda linia',
          type: 'array',
          minRows: 1,
          maxRows: 5,
          fields: [
            { type: 'row', fields: [textField('line', 'Linia', 30, true), iconField()] },
            textField('text', 'Co zrobiła', 160, true),
          ],
        },
      ],
    },
  ],
}
