import type { Block, Field } from 'payload'

import { hrefField, linkGroup } from '../../../../blocks/fields'

/** Icons of the report rows and the check cards (board `Audyt`). */
export const AUDIT_ICONS = ['clock', 'phone', 'search', 'shield', 'users', 'doc'] as const

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

const iconField: Field = {
  name: 'icon',
  label: 'Ikona',
  type: 'select',
  required: true,
  options: [
    { label: 'Szybkość (zegar)', value: 'clock' },
    { label: 'Telefon', value: 'phone' },
    { label: 'Google i AI (lupa)', value: 'search' },
    { label: 'Bezpieczeństwo (tarcza)', value: 'shield' },
    { label: 'Dostępność (ludzie)', value: 'users' },
    { label: 'Raport (dokument)', value: 'doc' },
  ],
}

const FACTS_NOTE = 'Fakty w nawiasach ([CZAS]…) z Ustawień linii.'

/**
 * `/audyt` of the Software line (spec. §6.5; board `Audyt`): hero with the audit form (address,
 * „Imię”, e-mail or phone, consent — ADR-014 rozstrz. SW0 6) and a sample report, „Pięć rzeczy…”,
 * the audit kinds from `Solutions.levels`, three steps and the final CTA. The FAQ is the shared
 * `faq` block after this one. One per page.
 */
export const SwAuditFormBlock: Block = {
  slug: 'swAuditForm',
  interfaceName: 'SwAuditFormBlock',
  labels: { singular: 'Software: darmowy audyt', plural: 'Software: darmowy audyt' },
  fields: [
    {
      type: 'collapsible',
      label: 'Nagłówek i formularz',
      fields: [
        {
          type: 'row',
          fields: [
            text('eyebrow', 'Nad nagłówkiem', 60, true),
            text('title', 'Nagłówek (H1)', 60, true),
            text('titleAccent', 'Nagłówek — wyróżnione zakończenie', 40),
          ],
        },
        { name: 'lead', label: 'Wstęp', type: 'textarea', required: true, maxLength: 300 },
        text('formLabel', 'Nad formularzem', 80, false, FACTS_NOTE),
        {
          type: 'row',
          fields: [
            text('urlLabel', 'Adres — etykieta', 40, true),
            text('urlPlaceholder', 'Adres — podpowiedź', 60),
          ],
        },
        {
          type: 'row',
          fields: [
            text('nameLabel', 'Imię — etykieta', 40, true),
            text('namePlaceholder', 'Imię — podpowiedź', 60),
          ],
        },
        {
          type: 'row',
          fields: [
            text('contactLabel', 'Kontakt — etykieta', 40, true),
            text('contactPlaceholder', 'Kontakt — podpowiedź', 60),
          ],
        },
        {
          type: 'row',
          fields: [
            text('submit', 'Przycisk', 40, true),
            text('submitNote', 'Pod przyciskiem', 140),
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Przykład raportu',
      fields: [
        {
          type: 'row',
          fields: [
            text('reportTitle', 'Tytuł', 40),
            text('reportSubtitle', 'Podtytuł', 60),
            text('reportBadge', 'Plakietka', 20),
          ],
        },
        {
          name: 'reportRows',
          label: 'Wiersze',
          type: 'array',
          maxRows: 6,
          admin: { description: 'Pusty tytuł albo brak wierszy = bez przykładu.' },
          fields: [
            {
              type: 'row',
              fields: [
                iconField,
                text('title', 'Obszar', 30, true),
                {
                  name: 'status',
                  label: 'Ocena',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'dobrze', value: 'good' },
                    { label: 'do poprawy', value: 'fix' },
                  ],
                },
              ],
            },
            text('text', 'Opis', 80),
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Co sprawdzamy',
      fields: [
        {
          type: 'row',
          fields: [
            text('checksEyebrow', 'Nad nagłówkiem', 40),
            text('checksTitle', 'Nagłówek (H2)', 80),
          ],
        },
        { name: 'checksLead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
        {
          name: 'checks',
          label: 'Karty',
          type: 'array',
          maxRows: 6,
          admin: { description: 'Ostatnia karta jest wyróżniona (wynik: raport). ' + FACTS_NOTE },
          fields: [
            { type: 'row', fields: [iconField, text('title', 'Tytuł', 40, true)] },
            { name: 'text', label: 'Opis', type: 'textarea', maxLength: 200 },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Rodzaje audytu',
      fields: [
        {
          type: 'row',
          fields: [
            text('levelsEyebrow', 'Nad nagłówkiem', 40),
            text('levelsTitle', 'Nagłówek (H2)', 80),
          ],
        },
        {
          name: 'levelsLead',
          label: 'Wstęp',
          type: 'textarea',
          maxLength: 240,
          admin: {
            description:
              'Ceny i terminy z rozwiązania „audyt” (poziomy). Pusty nagłówek = bez sekcji.',
          },
        },
        {
          name: 'levelButtons',
          label: 'Przyciski rodzajów (po kolei)',
          type: 'array',
          maxRows: 3,
          fields: [
            {
              type: 'row',
              fields: [text('label', 'Etykieta', 40, true), hrefField('href', 'Link', true)],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Trzy kroki',
      fields: [
        {
          type: 'row',
          fields: [
            text('stepsEyebrow', 'Nad nagłówkiem', 40),
            text('stepsTitle', 'Nagłówek (H2)', 80),
          ],
        },
        {
          name: 'steps',
          label: 'Kroki',
          type: 'array',
          maxRows: 4,
          admin: { description: FACTS_NOTE },
          fields: [
            {
              type: 'row',
              fields: [text('title', 'Krok', 40, true), text('text', 'Opis', 140)],
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
        { name: 'ctaText', label: 'Tekst', type: 'textarea', maxLength: 240 },
        linkGroup('ctaPrimary', 'Przycisk główny'),
        linkGroup('ctaSecondary', 'Przycisk drugi'),
      ],
    },
  ],
}
