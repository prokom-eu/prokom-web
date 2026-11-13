import { headers } from 'next/headers'

import { biznesLlmsTxt } from '@/lib/biznes/llms'
import { getCatalogIndex } from '@/lib/catalog/data'
import { getEnv } from '@/lib/env'
import { getInstalacjeObjectList, getInstalacjeOffer } from '@/lib/instalacje/data'
import { llmsTxt } from '@/lib/instalacje/llms'
import { objectHref } from '@/lib/instalacje/menu'
import { getPostList } from '@/lib/posts/data'
import { siteOrigin } from '@/lib/seo/origin'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { hoursSummary } from '@/lib/site/hoursSummary'

import { findTenant } from '../tenant'

type Context = { params: Promise<{ domain: string }> }
type Tenant = NonNullable<Awaited<ReturnType<typeof findTenant>>>

/** Instalacje (SEO §2.4): services, objects and guide posts from the panel. */
async function instalacjeBody(tenant: Tenant, origin: string): Promise<string> {
  const [offer, objects, site, company, posts] = await Promise.all([
    getInstalacjeOffer(tenant.id),
    getInstalacjeObjectList(tenant.id),
    getSiteSettings(tenant.id),
    getCompanyData(),
    getPostList(tenant.id, 'instalacje'),
  ])
  const office = company?.locations?.[0]
  return llmsTxt({
    origin,
    name: tenant.name,
    phone: site?.phone ?? null,
    email: site?.email ?? null,
    address: office ? `${office.street}, ${office.postalCode} ${office.city}` : null,
    services: offer.map((s) => ({ name: s.name, href: s.href, description: s.description })),
    objects: objects.map((o) => ({ name: o.name, href: objectHref(o.slug) })),
    posts: posts.map((p) => ({ title: p.title, href: p.href })),
  })
}

/** Biznes (SEO lokalne 13.11): the catalog's departments, brands, industries and pages. */
async function biznesBody(tenant: Tenant, origin: string): Promise<string> {
  const [index, site, company] = await Promise.all([
    getCatalogIndex(tenant.id),
    getSiteSettings(tenant.id),
    getCompanyData(),
  ])
  const salon = company?.locations?.[0]
  return biznesLlmsTxt({
    origin,
    name: tenant.name,
    company: company?.name ?? tenant.name,
    phones: [site?.phone, site?.phone2].filter((phone): phone is string => Boolean(phone)),
    email: site?.email ?? null,
    address: salon ? `${salon.street}, ${salon.postalCode} ${salon.city}` : null,
    hours: salon?.hours.length ? [hoursSummary(salon.hours)] : [],
    areas: site?.biznes?.serviceAreas ?? [],
    brands: index.brands.map((brand) => ({
      name: brand.name,
      slug: brand.slug,
      status: brand.status,
      page: Boolean(brand.page),
    })),
    groups: index.groups.map((group) => ({
      name: group.name,
      categories: index.categories.filter((category) => category.group === group.slug),
    })),
    industries: index.industries.filter((industry) => industry.active),
    pages: index.pages,
  })
}

/**
 * `llms.txt` (llmstxt.org) — a plain summary for AI assistants, built from the panel on every
 * request. One route for every line that has one (Instalacje SEO §2.4, Biznes SEO lokalne 13.11):
 * two routes of the same address in two groups would clash. Route handlers skip the layouts, so
 * the line is checked here: another line or an unknown domain → 404.
 */
export async function GET(_request: Request, { params }: Context) {
  const [tenant, requestHeaders] = await Promise.all([findTenant(params), headers()])
  const origin = siteOrigin(requestHeaders.get('host'), getEnv().SITE_ENV)
  if (!tenant || !origin) return new Response('Not Found', { status: 404 })
  const body =
    tenant.line === 'instalacje'
      ? await instalacjeBody(tenant, origin)
      : tenant.line === 'biznes'
        ? await biznesBody(tenant, origin)
        : null
  if (body === null) return new Response('Not Found', { status: 404 })
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
