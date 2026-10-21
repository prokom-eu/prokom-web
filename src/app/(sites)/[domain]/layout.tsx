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
import { partnerBadges } from '@/lib/partners/badges'
import { getPartnerStatuses } from '@/lib/partners/data'
import { ogImages } from '@/lib/pages/metadata'
import { organizationJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { toTelHref, toWhatsAppHref } from '@/lib/site/link'
import type { PublicSiteSettings } from '@/lib/site/public'
import { isPromoForLine } from '@/lib/site/promo'
import { isValidTitleTemplate } from '@/lib/site/title'
import type { SiteTenant } from '@/lib/tenant/byHost'
import { BiznesFooter } from '@/sites/biznes/components/BiznesFooter'
import { BiznesHeader } from '@/sites/biznes/components/BiznesHeader'
import { MobileBar } from '@/sites/biznes/components/MobileBar'
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
  const biznes = settings?.biznes ? await biznesFrameData(tenant, settings, settings.biznes) : null
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
        <BiznesHeader tenant={tenant} {...biznes.header} />
      ) : (
        <SiteHeader tenant={tenant} settings={settings} />
      )}
      <main id="tresc" tabIndex={-1} className="outline-none">
        {children}
      </main>
      {biznes && settings?.biznes ? (
        <>
          <BiznesFooter
            name={tenant.name}
            company={company}
            settings={settings}
            biznes={settings.biznes}
            menu={biznes.header.menu}
            badges={biznes.badges}
            contact={biznes.header.contact}
          />
          <MobileBar
            tel={biznes.header.contact.phone?.href ?? null}
            whatsapp={biznes.header.contact.whatsapp}
          />
        </>
      ) : (
        <SiteFooter line={tenant.line} name={tenant.name} company={company} settings={settings} />
      )}
    </>
  )
}

/**
 * Data of the Biznes frame (B3): the mega menu comes from the cached catalog index, which
 * already hides empty categories (ADR-012, rozstrzygnięcie 7); the footer badges from the
 * partner statuses confirmed in the panel.
 */
async function biznesFrameData(
  tenant: SiteTenant,
  settings: PublicSiteSettings,
  { navigation, whatsapp }: NonNullable<PublicSiteSettings['biznes']>,
) {
  const [index, partners] = await Promise.all([
    getCatalogIndex(tenant.id),
    getPartnerStatuses(tenant.id),
  ])
  const tel = settings.phone ? toTelHref(settings.phone) : null
  return {
    header: {
      navigation,
      menu: megaMenu(index, navigation),
      // v20: Branże ▾ is gone; the mega menu links the first active industry page.
      industrySlug: index.industries.find((industry) => industry.active)?.slug ?? null,
      contact: {
        phone: settings.phone && tel ? { label: settings.phone, href: tel } : null,
        whatsapp: whatsapp ? toWhatsAppHref(whatsapp) : null,
      },
    },
    badges: partnerBadges(partners),
  }
}
