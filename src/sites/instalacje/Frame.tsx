import type { ReactNode } from 'react'

import { AnalyticsScript } from '@/components/AnalyticsScript'
import { BrandBar } from '@/components/shared/BrandBar'
import { MenuSheet } from '@/components/shared/MenuSheet'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { TabBar } from '@/components/shared/TabBar'
import { getInstalacjeMenu } from '@/lib/instalacje/data'
import { getSharedData } from '@/lib/shared/getSharedData'
import { paletteActions } from '@/lib/shared/search/palette'
import { getCompanyData } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { PublicSiteSettings } from '@/lib/site/public'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { navigation } from './dane/nawigacja'
import { CtaBand } from './powloka/CtaBand'
import { FooterRidge } from './powloka/FooterRidge'
import { InstHeader } from './powloka/InstHeader'
import { InstRail } from './powloka/InstRail'
import { InstSheetList } from './powloka/InstSheetList'
import { PageTransition } from './powloka/PageTransition'
import { EARLY_SKIP_SCRIPT, PauseOffscreen } from './powloka/PauseOffscreen'
import { PreviewGuard } from './powloka/PreviewGuard'
import { salonsNote } from './powloka/salons'
import { FrameStyles } from './style/LineStyles'

type Props = {
  tenant: SiteTenant
  settings: PublicSiteSettings | null
  /** The promo bar, above the header. */
  promo: ReactNode
  children: ReactNode
}

/**
 * Page frame of the Instalacje line on the shared elements of the lines (L1-I, ADR-022, spec
 * WSPOLNE-ELEMENTY §5): brand bar, header capsule with the line's two mega menus, side rail and
 * search window, the line's CTA band, the shared footer with the mountain ridge, and on a phone
 * the bottom bar and the menu sheet. Contact data, hours and lines come from the panel
 * (`CompanyData`, `SiteSettings.shared`) — nothing written in code, no messenger links (decisions 01.11, D10).
 */
export async function InstalacjeFrame({ tenant, settings, promo, children }: Props) {
  const [menu, shared, company] = await Promise.all([
    getInstalacjeMenu(tenant.id),
    getSharedData(tenant.id),
    getCompanyData(),
  ])
  const telHref = settings?.phone ? toTelHref(settings.phone) : null
  const phone = settings?.phone && telHref ? { label: settings.phone, href: telHref } : null
  const homeLabel = `${tenant.name} — strona główna`
  const now = new Date().toISOString()

  const line = shared?.line
  const center = line?.tabBar?.center
  const action =
    center?.label && center.href
      ? { label: center.label, href: center.href, icon: center.icon }
      : null
  const columns = (line?.footerColumns ?? []).map((column) => ({
    heading: column.heading ?? '',
    links: (column.links ?? []).map((link) => ({ label: link.label, href: link.href })),
  }))

  return (
    <>
      <FrameStyles />
      <PauseOffscreen />
      {/* Runs while the page is parsed, before the sections (`PauseOffscreen`). */}
      <script dangerouslySetInnerHTML={{ __html: EARLY_SKIP_SCRIPT }} />
      <div id="top" className="inst-page min-h-dvh bg-surface text-ink">
        {promo}
        {shared && (
          <BrandBar
            lines={shared.lines}
            current="instalacje"
            hours={shared.company.hours}
            holidays={shared.company.holidays}
            now={now}
            slot={shared.line.brandBarSlot}
            phone={shared.line.phone}
            phoneLabel={shared.line.phoneLabel}
          />
        )}
        <InstHeader
          homeLabel={homeLabel}
          navigation={navigation}
          menu={menu}
          withShared={shared !== null}
        />
        <PageTransition>{children}</PageTransition>
        <CtaBand
          band={navigation.ctaBand}
          phone={phone}
          salons={salonsNote(company?.locations ?? [])}
        />
        {shared && (
          <SiteFooter
            line="instalacje"
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
            edge={<FooterRidge />}
          />
        )}
        {/* The preview of the shared elements renders its own copies (`/_wspolne`). */}
        <PreviewGuard>
          {shared && (
            <InstRail
              sections={shared.line.rail?.sections ?? []}
              action={action}
              settings={{
                synonyms: shared.line.rail?.synonyms ?? [],
                popular: shared.line.rail?.searchPopular ?? [],
                shortcuts: (shared.line.rail?.searchShortcuts ?? []).map((link) => ({
                  label: link.label,
                  href: link.href,
                })),
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
          {shared && <TabBar second={line?.tabBar?.second ?? null} center={center ?? null} />}
          {shared && (
            <MenuSheet
              lines={shared.lines}
              current="instalacje"
              phone={shared.line.phone}
              hours={shared.company.hours}
              holidays={shared.company.holidays}
              now={now}
              themes
              search="Szukaj na stronie"
            >
              <InstSheetList navigation={navigation} menu={menu} />
            </MenuSheet>
          )}
        </PreviewGuard>
        {/* Statistics (ADR-020): rendered only when `UMAMI_WEBSITES` has `instalacje=<id>`. */}
        <AnalyticsScript line={tenant.line} />
      </div>
    </>
  )
}
