import { APIError } from 'payload'
import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
  Field,
} from 'payload'

import { adminOnly } from '../../lib/auth/access'
import { revalidatePageTags } from '../../lib/pages/revalidate'
import { HUB_LINE_LABELS, HUB_LINES } from '../../lib/prokom/lines'
import { hubTag } from '../../lib/prokom/tags'
import { blockedByMarker } from '../../lib/shared/publishMarker'
import { tenantIdOf } from '../../lib/tenant/id'
import { onlyLineTenant } from '../../lib/tenant/onlyLine'

/** Visible fields of a hub record → their panel labels, for the marker message. */
export type VisibleFields = Record<string, string>

/** A record with `[SZEF…]` / `[CENA…]` in a visible field stays a draft (ADR-H002 „Zasada”). */
function noMarkers(visible: VisibleFields): CollectionBeforeChangeHook {
  const fields = Object.keys(visible)
  return ({ data, originalDoc }) => {
    const field = blockedByMarker(fields, data, originalDoc)
    if (field) {
      throw new APIError(
        `Nie można opublikować: pole „${visible[field]}” ma znacznik [SZEF…] albo [CENA…]. Uzupełnij treść albo zostaw wersję roboczą.`,
        400,
        null,
        true,
      )
    }
    return data
  }
}

/** Fresh hub pages after a change in the panel; the seed writes outside a request (TTL applies). */
const revalidateHub: CollectionAfterChangeHook = ({ doc, req }) => {
  const tenantId = tenantIdOf(doc?.tenant)
  if (!req.context.seed && tenantId !== null) revalidatePageTags([hubTag(tenantId)], req.payload)
  return doc
}

/** What every hub collection shares: access, drafts, tenant line, marker guard, revalidation. */
export function hubCollection(
  config: Omit<CollectionConfig, 'access' | 'versions' | 'hooks'> & { visible: VisibleFields },
): CollectionConfig {
  const { visible, admin, ...rest } = config
  return {
    ...rest,
    admin: { group: 'pro-kom.eu', ...admin },
    access: {
      read: ({ req: { user } }) => Boolean(user),
      create: ({ req: { user } }) => Boolean(user),
      update: ({ req: { user } }) => Boolean(user),
      delete: adminOnly,
    },
    versions: { drafts: true, maxPerDoc: 20 },
    hooks: {
      beforeValidate: [onlyLineTenant('prokom', 'Te treści są tylko na stronie pro-kom.eu.')],
      beforeChange: [noMarkers(visible)],
      afterChange: [revalidateHub],
    },
  }
}

export const lineField: Field = {
  name: 'line',
  label: 'Linia',
  type: 'select',
  required: true,
  options: HUB_LINES.map((value) => ({ label: HUB_LINE_LABELS[value], value })),
}

export const orderField: Field = {
  name: 'order',
  label: 'Kolejność',
  type: 'number',
  required: true,
  defaultValue: 0,
  admin: { position: 'sidebar' },
}

/** Stable key of the design package (`b11`, `kasa`…): `pnpm seed:prokom` finds the record by it. */
export const keyField = (name = 'key', label = 'Klucz'): Field => ({
  name,
  label,
  type: 'text',
  required: true,
  admin: { position: 'sidebar', description: 'Stały identyfikator — nie zmieniaj.' },
})

/** A list of short texts (chips, steps). */
export const textList = (name: string, label: string, maxRows?: number): Field => ({
  name,
  label,
  type: 'text',
  hasMany: true,
  ...(maxRows ? { maxRows } : {}),
})

/** Address on the line's site or the hub: `https://…` or a path `/…`. */
export const urlField = (name: string, label: string, description: string): Field => ({
  name,
  label,
  type: 'text',
  admin: { description },
  validate: (value: unknown) =>
    !value || (typeof value === 'string' && /^(https:\/\/|\/)/.test(value))
      ? true
      : 'Podaj adres https://… albo ścieżkę /…',
})
