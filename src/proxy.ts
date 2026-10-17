import { NextResponse, type NextRequest } from 'next/server'

import { getEnv } from './lib/env'
import { getRedirectsByHost } from './lib/redirects/byHost'
import { matchRedirect } from './lib/redirects/rules'
import { siteOrigin } from './lib/seo/origin'
import { normalizeHost } from './lib/tenant/host'
import { decideRoute } from './lib/tenant/routing'

/** Host → site routing and panel-only paths; the decision itself lives in `lib/tenant/routing`. */
export async function proxy(request: NextRequest) {
  const env = getEnv()
  const decision = decideRoute({
    host: request.headers.get('host'),
    pathname: request.nextUrl.pathname,
    method: request.method,
    panelHost: env.PANEL_HOST,
  })

  switch (decision.type) {
    case 'next':
      return NextResponse.next()
    case 'notFound':
      return new NextResponse('Not Found', { status: 404 })
    case 'notFoundPage': {
      const url = request.nextUrl.clone()
      url.pathname = decision.pathname
      return NextResponse.rewrite(url)
    }
    case 'redirect':
      return NextResponse.redirect(new URL(decision.pathname, request.url))
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
      return NextResponse.rewrite(url)
    }
  }
}

export const config = {
  // Everything except Next.js build assets; public files are let through by `decideRoute`.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
