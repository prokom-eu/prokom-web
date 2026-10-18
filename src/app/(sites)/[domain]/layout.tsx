import type { Metadata } from 'next'
import React from 'react'

import { BrandBar } from '@/components/BrandBar'
import { PromoBar } from '@/components/PromoBar'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { brandIcons } from '@/lib/brand/lines'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { organizationJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { isPromoForLine } from '@/lib/site/promo'
import { isValidTitleTemplate } from '@/lib/site/title'

import { requestOrigin, requireTenant } from './tenant'

type Props = { children: React.ReactNode; params: Promise<{ domain: string }> }

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const tenant = await requireTenant(params)
  const [settings, origin] = await Promise.all([getSiteSettings(tenant.id), requestOrigin()])
  const template = settings?.seo.titleTemplate
  return {
    // Relative paths in page metadata (canonical, OG) become addresses of this domain.
    metadataBase: new URL(origin),
    // The template applies to subpages (S5); the start page keeps the tenant name.
    title:
      template && isValidTitleTemplate(template) ? { default: tenant.name, template } : tenant.name,
    description: settings?.seo.description ?? undefined,
    icons: brandIcons(tenant.line),
    robots: robotsMeta(getEnv().SITE_ENV),
    // For routes without page metadata (e.g. 404); pages set their own, complete Open Graph.
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

export default async function TenantLayout({ children, params }: Props) {
  const tenant = await requireTenant(params)
  const [company, settings, origin] = await Promise.all([
    getCompanyData(),
    getSiteSettings(tenant.id),
    requestOrigin(),
  ])
  const jsonLd =
    company &&
    organizationJsonLd({
      company,
      tenant,
      contact: { phone: settings?.phone ?? null, email: settings?.email ?? null },
      origin,
    })
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // Data from the panel, serialized with `<` escaped (`serializeJsonLd`).
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      )}
      <a
        href="#tresc"
        className="sr-only z-50 rounded-xl bg-accent-text px-4 py-2 font-bold text-accent-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Przejdź do treści
      </a>
      <BrandBar line={tenant.line} phone={settings?.phone ?? null} />
      {company?.promo && isPromoForLine(company.promo.lines, tenant.line) && (
        <PromoBar promo={company.promo} />
      )}
      <SiteHeader tenant={tenant} settings={settings} />
      <main id="tresc">{children}</main>
      <SiteFooter line={tenant.line} name={tenant.name} company={company} settings={settings} />
    </>
  )
}
