import type { ReactNode } from 'react'

import { RevealObserver } from '@/components/motion/RevealObserver'
import { BrandBar } from '@/components/shared/BrandBar'
import { CAPSULE } from '@/components/shared/capsule'
import { MenuSheet } from '@/components/shared/MenuSheet'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { TabBar } from '@/components/shared/TabBar'
import { getCatalogIndex } from '@/lib/catalog/data'
import { offerMenu } from '@/lib/catalog/menu'
import { getSharedData } from '@/lib/shared/getSharedData'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref } from '@/lib/site/link'
import type { PublicCompanyData, PublicSiteSettings } from '@/lib/site/public'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { CartDrawer } from './components/CartDrawer'
import { CartToast } from './components/CartToast'
import { SearchOverlay } from './components/SearchOverlay'
import { PageTransition } from './PageTransition'
import { BizHeader } from './powloka/BizHeader'
import { BizRail } from './powloka/BizRail'
import { BizSheetList } from './powloka/BizSheetList'
import { CartCount } from './powloka/CartCount'
import { DrawerLinks } from './powloka/DrawerLinks'
import { PreviewGuard } from './powloka/PreviewGuard'

type Props = {
  tenant: SiteTenant
  settings: PublicSiteSettings
  biznes: NonNullable<PublicSiteSettings['biznes']>
  company: PublicCompanyData | null
  /** The promo bar, above the header. */
  promo: ReactNode
  children: ReactNode
}

/**
 * Page frame of the Biznes line on the shared elements of the lines (D3-B, plan 0611 §8.1,
 * ADR-022): brand bar, header capsule with the line's „Oferta ▾”, side rail from 1400 px, the
 * shared footer (folding columns on a phone) and on a phone the bottom bar (Zapytanie in the
 * centre — decyzja 08.11) and the menu sheet. Contact data, hours and lines come from the panel
 * (`CompanyData`, `SiteSettings.shared`); the inquiry drawer and the catalog search stay Biznes.
 */
export async function BiznesFrame({ tenant, settings, biznes, company, promo, children }: Props) {
  const [index, shared] = await Promise.all([getCatalogIndex(tenant.id), getSharedData(tenant.id)])
  const tel = settings.phone ? toTelHref(settings.phone) : null
  const phone = settings.phone && tel ? { label: settings.phone, href: tel } : null
  const hours = company?.locations[0]?.hours ?? null
  const offer = offerMenu(index)
  const now = new Date().toISOString()

  const line = shared?.line
  const center = line?.tabBar?.center
  const action =
    center?.label && center.href
      ? { label: center.label, href: center.href, icon: center.icon }
      : null
  const headerCta = line?.headerCta
  const cta =
    headerCta?.label && headerCta.href ? { label: headerCta.label, href: headerCta.href } : null
  const columns = (line?.footerColumns ?? []).map((column) => ({
    heading: column.heading ?? '',
    links: (column.links ?? []).map((link) => ({ label: link.label, href: link.href })),
  }))

  return (
    <>
      {promo}
      {shared && (
        <BrandBar
          lines={shared.lines}
          current="biznes"
          hours={shared.company.hours}
          holidays={shared.company.holidays}
          now={now}
          slot={shared.line.brandBarSlot}
          phone={shared.line.phone}
          phoneLabel={shared.line.phoneLabel}
        />
      )}
      <BizHeader
        homeLabel={`${tenant.name} — strona główna`}
        menu={biznes.navigation.menu}
        offer={offer}
        phone={phone}
        hours={hours ? hoursSummary(hours) : null}
        cta={cta}
      />
      <PageTransition>{children}</PageTransition>
      {/* Sections rise in once as they come into view (`motion.css` §3, prompt 4 R1). */}
      <RevealObserver />
      {shared && (
        <SiteFooter
          line="biznes"
          lineName={tenant.name}
          description={shared.line.footerDescription}
          promises={shared.line.footerPromises ?? []}
          columns={columns}
          company={shared.company}
          contact={{
            phone: shared.line.phone,
            email: shared.line.email,
            hours: shared.company.hours,
            holidays: shared.company.holidays,
            responsePromise: shared.line.responsePromise,
          }}
          lines={shared.lines}
          legalNote={shared.line.legalNote}
          now={now}
        />
      )}
      <CartDrawer phone={phone} />
      <CartToast />
      {action && <DrawerLinks href={action.href} />}
      {/* The preview of the shared elements renders its own copies (`/_wspolne`). */}
      <PreviewGuard>
        <SearchOverlay trigger={false} />
        {shared && <BizRail sections={line?.rail?.sections ?? []} action={action} />}
        {shared && (
          <TabBar
            second={line?.tabBar?.second ?? null}
            center={center ?? null}
            centerBadge={<CartCount className={CAPSULE.count} />}
          />
        )}
        {shared && (
          <MenuSheet
            lines={shared.lines}
            current="biznes"
            phone={shared.line.phone}
            hours={shared.company.hours}
            holidays={shared.company.holidays}
            now={now}
            themes
          >
            <BizSheetList offer={offer} menu={biznes.navigation.menu} />
          </MenuSheet>
        )}
      </PreviewGuard>
    </>
  )
}
