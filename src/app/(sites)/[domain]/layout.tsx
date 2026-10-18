import type { Metadata } from 'next'
import React from 'react'

import { BrandBar } from '@/components/BrandBar'
import { PromoBar } from '@/components/PromoBar'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { brandIcons } from '@/lib/brand/lines'
import { getCatalogIndex } from '@/lib/catalog/data'
import { megaMenu } from '@/lib/catalog/menu'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { organizationJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import type { PublicSiteSettings } from '@/lib/site/public'
import { isPromoForLine } from '@/lib/site/promo'
import { isValidTitleTemplate } from '@/lib/site/title'
import type { SiteTenant } from '@/lib/tenant/byHost'
import { BiznesHeader } from '@/sites/biznes/components/BiznesHeader'
import { TopBar } from '@/sites/biznes/components/TopBar'

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
  const biznes = settings?.biznes ? await biznesHeaderData(tenant, settings.biznes) : null
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
      {biznes ? (
        <TopBar phone={settings?.phone ?? null} hours={company?.locations[0]?.hours ?? null} />
      ) : (
        <BrandBar line={tenant.line} phone={settings?.phone ?? null} />
      )}
      {company?.promo && isPromoForLine(company.promo.lines, tenant.line) && (
        <PromoBar promo={company.promo} />
      )}
      {biznes ? (
        <BiznesHeader tenant={tenant} {...biznes} />
      ) : (
        <SiteHeader tenant={tenant} settings={settings} />
      )}
      <main id="tresc">{children}</main>
      <SiteFooter line={tenant.line} name={tenant.name} company={company} settings={settings} />
    </>
  )
}

/**
 * Header data of the Biznes line (B3): the mega menu comes from the cached catalog index, which
 * already hides empty categories (ADR-012, rozstrzygnięcie 7).
 */
async function biznesHeaderData(
  tenant: SiteTenant,
  { navigation }: NonNullable<PublicSiteSettings['biznes']>,
) {
  const index = await getCatalogIndex(tenant.id)
  return {
    navigation,
    menu: megaMenu(index, navigation),
    soonIndustries: index.industries.filter((industry) => !industry.active).map((i) => i.name),
  }
}
