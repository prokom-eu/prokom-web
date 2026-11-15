import { tenantIdOf } from '../tenant/id'

/** Cache tag of the posts of one tenant (news list and post pages). */
export const postsTag = (tenantId: number) => `tenant:${tenantId}:posts`

/** Tags to mark stale after a post changed: its tenant, and the previous one if it moved. */
export function postsTagsOf(doc: { tenant?: unknown }, previous?: { tenant?: unknown }): string[] {
  const ids = [tenantIdOf(doc.tenant), tenantIdOf(previous?.tenant)]
  return [...new Set(ids.filter((id): id is number => id !== null))].map(postsTag)
}
