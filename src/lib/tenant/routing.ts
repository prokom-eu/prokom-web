import { normalizeHost } from './host'

export type RouteDecision =
  | { type: 'next' }
  | { type: 'notFound' }
  | { type: 'redirect'; pathname: string }
  | { type: 'rewrite'; pathname: string }

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
const PUBLIC_PREFIXES = ['/brand']
// The one part of the Payload API a site domain needs: files of the upload collections, which
// Payload serves only after its `read` access (tenant of the `Host`, see `lib/media/access`).
const UPLOAD_FILE = /^\/api\/(media|partners)\/file\/[^/]+$/
const READ_METHODS = ['GET', 'HEAD']

function startsWithSegment(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

/**
 * Decides what the proxy does with a request (ADR-006):
 * - panel domain: only the admin panel and the Payload API,
 * - any other domain: never the admin or the API (only uploaded image files); pages are rewritten to
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

  const panelOnly = PANEL_ONLY_PREFIXES.some((prefix) => startsWithSegment(pathname, prefix))

  if (host === panelHost) {
    if (panelOnly) return { type: 'next' }
    if (pathname === '/') return { type: 'redirect', pathname: '/admin' }
    return { type: 'notFound' }
  }

  if (UPLOAD_FILE.test(pathname) && READ_METHODS.includes(method)) return { type: 'next' }
  if (panelOnly) return { type: 'notFound' }
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(`${prefix}/`))) return { type: 'next' }
  return { type: 'rewrite', pathname: pathname === '/' ? `/${host}` : `/${host}${pathname}` }
}
