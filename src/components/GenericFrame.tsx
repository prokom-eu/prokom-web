import type { ReactNode } from 'react'

import type { PublicCompanyData, PublicSiteSettings } from '@/lib/site/public'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { BrandBar } from './BrandBar'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

type Props = {
  tenant: SiteTenant
  settings: PublicSiteSettings | null
  company: PublicCompanyData | null
  /** The promo bar, between the brand bar and the header. */
  promo: ReactNode
  children: ReactNode
}

/** Page frame of the lines without their own (S4): brand bar, header and footer from `SiteSettings`. */
export function GenericFrame({ tenant, settings, company, promo, children }: Props) {
  return (
    <>
      <BrandBar line={tenant.line} phone={settings?.phone ?? null} />
      {promo}
      <SiteHeader tenant={tenant} settings={settings} />
      {children}
      <SiteFooter line={tenant.line} name={tenant.name} company={company} settings={settings} />
    </>
  )
}
