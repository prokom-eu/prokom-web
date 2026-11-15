import type { Field } from 'payload'

import { linkGroup } from '../blocks/fields'
import { ICON_OPTIONS } from '../lib/catalog/options'
import { INDUSTRY_GROUPS, WIZARD_FIRMS } from '../lib/software/options'
import { onLine } from '../lib/tenant/copyLine'

const iconField: Field = { name: 'icon', label: 'Ikona', type: 'select', options: ICON_OPTIONS }

/**
 * Industry page of the Software line (ADR-014 §1.6, rozstrz. SW0 1, v20 8; plansza `Branza`).
 * Shown in the panel only for Software. Name, slug, active, hero, FAQ, order and SEO stay the
 * shared fields of the industry — the group has no hero or FAQ of its own.
 */
export const industrySoftwareGroup: Field = {
  name: 'software',
  label: 'Software',
  type: 'group',
  admin: { condition: onLine('software') },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'group',
          label: 'Grupa w katalogu',
          type: 'select',
          options: [...INDUSTRY_GROUPS],
          admin: { description: 'Filtr „Branża” w katalogu rozwiązań.' },
        },
        {
          name: 'wizardFirm',
          label: 'Rodzaj firmy w kreatorze',
          type: 'select',
          options: [...WIZARD_FIRMS],
          admin: { description: '„Złóż system” otwiera kreator z tym rodzajem (puste = bez).' },
        },
      ],
    },
    {
      name: 'wizardTitle',
      label: 'Nagłówek sekcji kreatora',
      type: 'text',
      maxLength: 90,
      admin: { description: 'Np. „Złóż system dla swojej firmy w 60 sekund”.' },
    },
    {
      name: 'problems',
      label: 'Problemy i rozwiązania',
      type: 'array',
      maxRows: 6,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'question', label: 'Problem', type: 'text', required: true, maxLength: 90 },
            { name: 'note', label: 'Dopowiedzenie', type: 'text', maxLength: 90 },
            iconField,
          ],
        },
        { name: 'title', label: 'Rozwiązanie — nagłówek', type: 'text', maxLength: 90 },
        { name: 'text', label: 'Rozwiązanie — opis', type: 'textarea', maxLength: 400 },
        {
          name: 'features',
          label: 'Cechy',
          type: 'text',
          hasMany: true,
          maxRows: 3,
        },
        { name: 'solution', label: 'Rozwiązanie', type: 'relationship', relationTo: 'solutions' },
        linkGroup('cta', 'Przycisk'),
      ],
    },
    {
      name: 'moduleMap',
      label: 'Mapa modułów',
      type: 'array',
      maxRows: 8,
      admin: { description: 'Moduły wokół telefonu w nagłówku: pozycja w % i opóźnienie w s.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', label: 'Nazwa', type: 'text', required: true, maxLength: 40 },
            iconField,
            { name: 'x', label: 'X (%)', type: 'number', required: true, min: 0, max: 100 },
            { name: 'y', label: 'Y (%)', type: 'number', required: true, min: 0, max: 100 },
            { name: 'delay', label: 'Opóźnienie (s)', type: 'number', min: 0, max: 10 },
          ],
        },
      ],
    },
    {
      name: 'offline',
      label: 'Bez zasięgu (kroki)',
      type: 'array',
      maxRows: 3,
      fields: [
        { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 60 },
        { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 300 },
      ],
    },
    {
      name: 'page',
      label: 'Teksty strony branży',
      type: 'group',
      admin: {
        description:
          'Plansza `Branza`: H1 i wstęp są w „Nagłówek strony branży”, pytania w „Pytania”. Puste pole = ta część bez tekstu albo tekst wspólny.',
      },
      fields: [
        {
          name: 'heroAccent',
          label: 'H1 — wyróżnienie',
          type: 'text',
          maxLength: 60,
          admin: { description: 'Dalsza część H1 w kolorze, np. „w terenie, nie przy biurku.”' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'hubTitle',
              label: 'Środek mapy modułów',
              type: 'text',
              maxLength: 24,
              admin: { description: 'Np. „3 ekipy”.' },
            },
            {
              name: 'hubCaption',
              label: 'Podpis środka',
              type: 'text',
              maxLength: 30,
              admin: { description: 'Np. „jeden system”.' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'problemsEyebrow',
              label: 'Problemy — nadtytuł',
              type: 'text',
              maxLength: 40,
              admin: { description: 'Np. „Co zabiera czas w budowlance”.' },
            },
            {
              name: 'solutionsEyebrow',
              label: 'Rozwiązania — nadtytuł',
              type: 'text',
              maxLength: 40,
              admin: { description: 'Np. „Najczęściej w budowlance”.' },
            },
            {
              name: 'faqEyebrow',
              label: 'Pytania — nadtytuł',
              type: 'text',
              maxLength: 40,
              admin: { description: 'Np. „Pytania z budowlanki”.' },
            },
          ],
        },
        { name: 'problemsLead', label: 'Problemy — wstęp', type: 'textarea', maxLength: 240 },
        {
          name: 'offlineBox',
          label: 'Blok „bez zasięgu” (ciemny)',
          type: 'group',
          admin: { description: 'Pusty nagłówek = bez bloku. Kroki są w „Bez zasięgu (kroki)”.' },
          fields: [
            { name: 'eyebrow', label: 'Nadtytuł', type: 'text', maxLength: 40 },
            {
              type: 'row',
              fields: [
                { name: 'title', label: 'Nagłówek', type: 'text', maxLength: 90 },
                { name: 'accent', label: 'Nagłówek — wyróżnienie', type: 'text', maxLength: 60 },
              ],
            },
            { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
            {
              type: 'row',
              fields: [
                { name: 'noteLabel', label: 'Karta — etykieta', type: 'text', maxLength: 40 },
                { name: 'noteValue', label: 'Karta — wartość', type: 'text', maxLength: 30 },
                { name: 'noteCaption', label: 'Karta — podpis', type: 'text', maxLength: 40 },
              ],
            },
          ],
        },
        {
          name: 'contact',
          label: 'Kontakt na końcu (ciemny)',
          type: 'group',
          admin: { description: 'Puste = teksty wspólne bloku kontaktu.' },
          fields: [
            { name: 'eyebrow', label: 'Nadtytuł', type: 'text', maxLength: 60 },
            { name: 'title', label: 'Nagłówek', type: 'text', maxLength: 90 },
            { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
            {
              name: 'points',
              label: 'Punkty',
              type: 'text',
              hasMany: true,
              maxRows: 3,
              maxLength: 60,
            },
          ],
        },
      ],
    },
    {
      name: 'topSolutions',
      label: 'Rozwiązania dla branży',
      type: 'relationship',
      relationTo: 'solutions',
      hasMany: true,
      maxRows: 6,
      admin: { description: 'Karty z katalogu, w tej kolejności (ceny z rozwiązań).' },
    },
  ],
}
