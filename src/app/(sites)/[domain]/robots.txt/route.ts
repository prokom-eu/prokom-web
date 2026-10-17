import { headers } from 'next/headers'

import { getEnv } from '@/lib/env'
import { robotsTxt } from '@/lib/seo/robots'
import { siteOrigin } from '@/lib/seo/origin'

import { findTenant } from '../tenant'

type Context = { params: Promise<{ domain: string }> }

/** `robots.txt` of one domain (the proxy rewrites `/robots.txt` to `/<host>/robots.txt`). */
export async function GET(_request: Request, { params }: Context) {
  const siteEnv = getEnv().SITE_ENV
  const [tenant, requestHeaders] = await Promise.all([findTenant(params), headers()])
  const origin = siteOrigin(requestHeaders.get('host'), siteEnv)
  if (!tenant || !origin) return new Response('Not Found', { status: 404 })
  return new Response(robotsTxt(siteEnv, origin), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
