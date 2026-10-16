import { APIError } from 'payload'
import type { ArrayField, CollectionBeforeDeleteHook, CollectionConfig, FieldHook } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { clearTenantCache } from '../lib/tenant/byHost'
import { findDuplicateHosts, normalizeHost } from '../lib/tenant/host'
import { isValidTenantSlug } from '../lib/tenant/slug'

const LINES = [
  { label: 'PRO-KOM (hub)', value: 'prokom' },
  { label: 'Biznes', value: 'biznes' },
  { label: 'Instalacje', value: 'instalacje' },
  { label: 'Software', value: 'software' },
]

const ENVIRONMENTS = [
  { label: 'Produkcja', value: 'production' },
  { label: 'Staging', value: 'staging' },
  { label: 'Lokalnie', value: 'local' },
]

type DomainRow = { host?: string | null }

const normalizeHostField: FieldHook = ({ value }) =>
  typeof value === 'string' ? (normalizeHost(value) ?? value) : value

/** Each host belongs to exactly one tenant, otherwise routing by domain is ambiguous. */
const validateDomains: ArrayField['validate'] = async (value, { id, req }) => {
  const rows = (Array.isArray(value) ? value : []) as DomainRow[]
  const hosts = rows.map((row) => row.host ?? '').filter(Boolean)
  if (hosts.length === 0) return 'Dodaj co najmniej jedną domenę.'

  const invalid = hosts.find((host) => !normalizeHost(host))
  if (invalid) return `Niepoprawna domena: ${invalid}`

  const duplicates = findDuplicateHosts(hosts)
  if (duplicates.length > 0) return `Domena podana dwa razy: ${duplicates.join(', ')}`

  const normalized = hosts.map((host) => normalizeHost(host) as string)
  const { docs } = await req.payload.find({
    collection: 'tenants',
    where: {
      and: [
        { 'domains.host': { in: normalized } },
        ...(id !== undefined ? [{ id: { not_equals: id } }] : []),
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const [other] = docs
  if (other) {
    const taken = other.domains?.map((row) => row.host).filter((host) => normalized.includes(host))
    return `Domena ${taken?.join(', ')} należy już do strony „${other.name}”.`
  }
  return true
}

/**
 * `cleanupAfterTenantDelete` is off (content must never vanish silently), so a tenant still
 * referenced by users would fail on a database constraint. Refuse with a readable message
 * instead; deactivating (`active` = false) is the normal way to take a site offline.
 * Tenant-scoped content would otherwise be orphaned (`ON DELETE set null`).
 * TODO(S5/S7): also count Pages and Media here.
 */
const preventDeleteWhileInUse: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const [users, settings] = await Promise.all([
    req.payload.count({
      collection: 'users',
      where: { 'tenants.tenant': { equals: id } },
      overrideAccess: true,
      req,
    }),
    req.payload.count({
      collection: 'site-settings',
      where: { tenant: { equals: id } },
      overrideAccess: true,
      req,
    }),
  ])
  if (users.totalDocs > 0) {
    throw new APIError(
      `Tej strony nie można usunąć: ma przypisanych użytkowników (${users.totalDocs}). ` +
        'Najpierw ich odepnij albo wyłącz stronę polem „Aktywna”.',
      400,
      null,
      true,
    )
  }
  if (settings.totalDocs > 0) {
    throw new APIError(
      'Tej strony nie można usunąć: ma zapisane ustawienia strony. ' +
        'Wyłącz ją polem „Aktywna” albo najpierw usuń jej ustawienia.',
      400,
      null,
      true,
    )
  }
}

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  labels: { singular: 'Strona', plural: 'Strony' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'line', 'active'],
  },
  // Editors see their own tenants (plugin constraint); only admins change them.
  // The public site never reads this collection through the API — see `lib/tenant/byHost`.
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  hooks: {
    afterChange: [() => clearTenantCache()],
    beforeDelete: [preventDeleteWhileInUse],
    afterDelete: [() => clearTenantCache()],
  },
  fields: [
    { name: 'name', label: 'Nazwa', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: (value: unknown) =>
        typeof value === 'string' && isValidTenantSlug(value)
          ? true
          : 'Tylko małe litery, cyfry i pojedyncze myślniki, np. „biznes”.',
      admin: { description: 'Krótki identyfikator, np. „biznes”. Nie zmieniaj po starcie strony.' },
    },
    { name: 'line', label: 'Linia', type: 'select', required: true, options: LINES },
    {
      name: 'domains',
      label: 'Domeny',
      type: 'array',
      required: true,
      minRows: 1,
      validate: validateDomains,
      admin: {
        description: 'Sama nazwa hosta, bez https:// i portu, np. prokombiznes.pl.',
      },
      fields: [
        {
          name: 'host',
          label: 'Domena',
          type: 'text',
          required: true,
          // Database-level guarantee on top of `validateDomains` (e.g. concurrent saves).
          unique: true,
          hooks: { beforeValidate: [normalizeHostField] },
        },
        {
          name: 'environment',
          label: 'Środowisko',
          type: 'select',
          required: true,
          defaultValue: 'production',
          options: ENVIRONMENTS,
        },
      ],
    },
    {
      name: 'notificationEmail',
      label: 'E-mail powiadomień o zapytaniach',
      type: 'email',
    },
    {
      name: 'active',
      label: 'Aktywna',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Nieaktywna strona zwraca 404 na wszystkich swoich domenach.' },
    },
  ],
}
