import type { Block } from 'payload'

import { hrefField, linkGroup } from '../../../../blocks/fields'
import { ICON_OPTIONS } from '../../../../lib/catalog/options'
import { tenantIdOf } from '../../../../lib/tenant/id'
import { NEED_TONES } from '../BzNeeds/config'

const MAX_TILES = 24
/** Board: 9 tiles and „Pokaż wszystkie” fill two rows of five. */
const MAX_VISIBLE_FIRST = 11

/**
 * „Plan Twojej firmy” of the Biznes home page (spec. §4 pkt 6, ZMIANY-v20 §2.4), stage 1: tabs
 * with numbered points (the floor plan and its pop-up are stage 2), the six promises, the grid
 * of industries (ADR-012 rozstrz. 11: tiles are data of this block, `Industries` unchanged) and
 * the funding bar.
 */
export const BzPlanBlock: Block = {
  slug: 'bzPlan',
  interfaceName: 'BzPlanBlock',
  labels: {
    singular: 'Biznes: plan firmy i branże',
    plural: 'Biznes: plan firmy i branże',
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'eyebrow', label: 'Etykieta', type: 'text' },
        {
          name: 'heading',
          label: 'Nagłówek',
          type: 'text',
          required: true,
          admin: { description: 'Sekcja ma kotwicę #plan — ten blok wstaw na stronie tylko raz.' },
        },
      ],
    },
    { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 300 },
    {
      type: 'row',
      fields: [
        {
          name: 'sceneNote',
          label: 'Dopisek przy liczbie rozwiązań',
          type: 'text',
          admin: { description: 'Np. „z jednej ręki · rzut poglądowy” — liczba dochodzi sama.' },
        },
        { name: 'moreLabel', label: 'Link „Więcej o branży”', type: 'text' },
        { name: 'inquiryLabel', label: 'Przycisk zapytania (przed nazwą sceny)', type: 'text' },
      ],
    },
    {
      name: 'scenes',
      label: 'Rodzaje firm (zakładki)',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      required: true,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'tab', label: 'Zakładka', type: 'text', required: true, maxLength: 20 },
            { name: 'icon', label: 'Ikona', type: 'select', required: true, options: ICON_OPTIONS },
            { name: 'title', label: 'Tytuł sceny', type: 'text', required: true },
          ],
        },
        { name: 'lead', label: 'Opis sceny', type: 'textarea', maxLength: 220 },
        {
          type: 'row',
          fields: [
            hrefField('moreHref', 'Link „Więcej o branży” (pusty = bez linku)'),
            hrefField('inquiryHref', 'Link przycisku zapytania', true),
          ],
        },
        {
          name: 'points',
          label: 'Punkty (urządzenia i programy)',
          type: 'array',
          maxRows: 16,
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', label: 'Nazwa', type: 'text', required: true, maxLength: 48 },
                { name: 'note', label: 'Podpis', type: 'text', maxLength: 60 },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'promises',
      label: 'Punkty z ptaszkiem pod planem',
      type: 'array',
      maxRows: 6,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: 'Tytuł', type: 'text', required: true, maxLength: 48 },
            { name: 'text', label: 'Tekst', type: 'text', maxLength: 90 },
          ],
        },
      ],
    },
    {
      name: 'industries',
      label: 'Siatka branż',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'heading', label: 'Nagłówek', type: 'text' },
            { name: 'lead', label: 'Wstęp', type: 'text' },
          ],
        },
        linkGroup('button', 'Przycisk obok nagłówka'),
        {
          type: 'row',
          fields: [
            { name: 'moreLabel', label: 'Kafel rozwijania — tytuł', type: 'text' },
            {
              name: 'moreNote',
              label: 'Kafel rozwijania — podpis',
              type: 'text',
              admin: { description: 'Np. „jeszcze 10 i każda inna firma”.' },
            },
          ],
        },
        {
          name: 'tiles',
          label: 'Kafle branż (kolejność = kolejność na stronie)',
          type: 'array',
          maxRows: MAX_TILES,
          // A custom `validate` replaces Payload's own, so the row limit is checked here too.
          validate: (value: unknown) => {
            const rows = Array.isArray(value) ? (value as { visibleFirst?: boolean | null }[]) : []
            if (rows.length > MAX_TILES) return `Najwyżej ${MAX_TILES} kafli.`
            const first = rows.filter((row) => row?.visibleFirst).length
            return first <= MAX_VISIBLE_FIRST
              ? true
              : `Najwyżej ${MAX_VISIBLE_FIRST} kafli „Widoczny od razu” (jest ${first}).`
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', label: 'Nazwa', type: 'text', required: true, maxLength: 40 },
                { name: 'note', label: 'Podpis', type: 'text', maxLength: 60 },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'icon',
                  label: 'Ikona',
                  type: 'select',
                  required: true,
                  options: ICON_OPTIONS,
                },
                {
                  name: 'tone',
                  label: 'Kolor',
                  type: 'select',
                  required: true,
                  defaultValue: 'blue',
                  options: [...NEED_TONES],
                },
                {
                  name: 'visibleFirst',
                  label: 'Widoczny od razu',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: { description: 'Na komputerze 11 widocznych, na telefonie pierwsze 5.' },
                },
              ],
            },
            {
              name: 'industry',
              label: 'Strona branży',
              type: 'relationship',
              relationTo: 'industries',
              filterOptions: ({ data }) => {
                const tenant = tenantIdOf(data?.tenant)
                return tenant === null ? false : { tenant: { equals: tenant } }
              },
              admin: { description: 'Pusta = kafel prowadzi do kreatora.' },
            },
          ],
        },
      ],
    },
    {
      name: 'funding',
      label: 'Pasek dofinansowań',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Etykieta', type: 'text' },
            { name: 'heading', label: 'Nagłówek', type: 'text' },
          ],
        },
        { name: 'text', label: 'Tekst', type: 'text' },
        {
          name: 'chips',
          label: 'Dla kogo',
          type: 'array',
          maxRows: 6,
          fields: [{ name: 'text', label: 'Tekst', type: 'text', required: true, maxLength: 30 }],
        },
        linkGroup('button', 'Przycisk'),
      ],
    },
  ],
}
