import type { ReactNode } from 'react'

import { getCatalogIndex } from '@/lib/catalog/data'
import { megaMenu, offerMenu } from '@/lib/catalog/menu'
import { partnerBadges } from '@/lib/partners/badges'
import { getPartnerStatuses } from '@/lib/partners/data'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref, toWhatsAppHref } from '@/lib/site/link'
import type { PublicCompanyData, PublicSiteSettings } from '@/lib/site/public'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { BiznesFooter } from './components/BiznesFooter'
import { BiznesHeader } from './components/BiznesHeader'
import { MobileBar } from './components/MobileBar'
import { SiteRail } from './components/rail/SiteRail'
import { TopBar } from './components/TopBar'

type Props = {
  tenant: SiteTenant
  settings: PublicSiteSettings
  biznes: NonNullable<PublicSiteSettings['biznes']>
  company: PublicCompanyData | null
  /** The promo bar, between the top bar and the header. */
  promo: ReactNode
  children: ReactNode
}

/**
 * Page frame of the Biznes line (B3, ADR-014 rozstrz. 12): top bar, header with the mega menu
 * from the cached catalog index (it already hides empty categories — ADR-012, rozstrzygnięcie 7),
 * footer with the partner badges confirmed in the panel, and the phone's bottom bar.
 */
export async function BiznesFrame({ tenant, settings, biznes, company, promo, children }: Props) {
  const [index, partners] = await Promise.all([
    getCatalogIndex(tenant.id),
    getPartnerStatuses(tenant.id),
  ])
  const tel = settings.phone ? toTelHref(settings.phone) : null
  const contact = {
    phone: settings.phone && tel ? { label: settings.phone, href: tel } : null,
    whatsapp: biznes.whatsapp ? toWhatsAppHref(biznes.whatsapp) : null,
  }
  const menu = megaMenu(index, biznes.navigation)
  const hours = company?.locations[0]?.hours ?? null
  return (
    <>
      <TopBar phone={settings.phone} hours={hours} />
      {promo}
      <BiznesHeader
        tenant={tenant}
        navigation={biznes.navigation}
        menu={menu}
        offer={offerMenu(index)}
        hours={hours ? hoursSummary(hours) : null}
        contact={contact}
      />
      <SiteRail />
      {children}
      <BiznesFooter
        name={tenant.name}
        company={company}
        settings={settings}
        biznes={biznes}
        badges={partnerBadges(partners)}
        contact={contact}
      />
      <MobileBar tel={contact.phone?.href ?? null} whatsapp={contact.whatsapp} />
    </>
  )
}
