import type { Field } from 'payload'

import { ICON_OPTIONS } from '../../../lib/catalog/options'
import { tenantImageFilter } from '../../../lib/media/access'

/**
 * Field helpers of the SW11b blocks (`swPageHero`, `swSteps`, `swTeam`, `swLines`): the same
 * eyebrow / heading / lead head as the start page sections and the photo placeholders of the
 * boards (`ONas`, `Wszystko`: „Zdjęcie do zrobienia” with what the photo should show).
 */

export const FACTS_NOTE = 'Fakty w nawiasach ([ROK ZAKOPANE], [GODZINY]…) z Ustawień linii.'

export function textField(
  name: string,
  label: string,
  maxLength: number,
  required = false,
  description?: string,
): Field {
  return {
    name,
    label,
    type: 'text',
    required,
    maxLength,
    ...(description && { admin: { description } }),
  }
}

/** Eyebrow, H2 and lead of a section (board `Main`, `SectionHead`). */
export const sectionHeadFields: Field[] = [
  {
    type: 'row',
    fields: [textField('eyebrow', 'Etykieta', 60), textField('heading', 'Nagłówek', 120, true)],
  },
  { name: 'lead', label: 'Wstęp', type: 'textarea', maxLength: 400 },
]

export const iconField = (name = 'icon', label = 'Ikona'): Field => ({
  name,
  label,
  type: 'select',
  options: ICON_OPTIONS,
})

/** Gradient behind a photo or its placeholder — the three tones of the boards. */
export const PHOTO_TONES = ['violet', 'teal', 'copper'] as const

/**
 * A photo with its placeholder: until a photo is uploaded the card shows the tone and what the
 * photo should show; the description never reaches production (spec. §13 pkt 25).
 */
export const photoFields: Field[] = [
  {
    name: 'photo',
    label: 'Zdjęcie',
    type: 'upload',
    relationTo: 'media',
    filterOptions: tenantImageFilter,
    admin: { description: 'Zdjęcia osób tylko za ich zgodą (spec. §6.6).' },
  },
  {
    type: 'row',
    fields: [
      textField(
        'photoCaption',
        'Co ma być na zdjęciu',
        140,
        true,
        'Tekst alternatywny po wgraniu; przed wgraniem — zaślepka, tylko poza produkcją.',
      ),
      {
        name: 'tone',
        label: 'Kolor tła',
        type: 'select',
        defaultValue: 'violet',
        required: true,
        options: [
          { label: 'Fiolet', value: 'violet' },
          { label: 'Morski', value: 'teal' },
          { label: 'Miedź', value: 'copper' },
        ],
      },
    ],
  },
]
