/**
 * Address of the offer catalog, alone in its module (AUDYT-WYDAJNOSC-1111 #6): the frame's
 * „Twój projekt” needs only the address, and `catalog.ts` would bring the whole catalog with its
 * search to every page.
 */
export const CATALOG_PATH = '/rozwiazania'

/** The catalog's search parameter (`/rozwiazania?q=`), also for `WebSite` › `SearchAction`. */
export const CATALOG_QUERY_PARAM = 'q'
