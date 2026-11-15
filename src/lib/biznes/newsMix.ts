import type { SisterLine } from '@/lib/posts/sister'

/** Lines of the other PRO-KOM sites, one post of each in the Biznes home news (15.11). */
const SISTER_ORDER: readonly SisterLine[] = ['instalacje', 'software']

/**
 * The list beside the featured post of the Biznes home news (decision of Krystian 15.11: „ma być
 * różnorodnie”): one more Biznes post, then the newest post of Instalacje and of Software. A
 * missing line is made up by more Biznes posts, then by more posts of the other lines.
 * `own` = Biznes posts after the featured one, newest first; `sister` = posts of the other lines,
 * newest first.
 */
export function homeNewsMix<O, S extends { line: SisterLine }>(
  own: readonly O[],
  sister: readonly S[],
  size = 3,
): { own: O[]; sister: S[] } {
  const pickedOwn = own.slice(0, Math.min(1, size))
  const pickedSister = SISTER_ORDER.flatMap((line) => {
    const post = sister.find((item) => item.line === line)
    return post ? [post] : []
  }).slice(0, size - pickedOwn.length)
  let missing = size - pickedOwn.length - pickedSister.length
  for (const post of own.slice(pickedOwn.length)) {
    if (missing <= 0) break
    pickedOwn.push(post)
    missing--
  }
  for (const post of sister) {
    if (missing <= 0) break
    if (pickedSister.includes(post)) continue
    pickedSister.push(post)
    missing--
  }
  return { own: pickedOwn, sister: pickedSister }
}
