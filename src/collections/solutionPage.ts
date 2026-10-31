import type { Tab } from 'payload'

import { ICON_OPTIONS } from '../lib/catalog/options'
import { validateSolutionDemo } from '../lib/software/solutionPage'

/**
 * Tab „Strona” of `Solutions` = `page` (ADR-014 SW2a pkt 5, SW10): texts of the full page
 * `/rozwiazania/<adres>` from the board `Rozwiazanie`. Every field is optional — an empty one
 * falls back to the card and the offer window (`lib/software/solutionPage.ts`), so a solution
 * has a page from the start. Prices and terms never live here: they come from „Ceny i terminy”.
 */
export const solutionPageTab: Tab = {
  name: 'page',
  label: 'Strona',
  description:
    'Pełna strona rozwiązania. Puste pola = treść z karty i okna oferty. Ceny i terminy zawsze z zakładki „Ceny i terminy”. Fakty w nawiasach, np. [CZAS ODPOWIEDZI], podstawiają się same.',
  fields: [
    {
      name: 'eyebrow',
      label: 'Nadtytuł',
      type: 'text',
      maxLength: 90,
      admin: { description: 'Np. „Aplikacja · budowlanka, instalatorzy, serwisy”.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'title', label: 'Nagłówek (H1)', type: 'text', maxLength: 90 },
        {
          name: 'titleAccent',
          label: 'Nagłówek — wyróżnienie',
          type: 'text',
          maxLength: 60,
          admin: { description: 'Dalsza część H1 w kolorze, np. „Działa bez zasięgu.”' },
        },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 400 },
    {
      name: 'priceCaption',
      label: 'Podpis pod ceną',
      type: 'text',
      maxLength: 120,
      admin: { description: 'Pierwszy kafel to zawsze cena rozwiązania; tu linia pod nią.' },
    },
    {
      name: 'tiles',
      label: 'Kafle obok nagłówka',
      labels: { singular: 'Kafel', plural: 'Kafle' },
      type: 'array',
      maxRows: 3,
      admin: {
        description: 'Np. „Pierwszy etap”, „Działa na”, „Opieka”. Puste = termin i dla kogo.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Etykieta', type: 'text', required: true, maxLength: 30 },
            { name: 'value', label: 'Wartość', type: 'text', required: true, maxLength: 30 },
          ],
        },
        { name: 'caption', label: 'Podpis', type: 'text', maxLength: 90 },
      ],
    },
    {
      name: 'demo',
      label: 'Demo telefonu (JSON)',
      type: 'json',
      validate: validateSolutionDemo,
      admin: {
        description:
          'Klikalne demo pod nagłówkiem: kroki, zadania, karty i ramka. Dziś jeden rodzaj („fieldCrew” — aplikacja dla ekip). Puste = miniatura rozwiązania.',
      },
    },
    {
      name: 'compare',
      label: 'Dziś / z rozwiązaniem / efekt',
      labels: { singular: 'Karta', plural: 'Karty' },
      type: 'array',
      maxRows: 3,
      fields: [
        { name: 'label', label: 'Etykieta', type: 'text', required: true, maxLength: 40 },
        { name: 'title', label: 'Nagłówek', type: 'text', required: true, maxLength: 120 },
        { name: 'text', label: 'Tekst', type: 'textarea', maxLength: 300 },
      ],
    },
    {
      name: 'deliverablesTitle',
      label: 'Co dostajesz — nagłówek',
      type: 'text',
      maxLength: 60,
      admin: { description: 'Np. „W cenie wdrożenia”.' },
    },
    {
      name: 'deliverables',
      label: 'Co dostajesz',
      labels: { singular: 'Punkt', plural: 'Punkty' },
      type: 'array',
      maxRows: 8,
      admin: {
        description:
          'Puste = „W cenie” i punkty kategorii. „Wyceniane osobno” to przykłady z okna oferty.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Nazwa', type: 'text', required: true, maxLength: 40 },
            { name: 'text', label: 'Opis', type: 'text', maxLength: 80 },
            { name: 'icon', label: 'Ikona', type: 'select', options: ICON_OPTIONS },
          ],
        },
      ],
    },
    {
      name: 'choice',
      label: 'Wybór wariantu',
      type: 'group',
      admin: { description: 'Np. „Z przeglądarki czy ze sklepu?”. Pusty nagłówek = bez bloku.' },
      fields: [
        { name: 'title', label: 'Nagłówek', type: 'text', maxLength: 60 },
        {
          name: 'options',
          label: 'Warianty',
          labels: { singular: 'Wariant', plural: 'Warianty' },
          type: 'array',
          maxRows: 2,
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', label: 'Nazwa', type: 'text', required: true, maxLength: 40 },
                { name: 'caption', label: 'Opis', type: 'text', maxLength: 90 },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'plus',
                  label: 'Zalety (✓)',
                  type: 'text',
                  hasMany: true,
                  maxRows: 4,
                  maxLength: 80,
                },
                {
                  name: 'minus',
                  label: 'Do wiedzenia (+)',
                  type: 'text',
                  hasMany: true,
                  maxRows: 4,
                  maxLength: 80,
                },
              ],
            },
          ],
        },
        { name: 'note', label: 'Uwaga pod blokiem', type: 'text', maxLength: 160 },
      ],
    },
    {
      name: 'faqEyebrow',
      label: 'Pytania — nadtytuł',
      type: 'text',
      maxLength: 40,
      admin: { description: 'Np. „Pytania o tę aplikację”.' },
    },
    {
      name: 'faq',
      label: 'Pytania na stronie',
      labels: { singular: 'Pytanie', plural: 'Pytania' },
      type: 'array',
      maxRows: 6,
      admin: { description: 'Puste = pytania z okna oferty. Trafiają też do danych dla Google.' },
      fields: [
        { name: 'q', label: 'Pytanie', type: 'text', required: true, maxLength: 120 },
        { name: 'a', label: 'Odpowiedź', type: 'textarea', required: true, maxLength: 600 },
      ],
    },
    {
      name: 'contact',
      label: 'Kontakt na końcu',
      type: 'group',
      admin: { description: 'Puste = teksty wspólne bloku kontaktu.' },
      fields: [
        { name: 'eyebrow', label: 'Nadtytuł', type: 'text', maxLength: 60 },
        { name: 'title', label: 'Nagłówek', type: 'text', maxLength: 120 },
        { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
        {
          name: 'quoteCaption',
          label: 'Podpis „Bezpłatna wycena”',
          type: 'text',
          maxLength: 90,
        },
      ],
    },
  ],
}
