import { NextResponse, type NextRequest } from 'next/server'

import { getEnv } from './lib/env'
import { decideRoute } from './lib/tenant/routing'

/** Host → site routing and panel-only paths; the decision itself lives in `lib/tenant/routing`. */
export function proxy(request: NextRequest) {
  const decision = decideRoute({
    host: request.headers.get('host'),
    pathname: request.nextUrl.pathname,
    panelHost: getEnv().PANEL_HOST,
  })

  switch (decision.type) {
    case 'next':
      return NextResponse.next()
    case 'notFound':
      return new NextResponse('Not Found', { status: 404 })
    case 'redirect':
      return NextResponse.redirect(new URL(decision.pathname, request.url))
    case 'rewrite': {
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
