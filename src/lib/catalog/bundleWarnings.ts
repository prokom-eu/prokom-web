import type { FieldHook } from 'payload'

type Item = { role?: string | null; product?: unknown; mandatory?: boolean | null }

const idOf = (value: unknown): number | null => {
  if (typeof value === 'number') return value
  if (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'number'
  ) {
    return (value as { id: number }).id
  }
  return null
}

/**
 * Warning of the panel (spec. §6.10, K3c): items whose card is hidden or deleted drop out of the
 * bundle on the site; without any required item the whole bundle is hidden. `null` = all fine.
 */
export function hiddenItemsWarning(
  items: readonly Item[] | null | undefined,
  published: ReadonlySet<number>,
): string | null {
  const list = items ?? []
  const hidden = list.filter((item) => {
    const id = idOf(item.product)
    return id === null || !published.has(id)
  })
  if (hidden.length === 0) return null
  const roles = hidden.map((item) => item.role?.trim() || 'element bez roli').join(', ')
  const anyRequired = list.some((item) => item.mandatory !== false && !hidden.includes(item))
  return [
    `Na stronie nie pokazują się (karta ukryta lub usunięta): ${roles}.`,
    ...(anyRequired ? [] : ['Bez obowiązkowego elementu cały zestaw jest ukryty na stronie.']),
  ].join(' ')
}

/**
 * `afterRead` of the virtual field `Bundles.hiddenItems`: only for a signed-in user reading one
 * bundle (the edit view) — the site and lists never pay for the extra query.
 */
export const hiddenItemsHook: FieldHook = async ({ data, req, findMany }) => {
  if (!req.user || findMany) return null
  const items = (data?.items ?? []) as Item[]
  const ids = items.flatMap((item) => idOf(item.product) ?? [])
  if (ids.length === 0) return hiddenItemsWarning(items, new Set())
  const { docs } = await req.payload.find({
    collection: 'products',
    where: { and: [{ id: { in: ids } }, { _status: { equals: 'published' } }] },
    draft: false,
    limit: ids.length,
    depth: 0,
    select: {},
    overrideAccess: true,
    req,
  })
  return hiddenItemsWarning(items, new Set(docs.map((doc) => doc.id)))
}
