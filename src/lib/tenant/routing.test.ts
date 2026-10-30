import { describe, expect, it } from 'vitest'

import { isValidPageSlug } from '../pages/slug'
import { decideRoute, NOT_FOUND_SEGMENT } from './routing'

const panelHost = 'panel.localhost'
// 404 of a site domain is rendered by the site (its header and footer), not the proxy.
const SITE_404 = { type: 'notFoundPage', pathname: '/biznes.localhost/_404' }

function route(host: string | null, pathname: string) {
  return decideRoute({ host, pathname, panelHost })
}

describe('decideRoute — panel domain', () => {
  it('serves the admin panel', () => {
    expect(route('panel.localhost:3000', '/admin')).toEqual({ type: 'next' })
    expect(route('panel.localhost:3000', '/admin/collections/users')).toEqual({ type: 'next' })
  })

  it('serves the Payload API', () => {
    expect(route('panel.localhost:3000', '/api/users/login')).toEqual({ type: 'next' })
  })

  it('redirects the root to the admin panel', () => {
    expect(route('panel.localhost:3000', '/')).toEqual({ type: 'redirect', pathname: '/admin' })
  })

  it('does not serve site pages', () => {
    expect(route('panel.localhost:3000', '/kontakt')).toEqual({ type: 'notFound' })
  })
})

describe('decideRoute — site domains', () => {
  it('uses a 404 segment that can never be a page slug', () => {
    expect(isValidPageSlug(NOT_FOUND_SEGMENT)).toBe(false)
  })

  it('rewrites a page to the domain segment', () => {
    expect(route('Biznes.localhost:3000', '/')).toEqual({
      type: 'rewrite',
      pathname: '/biznes.localhost',
    })
    expect(route('biznes.localhost:3000', '/oferta/serwis')).toEqual({
      type: 'rewrite',
      pathname: '/biznes.localhost/oferta/serwis',
    })
  })

  it.each(['/admin', '/admin/', '/admin/login', '/api', '/api/users', '/api/graphql'])(
    'returns 404 for %s',
    (pathname) => {
      expect(route('biznes.localhost:3000', pathname)).toEqual(SITE_404)
    },
  )

  it('blocks the admin and API even when the path looks like a file', () => {
    expect(route('biznes.localhost', '/api/users/file/x.png')).toEqual(SITE_404)
    expect(route('biznes.localhost', '/admin/x.js')).toEqual(SITE_404)
  })

  it('serves uploaded images (file access is checked by Payload per host)', () => {
    expect(route('biznes.localhost', '/api/media/file/hero-960x480.webp')).toEqual({
      type: 'next',
    })
    expect(route('biznes.localhost', '/api/partners/file/posnet.png')).toEqual({ type: 'next' })
    expect(
      decideRoute({
        host: 'biznes.localhost',
        pathname: '/api/media/file/a.png',
        method: 'HEAD',
        panelHost,
      }),
    ).toEqual({ type: 'next' })
  })

  it.each([
    '/api/media',
    '/api/media/1',
    '/api/media/file',
    '/api/media/file/',
    '/api/media/file/a/b.png',
    '/api/media/file/a.png/',
    '/api/partners/file/../users',
  ])('keeps the rest of the upload API closed: %s', (pathname) => {
    expect(route('biznes.localhost', pathname)).toEqual(SITE_404)
  })

  it('serves uploaded images only to GET and HEAD', () => {
    for (const method of ['POST', 'PATCH', 'DELETE']) {
      expect(
        decideRoute({
          host: 'biznes.localhost',
          pathname: '/api/media/file/a.png',
          method,
          panelHost,
        }),
      ).toEqual(SITE_404)
    }
  })

  it('accepts inquiries (ADR-003): POST /api/inquiry', () => {
    expect(
      decideRoute({
        host: 'biznes.localhost',
        pathname: '/api/inquiry',
        method: 'POST',
        panelHost,
      }),
    ).toEqual({ type: 'next' })
  })

  it('keeps the rest of the inquiry API closed', () => {
    for (const method of ['GET', 'HEAD', 'PATCH', 'DELETE']) {
      expect(
        decideRoute({ host: 'biznes.localhost', pathname: '/api/inquiry', method, panelHost }),
      ).toEqual(SITE_404)
    }
    for (const pathname of ['/api/inquiries', '/api/inquiry/', '/api/inquiry/1', '/api/inquiryx']) {
      expect(
        decideRoute({ host: 'biznes.localhost', pathname, method: 'POST', panelHost }),
      ).toEqual(SITE_404)
    }
  })

  it('answers the health check on any host (Docker, smoke test, monitoring)', () => {
    for (const host of ['biznes.localhost', 'panel.localhost', 'localhost:3000', '127.0.0.1']) {
      for (const method of ['GET', 'HEAD']) {
        expect(decideRoute({ host, pathname: '/api/health', method, panelHost })).toEqual({
          type: 'next',
        })
      }
    }
  })

  it('keeps the rest of the health path closed on site domains', () => {
    expect(
      decideRoute({ host: 'biznes.localhost', pathname: '/api/health', method: 'POST', panelHost }),
    ).toEqual(SITE_404)
    for (const pathname of ['/api/health/', '/api/health/x', '/api/healthz']) {
      expect(route('biznes.localhost', pathname)).toEqual(SITE_404)
    }
  })

  it('lets the catalog index through on site domains (its handler checks the line)', () => {
    for (const method of ['GET', 'HEAD']) {
      expect(
        decideRoute({
          host: 'biznes.localhost',
          pathname: '/api/catalog-index',
          method,
          panelHost,
        }),
      ).toEqual({ type: 'next' })
    }
  })

  it('keeps the rest of the catalog index path closed on site domains', () => {
    expect(
      decideRoute({
        host: 'biznes.localhost',
        pathname: '/api/catalog-index',
        method: 'POST',
        panelHost,
      }),
    ).toEqual(SITE_404)
    for (const pathname of ['/api/catalog-index/', '/api/catalog-index/x', '/api/catalog']) {
      expect(route('biznes.localhost', pathname)).toEqual(SITE_404)
    }
  })

  it('lets the solutions index through on site domains, read only (its handler checks the line)', () => {
    for (const method of ['GET', 'HEAD']) {
      expect(
        decideRoute({
          host: 'software.localhost',
          pathname: '/api/solutions-index',
          method,
          panelHost,
        }),
      ).toEqual({ type: 'next' })
    }
    expect(
      decideRoute({
        host: 'software.localhost',
        pathname: '/api/solutions-index',
        method: 'POST',
        panelHost,
      }),
    ).toEqual({ type: 'notFoundPage', pathname: '/software.localhost/_404' })
    for (const pathname of ['/api/solutions-index/', '/api/solutions-index/x', '/api/solutions']) {
      expect(route('software.localhost', pathname)).toEqual({
        type: 'notFoundPage',
        pathname: '/software.localhost/_404',
      })
    }
  })

  it.each(['/robots.txt', '/sitemap.xml'])('rewrites %s to the domain segment', (pathname) => {
    expect(route('software.localhost:3000', pathname)).toEqual({
      type: 'rewrite',
      pathname: `/software.localhost${pathname}`,
    })
  })

  it('does not treat similar paths as the admin', () => {
    expect(route('biznes.localhost', '/administracja')).toEqual({
      type: 'rewrite',
      pathname: '/biznes.localhost/administracja',
    })
  })

  it('serves files from public/ as they are', () => {
    expect(route('biznes.localhost', '/brand/logo.svg')).toEqual({ type: 'next' })
  })

  it('serves the Software solution thumbnails (SWR3, spec. §5.2) — only that folder', () => {
    expect(route('software.localhost', '/software/rozwiazania/strona-wizytowka.svg')).toEqual({
      type: 'next',
    })
    // `/software` itself stays a page path of the tenant.
    expect(route('software.localhost', '/software/cennik')).toEqual({
      type: 'rewrite',
      pathname: '/software.localhost/software/cennik',
    })
  })

  // Review of S3: a path ending in another domain must not reach that tenant's segment.
  it('rewrites a path that looks like another domain under the request host', () => {
    expect(route('instalacje.localhost', '/biznes.localhost')).toEqual({
      type: 'rewrite',
      pathname: '/instalacje.localhost/biznes.localhost',
    })
  })

  it('rewrites dotted paths outside public/ folders', () => {
    expect(route('biznes.localhost', '/cennik.pdf')).toEqual({
      type: 'rewrite',
      pathname: '/biznes.localhost/cennik.pdf',
    })
    expect(route('biznes.localhost', '/brandx/logo.svg')).toEqual({
      type: 'rewrite',
      pathname: '/biznes.localhost/brandx/logo.svg',
    })
  })
})

describe('decideRoute — invalid host', () => {
  it.each([null, '', 'evil.pl/x'])('returns 404 for %j', (host) => {
    expect(route(host, '/')).toEqual({ type: 'notFound' })
  })
})
