import type { GroupField, TextField } from 'payload'

import { isValidNavHref } from '../lib/site/link'

type LinkSiblings = { label?: unknown; href?: unknown }

const HREF_ERROR = 'Ścieżka (/kontakt), adres https://, mailto: albo tel:.'

/** Link target typed by an editor: empty passes unless required (`isValidNavHref`). */
function validateHref(value: unknown, required: boolean): true | string {
  if (!value) return required ? 'Podaj link.' : true
  return typeof value === 'string' && isValidNavHref(value) ? true : HREF_ERROR
}

/** Button/link of a block. Optional link: both fields empty = no link, otherwise both needed. */
export function linkGroup(name: string, label: string, required = false): GroupField {
  // Custom `validate` replaces Payload's own `required` check, so both cases are handled here.
  return {
    name,
    label,
    type: 'group',
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'label',
            label: 'Etykieta',
            type: 'text',
            required,
            validate: (value: unknown, { siblingData }: { siblingData: LinkSiblings }) =>
              !value && (required || siblingData.href) ? 'Podaj etykietę linku.' : true,
          },
          {
            name: 'href',
            label: 'Link',
            type: 'text',
            required,
            validate: (value: unknown, { siblingData }: { siblingData: LinkSiblings }) =>
              validateHref(value, required || Boolean(siblingData.label)),
          },
        ],
      },
    ],
  }
}

/** A link target alone (the whole card is the link, so it has no label of its own). */
export function hrefField(name: string, label: string, required = false): TextField {
  return {
    name,
    label,
    type: 'text',
    required,
    validate: (value: unknown) => validateHref(value, required),
  }
}
