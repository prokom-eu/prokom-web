/** Tenant id from a relationship value: a plain id or a populated document. */
export function tenantIdOf(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'number') {
    return value.id
  }
  return null
}
