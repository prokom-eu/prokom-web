import type { GroupField } from 'payload'

import { isValidNavHref } from '../lib/site/link'

type LinkSiblings = { label?: unknown; href?: unknown }

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
            validate: (value: unknown, { siblingData }: { siblingData: LinkSiblings }) => {
              if (!value) return required || siblingData.label ? 'Podaj link.' : true
              return typeof value === 'string' && isValidNavHref(value)
                ? true
                : 'Ścieżka (/kontakt), adres https://, mailto: albo tel:.'
            },
          },
        ],
      },
    ],
  }
}
