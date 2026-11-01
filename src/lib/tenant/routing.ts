import { normalizeHost } from './host'

export type RouteDecision =
  | { type: 'next' }
  | { type: 'notFound' }
  /** Render the site's own 404 page (rewrite; the page answers with status 404). */
  | { type: 'notFoundPage'; pathname: string }
  | { type: 'redirect'; pathname: string }
  | { type: 'rewrite'; pathname: string }
  /** Forward to the Umami container (ADR-020); `pathname` is the path there. */
  | { type: 'analytics'; pathname: string }

type RouteInput = {
  host: string | null
  pathname: string
  /** HTTP method; defaults to GET. */
  method?: string
  /** Normalized panel host (`PANEL_HOST`). */
  panelHost: string
}

const PANEL_ONLY_PREFIXES = ['/admin', '/api']
// Folders of `public/` served as they are. An explicit list on purpose: guessing "a file"
// from a dot in the path once let `/<other domain>` skip the rewrite and render that tenant.
// Add a folder here when one is added to `public/`.
// `/software/rozwiazania`: thumbnails of the Software solutions (SWR3, spec. §5.2).
// `/instalacje/ev`: photos of the Elzab EcoPower chargers (Instalacje I9, spec §2.5).
const PUBLIC_PREFIXES = ['/brand', '/software/rozwiazania', '/instalacje/ev']
// The one part of the Payload API a site domain needs: files of the upload collections, which
// Payload serves only after its `read` access (tenant of the `Host`, see `lib/media/access`).
const UPLOAD_FILE = /^\/api\/(media|partners)\/file\/[^/]+$/
const READ_METHODS = ['GET', 'HEAD']
// The inquiry endpoint (ADR-003): a Next route handler outside Payload, create only.
const INQUIRY_PATH = '/api/inquiry'
// A fresh form token for forms on cached pages (the Biznes drawer, K4-FINAL §5): read only,
// returns a signed time, no data.
const INQUIRY_TOKEN_PATH = '/api/inquiry-token'
// Catalog index of the Biznes site (ADR-012 §2.4): a Next route handler outside Payload, read
// only; the handler answers 404 on domains of other lines.
const CATALOG_INDEX_PATH = '/api/catalog-index'
// Solutions index of the Software site (ADR-014 §4): the same kind of handler, read only; it
// answers 404 on domains of other lines.
const SOLUTIONS_INDEX_PATH = '/api/solutions-index'
// One drawing of „Plan Twojej firmy” (K31d′): read only, a scene slug; the handler answers 404
// on domains of other lines and re-checks the drawing.
const PLAN_SVG = /^\/api\/plan-svg\/[a-z0-9-]{1,60}$/
// Liveness of the app and its database (S9): Docker, the smoke test and monitoring call it by
// IP or any domain, so it answers on every host. Read only, returns no data.
const HEALTH_PATH = '/api/health'
// Cookieless statistics (ADR-020): the Umami script and its event endpoint, forwarded by the
// proxy to the container on the same domain. Anything else under the prefix is not served (the
// Umami API and panel stay off the sites).
const ANALYTICS_PREFIX = '/_s'
const ANALYTICS_PATHS: Record<string, string> = { '/script.js': 'GET', '/api/send': 'POST' }
// Not a valid page slug, so `[domain]/[slug]` answers with the site's 404 page.
export const NOT_FOUND_SEGMENT = '_404'

function startsWithSegment(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

/**
 * Decides what the proxy does with a request (ADR-006):
 * - panel domain: only the admin panel and the Payload API,
 * - any other domain: never the admin or the API (only uploaded image files, inquiries and their form token, the
 *   catalog and solutions indexes, plan drawings, the analytics proxy and the health check); pages are rewritten to
 *   `/<host>/<path>`, where the `[domain]` layout resolves the tenant (unknown → 404).
 */
export function decideRoute({
  host: rawHost,
  pathname,
  method = 'GET',
  panelHost,
}: RouteInput): RouteDecision {
  const host = normalizeHost(rawHost)
  if (!host) return { type: 'notFound' }
  if (pathname === HEALTH_PATH && READ_METHODS.includes(method)) return { type: 'next' }

  const panelOnly = PANEL_ONLY_PREFIXES.some((prefix) => startsWithSegment(pathname, prefix))

  if (host === panelHost) {
    if (panelOnly) return { type: 'next' }
    if (pathname === '/') return { type: 'redirect', pathname: '/admin' }
    return { type: 'notFound' }
  }

  if (startsWithSegment(pathname, ANALYTICS_PREFIX)) {
    const target = pathname.slice(ANALYTICS_PREFIX.length)
    const allowed = Object.hasOwn(ANALYTICS_PATHS, target) && ANALYTICS_PATHS[target] === method
    return allowed ? { type: 'analytics', pathname: target } : { type: 'notFound' }
  }
  if (UPLOAD_FILE.test(pathname) && READ_METHODS.includes(method)) return { type: 'next' }
  if (pathname === INQUIRY_PATH && method === 'POST') return { type: 'next' }
  if (pathname === INQUIRY_TOKEN_PATH && READ_METHODS.includes(method)) return { type: 'next' }
  if (pathname === CATALOG_INDEX_PATH && READ_METHODS.includes(method)) return { type: 'next' }
  if (pathname === SOLUTIONS_INDEX_PATH && READ_METHODS.includes(method)) return { type: 'next' }
  if (PLAN_SVG.test(pathname) && READ_METHODS.includes(method)) return { type: 'next' }
  if (panelOnly) return { type: 'notFoundPage', pathname: `/${host}/${NOT_FOUND_SEGMENT}` }
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(`${prefix}/`))) return { type: 'next' }
  return { type: 'rewrite', pathname: pathname === '/' ? `/${host}` : `/${host}${pathname}` }
}
