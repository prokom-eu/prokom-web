import type { Metadata } from 'next'
import React from 'react'

import { BrandBar } from '@/components/BrandBar'
import { PromoBar } from '@/components/PromoBar'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { brandIcons } from '@/lib/brand/lines'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { isValidTitleTemplate } from '@/lib/site/title'

import { requireTenant } from './tenant'

type Props = { children: React.ReactNode; params: Promise<{ domain: string }> }

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const tenant = await requireTenant(params)
  const settings = await getSiteSettings(tenant.id)
  const template = settings?.seo.titleTemplate
  return {
    // The template applies to subpages (S5); the start page keeps the tenant name.
    title:
      template && isValidTitleTemplate(template) ? { default: tenant.name, template } : tenant.name,
    description: settings?.seo.description ?? undefined,
    icons: brandIcons(tenant.line),
  }
}

export default async function TenantLayout({ children, params }: Props) {
  const tenant = await requireTenant(params)
  const [company, settings] = await Promise.all([getCompanyData(), getSiteSettings(tenant.id)])
  return (
    <>
      <a
        href="#tresc"
        className="sr-only z-50 rounded-xl bg-accent-text px-4 py-2 font-bold text-accent-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Przejdź do treści
      </a>
      <BrandBar line={tenant.line} phone={settings?.phone ?? null} />
      {company?.promo && <PromoBar promo={company.promo} />}
      <SiteHeader tenant={tenant} settings={settings} />
      <main id="tresc">{children}</main>
      <SiteFooter line={tenant.line} company={company} settings={settings} />
    </>
  )
}
