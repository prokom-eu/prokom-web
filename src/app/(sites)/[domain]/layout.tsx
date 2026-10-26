import type { Metadata } from 'next'
import React from 'react'

import { GenericFrame } from '@/components/GenericFrame'
import { PromoBar } from '@/components/PromoBar'
import { brandIcons } from '@/lib/brand/lines'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { organizationJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { isPromoForLine } from '@/lib/site/promo'
import { isValidTitleTemplate } from '@/lib/site/title'
import { BiznesFrame } from '@/sites/biznes/Frame'
import { SoftwareFrame } from '@/sites/software/Frame'

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
  const promo = company?.promo && isPromoForLine(company.promo.lines, tenant.line) && (
    <PromoBar promo={company.promo} />
  )
  const main = (
    <main id="tresc" tabIndex={-1} className="outline-none">
      {children}
    </main>
  )
  // ADR-014 rozstrz. 12: each line with its own design has its own frame; the line's data
  // exists only on its own line (`toPublicSiteSettings`), so it also picks the frame.
  const navigation = settings?.software?.navigation
  let frame: React.ReactNode
  if (settings?.biznes) {
    frame = (
      <BiznesFrame
        tenant={tenant}
        settings={settings}
        biznes={settings.biznes}
        company={company}
        promo={promo}
      >
        {main}
      </BiznesFrame>
    )
  } else if (settings && navigation) {
    frame = (
      <SoftwareFrame
        tenant={tenant}
        settings={settings}
        navigation={navigation}
        company={company}
        promo={promo}
      >
        {main}
      </SoftwareFrame>
    )
  } else {
    frame = (
      <GenericFrame tenant={tenant} settings={settings} company={company} promo={promo}>
        {main}
      </GenericFrame>
    )
  }
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
      {frame}
    </>
  )
}
