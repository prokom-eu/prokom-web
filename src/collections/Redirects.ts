import type { CollectionConfig, FieldHook, PayloadRequest, Where } from 'payload'

import { adminOnly } from '../lib/auth/access'
import { clearRedirectCache } from '../lib/redirects/byHost'
import { isValidRedirectTarget, normalizeRedirectPath } from '../lib/redirects/rules'
import { tenantIdOf } from '../lib/tenant/id'

// Stored in canonical form, so the unique index (tenant, from) also catches `/a` vs `/a/`.
const normalizeFrom: FieldHook = ({ value }) =>
  typeof value === 'string' ? (normalizeRedirectPath(value) ?? value) : value

type ValidateArgs = {
  id?: number | string
  data: Partial<{ tenant: unknown; from: unknown }>
  siblingData: Partial<{ from: unknown }>
  req: PayloadRequest
}

/** Is there already another rule of the tenant with this source? */
async function sourceTaken(source: string, { id, data, req }: ValidateArgs): Promise<boolean> {
  const tenantId = tenantIdOf(data.tenant)
  if (tenantId === null) return false // the plugin's tenant field reports the missing tenant
  const where: Where = {
    and: [
      { tenant: { equals: tenantId } },
      { from: { equals: source } },
      ...(id !== undefined ? [{ id: { not_equals: id } }] : []),
    ],
  }
  const { totalDocs } = await req.payload.count({
    collection: 'redirects',
    where,
    overrideAccess: true,
    req,
  })
  return totalDocs > 0
}

/**
 * 301 redirects of one site (ADR-006, uzupełnienie S7b): own collection instead of the
 * official plugin (its `from` is unique across all sites). Applied in `proxy.ts` before any
 * page, so a rule wins over a page at the same address.
 */
export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Przekierowanie', plural: 'Przekierowania' },
  admin: { useAsTitle: 'from', defaultColumns: ['from', 'to', 'updatedAt'] },
  // Read only in the panel; the proxy reads rules server-side (`lib/redirects/byHost`).
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: adminOnly,
  },
  indexes: [{ fields: ['tenant', 'from'], unique: true }],
  hooks: {
    afterChange: [() => clearRedirectCache()],
    afterDelete: [() => clearRedirectCache()],
  },
  fields: [
    {
      name: 'from',
      label: 'Stary adres',
      type: 'text',
      required: true,
      hooks: { beforeValidate: [normalizeFrom] },
      // Unique per tenant: database index + a readable message here (like `Pages.slug`).
      validate: async (value: unknown, args: ValidateArgs) => {
        const source = typeof value === 'string' ? normalizeRedirectPath(value) : null
        if (!source) return 'Sama ścieżka na tej domenie, np. /stara-oferta (bez domeny, ? i #).'
        return (await sourceTaken(source, args))
          ? `Ta strona ma już przekierowanie z „${source}”.`
          : true
      },
      admin: { description: 'Ścieżka, z której przekierować, np. /oferta/kasy.html.' },
    },
    {
      name: 'to',
      label: 'Nowy adres',
      type: 'text',
      required: true,
      // No loops: the target must not be a source itself (every loop closes on such a rule;
      // browsers keep 301 answers, so a loop would stay with visitors after the fix).
      validate: async (value: unknown, args: ValidateArgs) => {
        if (typeof value !== 'string' || !isValidRedirectTarget(value)) {
          return 'Ścieżka tej strony (/oferta) albo pełny adres https://.'
        }
        const from = typeof args.siblingData.from === 'string' ? args.siblingData.from : ''
        const target = value.startsWith('/') ? normalizeRedirectPath(value) : null
        if (target && target === normalizeRedirectPath(from)) {
          return 'Nowy adres musi być inny niż stary.'
        }
        if (target && (await sourceTaken(target, args))) {
          return `Adres „${target}” jest już przekierowany — wskaż od razu adres docelowy.`
        }
        return true
      },
    },
  ],
}
