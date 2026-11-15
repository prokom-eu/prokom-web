import { getSharedData } from '@/lib/shared/getSharedData'
import { getSiteSettings } from '@/lib/site/data'
import { biznesOgImage, firstSentence, ogDomain, ogNotFound } from '@/sites/biznes/og/card'

import { findTenant } from '../../tenant'

type Params = { params: Promise<{ domain: string }> }

/**
 * Default sharing image of the Biznes pages without a picture of their own (audyt 15.11
 * wieczorem §3.3, P3-1 — was the 512 px square mark): the site name and the first sentence of its
 * description from the panel (the site's SEO description, else the line's footer text). Another
 * line's domain → 404.
 */
export async function GET(_request: Request, { params }: Params): Promise<Response> {
  const tenant = await findTenant(params)
  if (!tenant || tenant.line !== 'biznes') return ogNotFound()
  const { domain } = await params
  const [settings, shared] = await Promise.all([
    getSiteSettings(tenant.id),
    getSharedData(tenant.id),
  ])
  return biznesOgImage({
    eyebrow: tenant.name,
    title:
      firstSentence(settings?.seo.description) ??
      firstSentence(shared?.line.footerDescription) ??
      tenant.name,
    footer: ogDomain(domain),
    footerRight: shared?.line.phone ?? null,
  })
}
