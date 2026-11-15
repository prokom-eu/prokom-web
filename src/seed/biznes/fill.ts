/**
 * Fields of `seed` the record still has empty, nested groups field by field — the seed fills
 * only those, so texts edited in the panel stay (a field emptied on purpose comes back on the
 * next local seed).
 */
export function missingFields(current: unknown, seed: object): Record<string, unknown> {
  const now = (current ?? {}) as Record<string, unknown>
  const patch: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(seed)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = missingFields(now[key], value)
      if (Object.keys(nested).length > 0) patch[key] = { ...(now[key] as object), ...nested }
    } else if (isBlank(now[key])) {
      patch[key] = value
    }
  }
  return patch
}

export const isBlank = (value: unknown) =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && value.trim() === '') ||
  (Array.isArray(value) && value.length === 0)
