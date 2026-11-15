import { KASY_POSTS } from './kasy'
import { KSEF_POSTS } from './ksef'
import type { BiznesGuidePost } from './types'

export type { BiznesGuidePost } from './types'

/**
 * Biznes guide posts written in the repo (audyt 15.11 P1-3), newest first: the first one gets the
 * latest date, so the home page features it. A KSeF post leads while the deadline is ahead.
 */
export const BIZNES_GUIDE_POSTS: readonly BiznesGuidePost[] = [
  KSEF_POSTS[2],
  ...KASY_POSTS,
  KSEF_POSTS[0],
  KSEF_POSTS[1],
]

/**
 * Slugs of posts withdrawn on purpose (deleted in the panel or renamed there): the seed never
 * creates them again. Withdrawing a post = its slug here, not only a delete in the panel.
 */
export const RETIRED_GUIDE_SLUGS: readonly string[] = []
