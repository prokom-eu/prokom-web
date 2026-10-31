import type { Block, Field } from 'payload'

import { hrefField, linkGroup } from '../../../../blocks/fields'
import { SOLUTION_CATEGORIES } from '../../../../lib/software/options'

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
 * The price list `/cennik` of the Software line (spec. §6.4, v22; board `Cennik`, stan `89b`):
 * hero with the most chosen solution, the solutions in tabs (one „od” price, one „od” term, „W
 * cenie”), care levels with „Zapytaj o opiekę X →”, audit kinds, „Tego nie dopłacasz” and the
 * final CTA. Prices, terms and levels only from `Solutions`; the FAQ is the shared `faq` block.
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
        {
          name: 'featured',
          label: 'Karta w nagłówku — rozwiązanie',
          type: 'relationship',
          relationTo: 'solutions',
          admin: { description: 'Cena i termin z rozwiązania. Puste = bez karty.' },
        },
        {
          type: 'row',
          fields: [text('featuredBadge', 'Karta — plakietka', 30)],
        },
        {
          name: 'featuredPoints',
          label: 'Karta — punkty',
          type: 'array',
          maxRows: 3,
          fields: [text('text', 'Punkt', 60, true)],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Tabela rozwiązań',
      fields: [
        {
          type: 'row',
          fields: [
            text('tableEyebrow', 'Nad nagłówkiem', 40),
            text('tableTitle', 'Nagłówek (H2)', 60, true),
          ],
        },
        {
          name: 'tabs',
          label: 'Zakładki — nazwy i noty',
          type: 'array',
          maxRows: SOLUTION_CATEGORIES.length,
          admin: {
            description:
              'Kolejność i liczba pozycji z rozwiązań (kategoria). Bez wpisu zakładka ma nazwę kategorii i nie ma noty.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  label: 'Kategoria',
                  type: 'select',
                  required: true,
                  options: SOLUTION_CATEGORIES.map(({ label, value }) => ({ label, value })),
                },
                text('label', 'Nazwa zakładki', 30),
              ],
            },
            textarea('note', 'Nota nad tabelą', 240),
          ],
        },
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
            text('careTitle', 'Nagłówek (H2)', 80),
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
            text('auditTitle', 'Nagłówek (H2)', 80),
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
    {
      type: 'collapsible',
      label: 'Tego nie dopłacasz',
      fields: [
        {
          type: 'row',
          fields: [
            text('includedEyebrow', 'Nad nagłówkiem', 40),
            text('includedTitle', 'Nagłówek (H2)', 60),
          ],
        },
        {
          name: 'includedItems',
          label: 'Pozycje',
          type: 'array',
          maxRows: 8,
          fields: [
            {
              type: 'row',
              fields: [text('title', 'Pozycja', 50, true), text('text', 'Opis', 80)],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Wezwanie na końcu',
      fields: [
        text('ctaTitle', 'Nagłówek (H2)', 60),
        textarea('ctaText', 'Tekst', 240),
        linkGroup('ctaPrimary', 'Przycisk główny'),
        linkGroup('ctaSecondary', 'Przycisk drugi'),
      ],
    },
  ],
}
