import { AnalyticsScript } from '@/components/AnalyticsScript'
import type { ReactNode } from 'react'

import { SiteLogo } from '@/components/SiteLogo'
import { getInstalacjeMenu } from '@/lib/instalacje/data'
import { getCompanyData } from '@/lib/site/data'
import { openingStatus } from '@/lib/site/hours'
import { toTelHref } from '@/lib/site/link'
import type { PublicSiteSettings } from '@/lib/site/public'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { navigation } from './dane/nawigacja'
import { CtaBand } from './powloka/CtaBand'
import { Footer } from './powloka/Footer'
import { Header } from './powloka/Header'
import { MenuSheet } from './powloka/MenuSheet'
import { PageTransition } from './powloka/PageTransition'
import { ShellProvider } from './powloka/ShellProvider'
import { TabBar } from './powloka/TabBar'
import { TopBar } from './powloka/TopBar'
import { salonsList, salonsNote } from './powloka/salons'
import { FrameStyles } from './style/LineStyles'

type Props = {
  tenant: SiteTenant
  settings: PublicSiteSettings | null
  /** The promo bar, above the header. */
  promo: ReactNode
  children: ReactNode
}

/**
 * Page frame of the Instalacje line (I3, ADR-I004, KOMPONENTY §1): top bar, header with mega
 * menus, CTA band and footer; on a phone the hiding header, the bottom bar and the menu sheet.
 * Menus: layout in `dane/nawigacja.ts`, names/icons/colours from the panel; contact, salons and
 * hours from the panel (`SiteSettings`, `CompanyData`) — without them the item is left out.
 */
export async function InstalacjeFrame({ tenant, settings, promo, children }: Props) {
  const [menu, company] = await Promise.all([getInstalacjeMenu(tenant.id), getCompanyData()])
  const telHref = settings?.phone ? toTelHref(settings.phone) : null
  const phone = settings?.phone && telHref ? { label: settings.phone, href: telHref } : null
  const locations = company?.locations ?? []
  const hours = locations[0]?.hours ?? null
  const status = hours ? openingStatus(hours, new Date()) : null
  const salons = salonsList(locations)
  const legal = settings?.footer.links ?? []

  return (
    <ShellProvider>
      <FrameStyles />
      <div id="top" className="inst-page min-h-dvh bg-surface text-ink">
        {promo}
        <TopBar
          topBar={navigation.topBar}
          salons={salons}
          hours={hours}
          status={status}
          phone={phone}
        />
        <Header
          logo={<SiteLogo tenant={tenant} className="h-7 w-auto" />}
          navigation={navigation}
          menu={menu}
          phone={phone}
        />
        <PageTransition>{children}</PageTransition>
        <CtaBand band={navigation.ctaBand} phone={phone} salons={salonsNote(locations)} />
        <Footer navigation={navigation} menu={menu} company={company} phone={phone} legal={legal} />
        <TabBar navigation={navigation} menu={menu} />
        <MenuSheet
          navigation={navigation}
          menu={menu}
          hours={hours}
          status={status}
          phone={phone}
        />
        {/* Statistics (ADR-020): rendered only when `UMAMI_WEBSITES` has `instalacje=<id>`. */}
        <AnalyticsScript line={tenant.line} />
      </div>
    </ShellProvider>
  )
}
