import { lineManifest } from '@/lib/brand/themeColor'

import { findTenant } from '../tenant'

type Context = { params: Promise<{ domain: string }> }

/**
 * Web app manifest of one domain (the proxy rewrites `/manifest.webmanifest` to
 * `/<host>/manifest.webmanifest`). Only lines with a phone app look have one (`lineManifest`);
 * other domains and unknown hosts answer 404.
 */
export async function GET(_request: Request, { params }: Context) {
  const tenant = await findTenant(params)
  const manifest = tenant && lineManifest(tenant.line, tenant.name)
  if (!manifest) return new Response('Not Found', { status: 404 })
  return Response.json(manifest, {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  })
}
