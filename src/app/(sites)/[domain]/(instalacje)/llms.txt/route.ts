import { headers } from 'next/headers'

import { getEnv } from '@/lib/env'
import { getInstalacjeObjectList, getInstalacjeOffer } from '@/lib/instalacje/data'
import { llmsTxt } from '@/lib/instalacje/llms'
import { objectHref } from '@/lib/instalacje/menu'
import { siteOrigin } from '@/lib/seo/origin'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'

import { findTenant } from '../../tenant'

type Context = { params: Promise<{ domain: string }> }

/**
 * `llms.txt` of the Instalacje site (SEO §2.4): built from the panel (services, objects, contact)
 * on every request. Route handlers skip the group's layout, so the line is checked here: another
 * line or an unknown domain → 404.
 */
export async function GET(_request: Request, { params }: Context) {
  const [tenant, requestHeaders] = await Promise.all([findTenant(params), headers()])
  const origin = siteOrigin(requestHeaders.get('host'), getEnv().SITE_ENV)
  if (!tenant || tenant.line !== 'instalacje' || !origin) {
    return new Response('Not Found', { status: 404 })
  }
  const [offer, objects, site, company] = await Promise.all([
    getInstalacjeOffer(tenant.id),
    getInstalacjeObjectList(tenant.id),
    getSiteSettings(tenant.id),
    getCompanyData(),
  ])
  const office = company?.locations?.[0]
  const body = llmsTxt({
    origin,
    name: tenant.name,
    phone: site?.phone ?? null,
    email: site?.email ?? null,
    address: office ? `${office.street}, ${office.postalCode} ${office.city}` : null,
    services: offer.map((s) => ({ name: s.name, href: s.href, description: s.description })),
    objects: objects.map((o) => ({ name: o.name, href: objectHref(o.slug) })),
  })
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
