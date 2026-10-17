import { describe, expect, it } from 'vitest'

import { decideRoute } from './routing'

const panelHost = 'panel.localhost'

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
      expect(route('biznes.localhost:3000', pathname)).toEqual({ type: 'notFound' })
    },
  )

  it('blocks the admin and API even when the path looks like a file', () => {
    expect(route('biznes.localhost', '/api/users/file/x.png')).toEqual({ type: 'notFound' })
    expect(route('biznes.localhost', '/admin/x.js')).toEqual({ type: 'notFound' })
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
    expect(route('biznes.localhost', pathname)).toEqual({ type: 'notFound' })
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
      ).toEqual({ type: 'notFound' })
    }
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
