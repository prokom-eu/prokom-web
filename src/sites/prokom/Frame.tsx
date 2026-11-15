import type { ReactNode } from 'react'

import { AnalyticsScript } from '@/components/AnalyticsScript'
import { BrandBar } from '@/components/shared/BrandBar'
import { MenuSheet } from '@/components/shared/MenuSheet'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { TabBar } from '@/components/shared/TabBar'
import { getHubData, getHubSettings } from '@/lib/prokom/data'
import { getSharedData } from '@/lib/shared/getSharedData'
import { paletteActions } from '@/lib/shared/search/palette'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { PreviewGuard } from './powloka/PreviewGuard'
import { ProkomHeader } from './powloka/ProkomHeader'
import { ProkomRail } from './powloka/ProkomRail'
import { ProkomSheetList } from './powloka/ProkomSheetList'
import { footerColumns, hubNav, liveLink, megaLines, sheetLinks, startLinks } from './shell'

/** „Cała oferta” — a page of version 1 (spec §2.1, H3-1). */
const OFFER_PATH = '/linie'

type Props = {
  tenant: SiteTenant
  /** The promo bar, above the header. */
  promo: ReactNode
  children: ReactNode
}

/**
 * Page frame of pro-kom.eu on the shared elements of the lines (spec §5, ADR-H001 pkt 3): brand bar,
 * header capsule with the „Oferta” mega menu, side rail on the home page, search window, shared
 * footer with the lines band, and on a phone the bottom bar and the menu sheet. Contact data, hours
 * and lines come from the panel (`CompanyData`, `SiteSettings.shared`), services from `HubServices`,
 * the pages of v1.1 from `HubSettings.pages` — no link to a page that is switched off.
 */
export async function ProkomFrame({ tenant, promo, children }: Props) {
  const [shared, hub, settings] = await Promise.all([
    getSharedData(tenant.id),
    getHubData(tenant.id),
    getHubSettings(tenant.id),
  ])
  const flags = settings.pages
  const now = new Date().toISOString()
  const line = shared?.line
  const lines = shared ? megaLines(shared.lines, hub.services) : []
  const center = liveLink(line?.tabBar?.center, flags)
  const headerCta = liveLink(line?.headerCta, flags)
  // Short label of the capsule (1081–1359 px) = the tab bar's centre of the panel („Dobierz”).
  const cta = headerCta?.label
    ? { label: headerCta.label, shortLabel: center?.label ?? headerCta.label, href: headerCta.href }
    : null
  const action = center?.label
    ? { label: center.label, href: center.href, icon: center.icon }
    : null

  return (
    <div id="top" className="pk-page min-h-dvh bg-surface text-ink">
      {promo}
      {shared && (
        <BrandBar
          lines={shared.lines}
          current="prokom"
          hours={shared.company.hours}
          holidays={shared.company.holidays}
          now={now}
          slot={shared.line.brandBarSlot}
          phone={shared.line.phone}
          phone2={shared.line.phone2}
          phoneLabel={shared.line.phoneLabel}
        />
      )}
      <ProkomHeader
        homeLabel={`${tenant.name} — strona główna`}
        nav={hubNav(flags)}
        lines={lines}
        start={startLinks(flags)}
        cta={cta}
        offerHref={OFFER_PATH}
      />
      {children}
      {shared && (
        <SiteFooter
          line="prokom"
          lineName={tenant.name}
          description={shared.line.footerDescription}
          promises={shared.line.footerPromises ?? []}
          columns={footerColumns(shared.lines, shared.line.footerColumns ?? [], flags)}
          company={shared.company}
          contact={{
            phone: shared.line.phone,
            phone2: shared.line.phone2,
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
      {/* The preview of the shared elements renders its own copies (`/_wspolne`). */}
      <PreviewGuard>
        {shared && (
          <ProkomRail
            sections={shared.line.rail?.sections ?? []}
            action={action}
            settings={{
              synonyms: shared.line.rail?.synonyms ?? [],
              popular: shared.line.rail?.searchPopular ?? [],
              shortcuts: (shared.line.rail?.searchShortcuts ?? [])
                .filter((link) => liveLink(link, flags))
                .map((link) => ({ label: link.label, href: link.href })),
            }}
            actions={paletteActions({
              phone: shared.line.phone,
              phone2: shared.line.phone2,
              email: shared.line.email,
              mapsUrl: shared.company.mapsUrl,
              primary: action,
              themes: true,
            })}
            recentlyViewed={shared.company.recentlyViewed}
            phone={shared.line.phone}
          />
        )}
        {shared && (
          <TabBar
            second={liveLink(line?.tabBar?.second, flags)}
            center={center}
            fourth={liveLink(line?.tabBar?.fourth, flags)}
          />
        )}
        {shared && (
          <MenuSheet
            lines={shared.lines}
            current="prokom"
            phone={shared.line.phone}
            phone2={shared.line.phone2}
            hours={shared.company.hours}
            holidays={shared.company.holidays}
            now={now}
            themes
            search="Szukaj w PRO-KOM"
          >
            <ProkomSheetList links={sheetLinks(flags)} offerHref={OFFER_PATH} />
          </MenuSheet>
        )}
      </PreviewGuard>
      {/* Statistics (ADR-020): rendered only when `UMAMI_WEBSITES` has `prokom=<id>`. */}
      <AnalyticsScript line={tenant.line} />
    </div>
  )
}
