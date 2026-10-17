import type { Metadata } from 'next'
import React from 'react'

import { SiteFooter } from '@/components/SiteFooter'
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
      {company?.promo && (
        <aside aria-label="Promocja">
          {company.promo.href ? (
            <a href={company.promo.href}>{company.promo.text}</a>
          ) : (
            company.promo.text
          )}
        </aside>
      )}
      {settings && settings.navigation.length > 0 && (
        <nav aria-label="Główna">
          <ul>
            {settings.navigation.map((link, i) => (
              <li key={`${i}-${link.href}`}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <main>{children}</main>
      <SiteFooter company={company} settings={settings} />
    </>
  )
}
