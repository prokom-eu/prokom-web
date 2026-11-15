import { POST_CATEGORIES } from '../catalog/options'
import type { PostCategory } from './list'

type Categorised = { categoryValue: string | null | undefined }

export type PostGroup<T> = { value: PostCategory; label: string; posts: T[] }

/**
 * Posts grouped by category in the panel order (`POST_CATEGORIES`), each group in the order it
 * got (newest first from the list). Posts without a known category and empty groups are dropped.
 */
export function postGroups<T extends Categorised>(posts: readonly T[]): PostGroup<T>[] {
  return POST_CATEGORIES.flatMap(({ value, label }) => {
    const own = posts.filter((post) => post.categoryValue === value)
    return own.length > 0 ? [{ value, label, posts: own }] : []
  })
}

/**
 * The newest `count` posts as the featured row, the rest after them. Too few posts to fill the
 * row → nothing featured: a half-empty row looks broken, the plain list does not.
 */
export function splitFeatured<T>(posts: readonly T[], count: number): { featured: T[]; rest: T[] } {
  if (posts.length < count) return { featured: [], rest: [...posts] }
  return { featured: posts.slice(0, count), rest: posts.slice(count) }
}
