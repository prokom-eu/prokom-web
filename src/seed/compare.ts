/**
 * Whether a stored document already has these values (depth 0: relations are ids). Empty
 * values (null, undefined) are equal, and keys the data does not set are ignored — also inside
 * groups and array rows, where Payload adds its own keys (`id` of every row). So an import
 * updates a record only when the package changed it, without new versions on every run.
 */
export function hasSameValues(stored: unknown, data: unknown): boolean {
  if (isEmpty(data)) return isEmpty(stored)
  if (Array.isArray(data)) {
    return (
      Array.isArray(stored) &&
      stored.length === data.length &&
      data.every((item, index) => hasSameValues(stored[index], item))
    )
  }
  if (data && typeof data === 'object') {
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return false
    const record = stored as Record<string, unknown>
    return Object.entries(data).every(([key, value]) => hasSameValues(record[key], value))
  }
  return stored === data
}

function isEmpty(value: unknown): value is null | undefined {
  return value === null || value === undefined
}
