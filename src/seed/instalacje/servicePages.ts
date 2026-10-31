import type { ServiceKey } from '../../lib/instalacje/options'

/**
 * Services whose page is built in code (I4+): the seed gives their empty page its `instService`
 * block and publishes it. The same keys as `SERVICE_SECTION_IDS` (`servicePages.test.ts`), kept
 * here on purpose: CI restores a seeded database cached by a hash of `src/seed/**`, so a new page
 * must change a seed file, or the e2e tests get a snapshot without it (I7: /monitoring 404).
 */
export const SERVICE_PAGE_KEYS: readonly ServiceKey[] = ['ant', 'kam', 'alarm', 'kd', 'wifi']
