import { NextResponse, type NextRequest } from 'next/server'

import { analyticsRequestHeaders, umamiWebsiteId } from './lib/analytics/config'
import { getEnv } from './lib/env'
import { getRedirectsByHost } from './lib/redirects/byHost'
import { matchRedirect } from './lib/redirects/rules'
import { REQUEST_ID_HEADER, requestIdFrom } from './lib/requestId'
import { siteOrigin } from './lib/seo/origin'
import { getTenantByHost } from './lib/tenant/byHost'
import { normalizeHost } from './lib/tenant/host'
import { decideRoute } from './lib/tenant/routing'

/**
 * Every request gets an id (`X-Request-Id`): passed on to the app for its logs and returned to the
 * client, so a visitor's report ("error at 12:03, id …") leads to the log lines.
 */
export async function proxy(request: NextRequest) {
  const requestId = requestIdFrom(request.headers.get(REQUEST_ID_HEADER))
  const headers = new Headers(request.headers)
  headers.set(REQUEST_ID_HEADER, requestId)
  const response = await route(request, { request: { headers } })
  response.headers.set(REQUEST_ID_HEADER, requestId)
  return response
}

/** Host → site routing and panel-only paths; the decision itself lives in `lib/tenant/routing`. */
async function route(request: NextRequest, upstream: { request: { headers: Headers } }) {
  const env = getEnv()
  const decision = decideRoute({
    host: request.headers.get('host'),
    pathname: request.nextUrl.pathname,
    method: request.method,
    panelHost: env.PANEL_HOST,
  })

  switch (decision.type) {
    case 'next':
      return NextResponse.next(upstream)
    case 'notFound':
      return new NextResponse('Not Found', { status: 404 })
    case 'notFoundPage': {
      const url = request.nextUrl.clone()
      url.pathname = decision.pathname
      return NextResponse.rewrite(url, upstream)
    }
    case 'redirect':
      return NextResponse.redirect(new URL(decision.pathname, request.url))
    case 'analytics': {
      // ADR-020: forwarded at run time (one image for staging and production), not by
      // `rewrites()` in next.config, which are fixed at build time. Off = 404.
      // Only a known site whose line is counted, like any other site path (unknown → 404).
      const host = normalizeHost(request.headers.get('host'))
      const tenant = host && env.UMAMI_URL ? await getTenantByHost(host) : null
      if (!env.UMAMI_URL || !tenant || !umamiWebsiteId(env, tenant.line)) {
        return new NextResponse('Not Found', { status: 404 })
      }
      const target = new URL(decision.pathname, env.UMAMI_URL)
      target.search = request.nextUrl.search
      // Only the headers Umami needs (no cookies, no staging password).
      return NextResponse.rewrite(target, {
        request: { headers: analyticsRequestHeaders(request.headers) },
      })
    }
    case 'rewrite': {
      // A site path: the tenant's redirect rules come first (ADR-006, S7b), then its pages.
      // `Location` must be absolute here; the origin comes from `Host` like canonical addresses,
      // because the server itself may not know its public address (behind Nginx).
      const rawHost = request.headers.get('host')
      const host = normalizeHost(rawHost)
      const target = host && matchRedirect(request.nextUrl.pathname, await getRedirectsByHost(host))
      const origin = target && siteOrigin(rawHost, env.SITE_ENV)
      if (target && origin) {
        return new NextResponse(null, {
          status: 301,
          headers: {
            Location: new URL(target, origin).toString(),
            // Browsers keep a 301 without this forever; a day lets an editor's mistake be undone.
            'Cache-Control': 'public, max-age=86400',
          },
        })
      }

      const url = request.nextUrl.clone()
      url.pathname = decision.pathname
      return NextResponse.rewrite(url, upstream)
    }
  }
}

export const config = {
  // Everything except Next.js build assets; public files are let through by `decideRoute`.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
