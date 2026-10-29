import type { Block } from 'payload'

import { hrefField, linkGroup } from '../../../../blocks/fields'

/**
 * „Kontakt” of the Software start page (spec. §4 pkt 12, §7; ADR-014 rozstrz. SW0 7): dark block
 * with promises, the audit link and the line's phone, next to the contact form. Texts are edited
 * here; facts (`[CZAS ODPOWIEDZI]`, `[MIESIĄC]`, `[GODZINY]`) are filled on render, a promise with
 * a missing fact is not shown on production. Phone and e-mail only from `SiteSettings` of the
 * line (ADR-014 doprecyzowania SW2a 7); the consent clause from `consent.ts`.
 */
export const SwContactBlock: Block = {
  slug: 'swContact',
  interfaceName: 'SwContactBlock',
  labels: {
    singular: 'Software: kontakt z formularzem',
    plural: 'Software: kontakt z formularzem',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          label: 'Nad nagłówkiem',
          type: 'text',
          required: true,
          maxLength: 60,
          admin: { description: 'Jeden taki blok na stronę (kotwica #kontakt).' },
        },
        { name: 'title', label: 'Nagłówek (H2)', type: 'text', required: true, maxLength: 100 },
      ],
    },
    {
      type: 'collapsible',
      label: 'Lewa kolumna (ciemna)',
      fields: [
        { name: 'sideTitle', label: 'Hasło', type: 'text', required: true, maxLength: 80 },
        { name: 'sideText', label: 'Tekst pod hasłem', type: 'textarea', maxLength: 300 },
        {
          name: 'promises',
          label: 'Obietnice',
          type: 'array',
          maxRows: 4,
          admin: {
            description:
              'Np. „Odpowiadamy w ciągu [CZAS ODPOWIEDZI]”. Fakty w nawiasach z Ustawień linii.',
          },
          fields: [
            { name: 'text', label: 'Obietnica', type: 'text', required: true, maxLength: 120 },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'auditTitle', label: 'Karta audytu — tytuł', type: 'text', maxLength: 60 },
            hrefField('auditHref', 'Karta audytu — link'),
          ],
        },
        {
          name: 'auditText',
          label: 'Karta audytu — tekst',
          type: 'text',
          maxLength: 160,
          admin: { description: 'Pusty tytuł albo link = bez karty.' },
        },
        {
          name: 'phoneCaption',
          label: 'Pod telefonem',
          type: 'text',
          maxLength: 80,
          admin: { description: 'Np. „[GODZINY]”; e-mail linii dochodzi sam.' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Formularz',
      fields: [
        {
          name: 'topicsLabel',
          label: 'Pytanie o temat',
          type: 'text',
          required: true,
          maxLength: 60,
          admin: { description: 'Tematy są stałe (spec. §7) — zapisują się w zgłoszeniu.' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'messageLabel',
              label: 'Opis — etykieta',
              type: 'text',
              required: true,
              maxLength: 60,
            },
            {
              name: 'messagePlaceholder',
              label: 'Opis — podpowiedź',
              type: 'text',
              maxLength: 120,
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'nameLabel',
              label: 'Imię — etykieta',
              type: 'text',
              required: true,
              maxLength: 40,
            },
            { name: 'namePlaceholder', label: 'Imię — podpowiedź', type: 'text', maxLength: 60 },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'contactLabel',
              label: 'Kontakt — etykieta',
              type: 'text',
              required: true,
              maxLength: 40,
            },
            {
              name: 'contactPlaceholder',
              label: 'Kontakt — podpowiedź',
              type: 'text',
              maxLength: 60,
            },
          ],
        },
        { name: 'submit', label: 'Przycisk', type: 'text', required: true, maxLength: 30 },
        {
          name: 'alternative',
          label: 'Zdanie przy przycisku',
          type: 'text',
          maxLength: 60,
          admin: { description: 'Np. „Wolisz kliknąć niż pisać?” — przed linkiem poniżej.' },
        },
        linkGroup('alternativeLink', 'Link przy przycisku'),
      ],
    },
  ],
}
