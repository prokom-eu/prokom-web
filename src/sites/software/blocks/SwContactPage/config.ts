import type { Block, Field } from 'payload'

import { hrefField, linkGroup } from '../../../../blocks/fields'
import { SOFTWARE_TOPIC_LABELS } from '../../../../lib/inquiry/types'

/** Lines of „Inne linie PRO-KOM” (`--c-<line>`, `--c-<line>-text`, `--c-<line>-on-dark`). */
export const CONTACT_LINE_COLORS = ['biznes', 'instalacje', 'tech', 'prokom'] as const

/** The four contact cards of the hero (spec. §6.10). */
export const CONTACT_CHANNELS = ['phone', 'email', 'salon', 'online'] as const

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

const FACTS_NOTE = 'Fakty w nawiasach ([GODZINY], [CZAS ODPOWIEDZI]…) z Ustawień linii.'

/**
 * The `/kontakt` page of the Software line (spec. §6.10, §7; board `Kontakt`, stany
 * `kontakt-90…99c`): hero with the live opening status and four channels, the form `#formularz`
 * with „Co dalej po wysłaniu” and „Twój projekt”, „Inne linie PRO-KOM” and „Gdzie się
 * spotkamy”. Phone and e-mail come from `SiteSettings`, address, hours and NIP from
 * `CompanyData`; the FAQ is the shared `faq` block after this one. One per page.
 */
export const SwContactPageBlock: Block = {
  slug: 'swContactPage',
  interfaceName: 'SwContactPageBlock',
  labels: {
    singular: 'Software: strona kontaktu',
    plural: 'Software: strona kontaktu',
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Nagłówek i kanały',
      fields: [
        {
          type: 'row',
          fields: [
            text('eyebrow', 'Nad nagłówkiem', 80, true),
            text('title', 'Nagłówek (H1)', 80, true),
            text('titleAccent', 'Nagłówek — wyróżnione zakończenie', 60),
          ],
        },
        {
          name: 'lead',
          label: 'Wstęp',
          type: 'textarea',
          required: true,
          maxLength: 300,
        },
        {
          name: 'hoursNote',
          label: 'Karta godzin — dopisek',
          type: 'text',
          maxLength: 60,
          admin: {
            description:
              'Po godzinach z Danych firmy, np. „formularz działa całą dobę”. Status otwarte / zamknięte liczy się sam (czas w Polsce).',
          },
        },
        {
          name: 'channels',
          label: 'Kanały',
          type: 'array',
          maxRows: 4,
          admin: {
            description: `Telefon i e-mail z Ustawień linii, adres salonu z Danych firmy. ${FACTS_NOTE}`,
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'kind',
                  label: 'Rodzaj',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Telefon linii', value: 'phone' },
                    { label: 'E-mail linii', value: 'email' },
                    { label: 'Salon', value: 'salon' },
                    { label: 'Online', value: 'online' },
                  ],
                },
                text('label', 'Nad wartością', 40, true),
                text('badge', 'Plakietka', 20),
              ],
            },
            {
              type: 'row',
              fields: [
                text(
                  'value',
                  'Wartość',
                  60,
                  false,
                  'Tylko salon i online; telefon i e-mail z ustawień.',
                ),
                text('text', 'Pod wartością', 90),
                hrefField('href', 'Link (salon, online)'),
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Co dalej po wysłaniu (ciemna kolumna)',
      fields: [
        text('stepsTitle', 'Tytuł', 40, true),
        {
          name: 'steps',
          label: 'Kroki',
          type: 'array',
          minRows: 1,
          maxRows: 4,
          fields: [
            {
              type: 'row',
              fields: [text('when', 'Kiedy', 30, true), text('title', 'Krok', 40, true)],
            },
            text('text', 'Opis', 160),
          ],
        },
        {
          name: 'shortcuts',
          label: 'Skróty',
          type: 'array',
          maxRows: 2,
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'icon',
                  label: 'Ikona',
                  type: 'select',
                  required: true,
                  defaultValue: 'wand',
                  options: [
                    { label: 'Kreator (różdżka)', value: 'wand' },
                    { label: 'Audyt (lupa)', value: 'search' },
                  ],
                },
                text('title', 'Tytuł', 50, true),
                hrefField('href', 'Link', true),
              ],
            },
            text('text', 'Opis', 90),
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Formularz',
      fields: [
        {
          type: 'row',
          fields: [
            text('formEyebrow', 'Nad nagłówkiem', 40, true),
            text('formTitle', 'Nagłówek (H2)', 80, true),
          ],
        },
        text(
          'topicsLabel',
          'Pytanie o temat',
          60,
          true,
          'Tematy są stałe (spec. §7) — zapisują się w zgłoszeniu.',
        ),
        {
          type: 'row',
          fields: [
            text('messageLabel', 'Opis — etykieta', 60, true),
            text('messagePlaceholder', 'Opis — podpowiedź', 120),
          ],
        },
        {
          type: 'row',
          fields: [
            text('projectMessageLabel', 'Opis przy „Twoim projekcie” — etykieta', 60, true),
            text('projectMessagePlaceholder', 'Opis przy „Twoim projekcie” — podpowiedź', 120),
          ],
        },
        text('hintsLabel', 'Podpowiedzi — etykieta', 30),
        {
          name: 'hints',
          label: 'Podpowiedzi do opisu',
          type: 'array',
          maxRows: 30,
          admin: {
            description:
              'Kliknięta dopisuje się do opisu. Bez tematu: podpowiedzi „Bez tematu”; ostatnia „Wszystkie tematy” dochodzi zawsze.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'topic',
                  label: 'Temat',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Bez tematu', value: 'none' },
                    { label: 'Wszystkie tematy', value: 'all' },
                    ...Object.entries(SOFTWARE_TOPIC_LABELS).map(([value, label]) => ({
                      label,
                      value,
                    })),
                  ],
                },
                text('text', 'Podpowiedź', 60, true),
              ],
            },
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
            text('contactHint', 'Kontakt — dopisek pod polem', 60),
          ],
        },
        text('talkLabel', 'Pytanie o sposób rozmowy', 60, true),
        {
          type: 'row',
          fields: [text('submit', 'Przycisk', 30, true), text('submitNote', 'Obok przycisku', 140)],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Inne linie PRO-KOM',
      fields: [
        {
          type: 'row',
          fields: [
            text('linesEyebrow', 'Nad nagłówkiem', 40),
            text('linesTitle', 'Nagłówek (H2)', 80),
          ],
        },
        {
          name: 'linesText',
          label: 'Wstęp',
          type: 'textarea',
          maxLength: 300,
          admin: { description: 'Pusty nagłówek albo brak kart = bez sekcji.' },
        },
        {
          name: 'lines',
          label: 'Linie',
          type: 'array',
          maxRows: 5,
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'line',
                  label: 'Linia',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Biznes', value: 'biznes' },
                    { label: 'Instalacje', value: 'instalacje' },
                    { label: 'Tech', value: 'tech' },
                    { label: 'Główna (pro-kom.eu)', value: 'prokom' },
                  ],
                },
                text('label', 'Nazwa pod znakiem', 20, true),
              ],
            },
            text('text', 'Opis', 120, true),
            {
              type: 'row',
              fields: [
                text('linkLabel', 'Link — tekst', 60, true),
                hrefField('href', 'Link', true),
              ],
            },
          ],
        },
        linkGroup('linesMore', 'Link pod kartami'),
      ],
    },
    {
      type: 'collapsible',
      label: 'Gdzie się spotkamy',
      fields: [
        {
          type: 'row',
          fields: [
            text('meetEyebrow', 'Nad nagłówkiem', 40),
            text('meetTitle', 'Nagłówek (H2)', 80),
          ],
        },
        {
          name: 'places',
          label: 'Miejsca',
          type: 'array',
          maxRows: 4,
          admin: { description: `Pierwsze jest wyróżnione. ${FACTS_NOTE}` },
          fields: [
            {
              type: 'row',
              fields: [text('title', 'Miejsce', 40, true), text('text', 'Opis', 90, true)],
            },
          ],
        },
        {
          type: 'row',
          fields: [
            text('mapCaption', 'Mapa — podpis', 30),
            text('navigateLabel', 'Mapa — przycisk', 20),
            {
              ...hrefField('mapHref', 'Mapa — link (Mapy Google)'),
              admin: { description: 'Pusty = bez mapy. Bez osadzania mapy (bez ciasteczek).' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            text('companyTitle', 'Dane firmy — tytuł', 30),
            text('companyNote', 'Dane firmy — dopisek po NIP', 30),
          ],
        },
      ],
    },
  ],
}
