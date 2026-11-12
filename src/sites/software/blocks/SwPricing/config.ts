import type { Block, Field } from 'payload'

import { hrefField, linkGroup } from '../../../../blocks/fields'

/** Panel hint for the H2 fields (AUDYT po SWA7 #5). */
const EM_HINT =
  'Część w gradiencie w **gwiazdkach**, np. „Trzy poziomy audytu — **pierwszy za darmo**”.'

const text = (
  name: string,
  label: string,
  maxLength: number,
  required = false,
  description?: string,
): Field => ({
  name,
  label,
  type: 'text',
  required,
  maxLength,
  ...(description && { admin: { description } }),
})

const textarea = (name: string, label: string, maxLength: number, description?: string): Field => ({
  name,
  label,
  type: 'textarea',
  maxLength,
  ...(description && { admin: { description } }),
})

/**
 * The price list `/cennik` of the Software line (ZMIANY-v24 §6.3): the subpage hero, every
 * solution as a price card with the four offer groups as filters, care levels with „Zapytaj o
 * opiekę X →” and the audit kinds. Prices, terms and levels only from `Solutions`; the FAQ is the
 * shared `faq` block.
 */
export const SwPricingBlock: Block = {
  slug: 'swPricing',
  interfaceName: 'SwPricingBlock',
  labels: { singular: 'Software: cennik', plural: 'Software: cennik' },
  fields: [
    {
      type: 'collapsible',
      label: 'Nagłówek',
      fields: [
        {
          type: 'row',
          fields: [
            text('eyebrow', 'Nad nagłówkiem', 60, true),
            text('title', 'Nagłówek (H1)', 60, true),
            text('titleAccent', 'Nagłówek — wyróżnione zakończenie', 40),
          ],
        },
        textarea(
          'lead',
          'Wstęp',
          400,
          '{liczba} = liczba opublikowanych rozwiązań („Wszystkie {liczba} rozwiązań…”).',
        ),
        linkGroup('primary', 'Przycisk główny'),
        linkGroup('secondary', 'Przycisk drugi'),
      ],
    },
    {
      type: 'collapsible',
      label: 'Opieka',
      fields: [
        {
          type: 'row',
          fields: [
            text('careEyebrow', 'Nad nagłówkiem', 40),
            text('careTitle', 'Nagłówek (H2)', 80, false, EM_HINT),
          ],
        },
        textarea(
          'careLead',
          'Wstęp',
          240,
          'Poziomy, ceny i czasy reakcji z rozwiązania z poziomami miesięcznymi. Pusty nagłówek = bez sekcji.',
        ),
        {
          type: 'row',
          fields: [
            text(
              'careButton',
              'Przycisk — początek',
              40,
              false,
              '„Zapytaj o opiekę” + nazwa poziomu.',
            ),
            text('careNote', 'Pod przyciskiem', 60),
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Audyt',
      fields: [
        {
          type: 'row',
          fields: [
            text('auditEyebrow', 'Nad nagłówkiem', 40),
            text('auditTitle', 'Nagłówek (H2)', 80, false, EM_HINT),
          ],
        },
        textarea(
          'auditLead',
          'Wstęp',
          240,
          'Rodzaje z rozwiązania „audyt”. Pusty nagłówek = bez sekcji.',
        ),
        {
          type: 'row',
          fields: [text('auditButton', 'Przycisk', 40), hrefField('auditHref', 'Przycisk — link')],
        },
      ],
    },
  ],
}
