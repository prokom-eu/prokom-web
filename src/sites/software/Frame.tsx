import type { ReactNode } from 'react'

import { AnalyticsScript } from '@/components/AnalyticsScript'
import { BrandBar } from '@/components/shared/BrandBar'
import { MenuSheet } from '@/components/shared/MenuSheet'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { TabBar } from '@/components/shared/TabBar'
import { NEWS_PATH } from '@/lib/posts/list'
import { hasPublicPosts } from '@/lib/posts/data'
import { getSharedData } from '@/lib/shared/getSharedData'
import { paletteActions } from '@/lib/shared/search/palette'
import type { PublicSiteSettings } from '@/lib/site/public'
import { getSolutionsIndex } from '@/lib/software/data'
import { megaColumns } from '@/lib/software/megaMenu'
import type { SoftwareNavigation } from '@/lib/software/navigation'
import { withoutNewsLinks } from '@/lib/software/newsLinks'
import type { SearchPage } from '@/lib/software/searchEntries'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { PageTransition } from './PageTransition'
import { ContactToast } from './components/ContactToast'
import { ProjectToast } from './components/ProjectToast'
import { MotionGate } from './powloka/MotionGate'
import { PhoneSignals } from './powloka/PhoneSignals'
import { PreviewGuard } from './powloka/PreviewGuard'
import { StartBand } from './powloka/StartBand'
import { SwHeader } from './powloka/SwHeader'
import { SwRail } from './powloka/SwRail'
import { type SheetLink, SwSheetList } from './powloka/SwSheetList'

/** Software's own legal page, in the shared legal bar after the privacy policy (AUDYT-0811 #7). */
const TERMS = { label: 'Regulamin', href: '/regulamin' }

type Props = {
  tenant: SiteTenant
  settings: PublicSiteSettings
  navigation: SoftwareNavigation
  /** The promo bar, under the brand bar. */
  promo: ReactNode
  children: ReactNode
}

/**
 * Page frame of the Software line on the shared elements of the lines (SWA5 = D3-S, ADR-022,
 * ZMIANY-v24 §3): brand bar, header capsule with „Oferta ▾” and „Kreator 60 s”, side rail and
 * search window, the „Zacznij od podglądu” band, the shared footer, and on a phone the bottom bar
 * and the menu sheet. The menu and mega menu come from `SiteSettings.software.navigation`, the
 * rest from the shared fields (`SiteSettings.shared`, `CompanyData`). Written here: the sheet's
 * „Cennik” row and the labels of the legal pages in the search (their addresses come from
 * `CompanyData.legal`).
 */
export async function SoftwareFrame({
  tenant,
  settings,
  navigation: panelNavigation,
  promo,
  children,
}: Props) {
  const [shared, anyPost, index] = await Promise.all([
    getSharedData(tenant.id),
    hasPublicPosts(tenant.id),
    getSolutionsIndex(tenant.id),
  ])
  // No published post yet: no menu leads to an empty „Aktualności” (SWV8 P0 #3).
  const navigation = anyPost ? panelNavigation : withoutNewsLinks(panelNavigation)
  const line = shared?.line ? (anyPost ? shared.line : withoutNewsLinks(shared.line)) : null
  const homeLabel = `${tenant.name} — strona główna`
  const now = new Date().toISOString()

  const center = line?.tabBar?.center
  const action =
    center?.label && center.href
      ? { label: center.label, href: center.href, icon: center.icon }
      : null
  const cta =
    line?.headerCta?.label && line.headerCta.href
      ? {
          label: line.headerCta.label,
          // TODO(krystian): the short label has no field in `shared.headerCta` yet (as Instalacje).
          shortLabel: 'Wycena',
          href: line.headerCta.href,
          // `counter` of the panel: „Twój projekt” count on the CTA, or none.
          withCount: line.headerCta.counter === 'project',
        }
      : null
  // The terms live in the legal bar (AUDYT-0811 #7); a „Regulamin” left in a column by the panel
  // (SWA6a put it there) would show twice.
  const columns = (line?.footerColumns ?? []).map((column) => ({
    heading: column.heading ?? '',
    links: (column.links ?? [])
      .filter((link) => link.href !== TERMS.href)
      .map((link) => ({ label: link.label, href: link.href })),
  }))
  const menuLinks: SheetLink[] = navigation.header.flatMap((item) =>
    'href' in item
      ? [{ label: item.label, href: item.href, ...(item.badge && { badge: item.badge }) }]
      : [{ label: item.label, href: '/rozwiazania' }],
  )
  const sheetLinks: SheetLink[] = [
    ...menuLinks,
    { label: 'Cennik', href: '/cennik' },
    ...(anyPost ? [{ label: 'Aktualności', href: NEWS_PATH }] : []),
  ]
  const legal = shared?.company.legal
  const searchPages: SearchPage[] = [
    ...sheetLinks.map(({ label, href }) => ({ label, href })),
    ...(legal
      ? [
          { label: 'Polityka prywatności', href: legal.privacy },
          // Software's own legal page, outside the shared four (SWA6a).
          { label: 'Regulamin', href: '/regulamin' },
          { label: 'Cookies', href: legal.cookies },
          { label: 'Deklaracja dostępności', href: legal.accessibility },
          { label: 'Mapa strony', href: legal.sitemap },
        ]
      : []),
  ]

  return (
    <div id="top">
      {promo}
      {shared && line && (
        <BrandBar
          lines={shared.lines}
          current="software"
          hours={shared.company.hours}
          holidays={shared.company.holidays}
          now={now}
          slot={line.brandBarSlot}
          phone={line.phone}
          phoneLabel={line.phoneLabel}
        />
      )}
      <SwHeader
        homeLabel={homeLabel}
        navigation={navigation}
        mega={megaColumns(navigation.mega.columns, index.solutions, index.priceDisplay)}
        cta={cta}
      />
      <PageTransition>{children}</PageTransition>
      <ContactToast />
      <MotionGate />
      {navigation.startBand && (
        <StartBand band={navigation.startBand} phone={line?.phone ?? null} />
      )}
      {shared && line && (
        <SiteFooter
          line="software"
          lineName={tenant.name}
          description={line.footerDescription}
          promises={line.footerPromises ?? []}
          columns={columns}
          company={shared.company}
          contact={{
            phone: line.phone,
            phone2: line.phone2 ?? settings.phone2,
            email: line.email,
            hours: shared.company.hours,
            holidays: shared.company.holidays,
            responsePromise: line.responsePromise,
          }}
          lines={shared.lines}
          legalNote={line.legalNote}
          legalLinks={[TERMS]}
          now={now}
        />
      )}
      {/* Outside the header: its backdrop blur would pin `fixed` children to the header. */}
      <ProjectToast canOpen={navigation.headerRight.projectDrawer} />
      <PhoneSignals />
      {/* The preview of the shared elements renders its own copies (`/_wspolne`). */}
      <PreviewGuard>
        {shared && line && (
          <SwRail
            sections={line.rail?.sections ?? []}
            action={action}
            pages={searchPages}
            shortcuts={(line.rail?.searchShortcuts ?? []).map((link) => ({
              label: link.label,
              href: link.href,
            }))}
            actions={paletteActions({
              phone: line.phone,
              phone2: line.phone2,
              email: line.email,
              mapsUrl: shared.company.mapsUrl,
              primary: action,
              themes: true,
            })}
            recentlyViewed={shared.company.recentlyViewed}
            phone={line.phone}
          />
        )}
        {line && <TabBar second={line.tabBar?.second ?? null} center={center ?? null} />}
        {shared && line && (
          <MenuSheet
            lines={shared.lines}
            current="software"
            phone={line.phone}
            hours={shared.company.hours}
            holidays={shared.company.holidays}
            now={now}
            themes
          >
            <SwSheetList links={sheetLinks} />
          </MenuSheet>
        )}
      </PreviewGuard>
      <AnalyticsScript line={tenant.line} />
    </div>
  )
}
