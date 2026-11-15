import { unstable_cache } from 'next/cache'

/**
 * `unstable_cache` in production; a pass-through in `pnpm dev`. `pnpm seed*` writes to the database
 * outside Next.js, so no revalidation reaches the dev server — without this it would serve old data
 * for up to `PAGE_CACHE_SECONDS`. (`revalidate: 0` is not an option: `unstable_cache` throws on it.)
 */
export const cacheQuery: typeof unstable_cache =
  process.env.NODE_ENV === 'development' ? (cb) => cb : unstable_cache
