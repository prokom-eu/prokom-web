/**
 * `items.map(fn)` with at most `limit` calls running at once; results keep the input order.
 * The seed uses it for image uploads: resizing (sharp) is the slow part and uses several cores.
 * After the first error no new item starts (the caller closes Payload right after).
 */
export async function mapConcurrent<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (!Number.isInteger(limit) || limit < 1) throw new Error('mapConcurrent: limit from 1')
  const results = new Array<R>(items.length)
  let next = 0
  let failed = false
  async function worker() {
    while (!failed && next < items.length) {
      const index = next++
      try {
        results[index] = await fn(items[index]!, index)
      } catch (error) {
        failed = true
        throw error
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}
