import {
  getInstalacjeMenu,
  getInstalacjeOffer,
  getInstalacjeRealizations,
} from '@/lib/instalacje/data'
import { buildInstSearchIndex } from '@/lib/instalacje/searchIndex'
import { cacheQuery } from '@/lib/cache'
import { PAGE_CACHE_SECONDS } from '@/lib/pages/data'
import { postsTag } from '@/lib/posts/tags'
import { getPostList } from '@/lib/posts/data'
import type { LineSearchEntry } from '@/lib/shared/search/lineProvider'

import { glownaSekcje } from '../dane/glownaSekcje'
import { navigation } from '../dane/nawigacja'

/** Pages of the line that are not services or objects (the menu's „Strony” + the forms). */
const EXTRA_PAGES = [
  { label: 'Zaplanuj instalację', href: '/zaplanuj', caption: 'Kreator: 4 kroki, 2 minuty' },
  { label: 'Zgłoś awarię', href: '/serwis#zglos', caption: 'Serwis i przeglądy' },
]

/**
 * The search index of one Instalacje tenant (L1-I): published services and objects (the menu),
 * the offer's solutions, posts, realizations (published = with the client's consent), the pages
 * and the home FAQ. Fetched by the search window, not sent with every page. Cached per tenant for
 * the pages' TTL (the Instalacje collections have no revalidation hooks; posts do), so a visitor
 * costs no database round trip — a change in the panel shows up within a minute.
 */
export const getInstSearchIndex = (tenantId: number): Promise<LineSearchEntry[]> =>
  cacheQuery(() => loadInstSearchIndex(tenantId), ['inst-search-index', String(tenantId)], {
    tags: [postsTag(tenantId), `tenant:${tenantId}:inst-search`],
    revalidate: PAGE_CACHE_SECONDS,
  })()

async function loadInstSearchIndex(tenantId: number): Promise<LineSearchEntry[]> {
  const [menu, offer, posts, realizations] = await Promise.all([
    getInstalacjeMenu(tenantId),
    getInstalacjeOffer(tenantId),
    getPostList(tenantId, 'instalacje'),
    getInstalacjeRealizations(tenantId),
  ])
  return buildInstSearchIndex({
    menu,
    offer,
    posts: posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      href: post.href,
      category: post.category,
    })),
    realizations: realizations.map((realization) => ({
      id: realization.id,
      title: realization.title,
      place: realization.place,
      scope: realization.scope,
    })),
    pages: [...navigation.more, ...EXTRA_PAGES],
    faq: glownaSekcje.faq.items,
  })
}
