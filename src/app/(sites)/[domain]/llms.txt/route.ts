import { headers } from 'next/headers'

import { getEnv } from '@/lib/env'
import { instalacjeLlmsTxt } from '@/lib/instalacje/llmsData'
import { siteOrigin } from '@/lib/seo/origin'
import { softwareLlmsData } from '@/lib/software/llmsData'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { findTenant } from '../tenant'

type Context = { params: Promise<{ domain: string }> }

/** Lines with an `llms.txt` and its builder (each in its own `lib/<linia>`). */
const BUILDERS: Partial<
  Record<SiteTenant['line'], (tenant: SiteTenant, origin: string) => Promise<string>>
> = {
  instalacje: instalacjeLlmsTxt,
  software: softwareLlmsData,
}

/**
 * `/llms.txt` of the domain, one route for every line — the address is the same everywhere, and
 * two route groups cannot both own it. It only picks the line's builder; a line without one or an
 * unknown domain → 404. Route handlers skip the groups' layouts, so the line is checked here.
 */
export async function GET(_request: Request, { params }: Context) {
  const [tenant, requestHeaders] = await Promise.all([findTenant(params), headers()])
  const origin = siteOrigin(requestHeaders.get('host'), getEnv().SITE_ENV)
  const build = tenant ? BUILDERS[tenant.line] : undefined
  if (!tenant || !origin || !build) return new Response('Not Found', { status: 404 })
  return new Response(await build(tenant, origin), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
