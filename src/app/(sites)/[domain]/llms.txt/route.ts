import { headers } from 'next/headers'

import { biznesLlmsBody } from '@/lib/biznes/llmsRoute'
import { getEnv } from '@/lib/env'
import { instalacjeLlmsBody } from '@/lib/instalacje/llmsRoute'
import { siteOrigin } from '@/lib/seo/origin'

import { findTenant } from '../tenant'

type Context = { params: Promise<{ domain: string }> }

/**
 * `llms.txt` (llmstxt.org) — a plain summary for AI assistants, built from the panel on every
 * request. One route for every line that has one (Instalacje SEO §2.4, Biznes SEO lokalne 13.11):
 * two routes of the same address in two groups would clash; each line's content lives in its own
 * folder (`lib/instalacje/llmsRoute`, `lib/biznes/llmsRoute`). Route handlers skip the layouts, so
 * the line is checked here: another line or an unknown domain → 404.
 */
export async function GET(_request: Request, { params }: Context) {
  const [tenant, requestHeaders] = await Promise.all([findTenant(params), headers()])
  const origin = siteOrigin(requestHeaders.get('host'), getEnv().SITE_ENV)
  if (!tenant || !origin) return new Response('Not Found', { status: 404 })
  const body =
    tenant.line === 'instalacje'
      ? await instalacjeLlmsBody(tenant, origin)
      : tenant.line === 'biznes'
        ? await biznesLlmsBody(tenant, origin)
        : null
  if (body === null) return new Response('Not Found', { status: 404 })
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
