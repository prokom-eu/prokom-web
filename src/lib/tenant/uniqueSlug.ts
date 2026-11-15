import type { CollectionSlug, TextFieldSingleValidation, Where } from 'payload'

import { tenantIdOf } from './id'

// Same shape as page and tenant slugs: URL- and cache-tag-safe, one path segment.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidSlug(slug: string): boolean {
  return SLUG.test(slug)
}

/** Other documents of the same tenant with this slug (the edited one excluded). */
export function sameTenantSlugWhere(
  tenantId: number,
  slug: string,
  id: number | string | undefined,
): Where {
  return {
    and: [
      { tenant: { equals: tenantId } },
      { slug: { equals: slug } },
      ...(id !== undefined ? [{ id: { not_equals: id } }] : []),
    ],
  }
}

type Options = {
  /** Extra rule on top of the slug shape, e.g. reserved page addresses. */
  isValid?: (slug: string) => boolean
  /** Message for a slug of the wrong shape (or rejected by `isValid`). */
  invalidMessage: string
  /** Message for a slug taken in the tenant. */
  takenMessage: (slug: string) => string
}

/**
 * `validate` of a tenant-scoped `slug`: readable message on top of the unique
 * `['tenant', 'slug']` database index. Drafts are not validated (Payload default).
 */
export function tenantUniqueSlug(collection: CollectionSlug, options: Options) {
  const validate: TextFieldSingleValidation = async (value, { id, data, req }) => {
    if (typeof value !== 'string' || !isValidSlug(value) || options.isValid?.(value) === false) {
      return options.invalidMessage
    }
    const tenantId = tenantIdOf((data as { tenant?: unknown }).tenant)
    if (tenantId === null) return true // the plugin's tenant field reports the missing tenant
    const { totalDocs } = await req.payload.count({
      collection,
      where: sameTenantSlugWhere(tenantId, value, id),
      overrideAccess: true,
      req,
    })
    return totalDocs > 0 ? options.takenMessage(value) : true
  }
  return validate
}
