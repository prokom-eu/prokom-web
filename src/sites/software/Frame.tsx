import type { ReactNode } from 'react'

import { log } from '@/lib/log'
import { toTelHref } from '@/lib/site/link'
import type { PublicCompanyData, PublicSiteSettings } from '@/lib/site/public'
import { getMenuAreas } from '@/lib/software/data'
import { menuTiles } from '@/lib/software/mobileNav'
import type { SoftwareNavigation } from '@/lib/software/navigation'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { PhoneLayer } from './components/PhoneLayer'
import { ProjectToast } from './components/ProjectToast'
import { SoftwareFooter } from './components/SoftwareFooter'
import { SoftwareHeader } from './components/SoftwareHeader'
import { SwTopBar } from './components/SwTopBar'

type Props = {
  tenant: SiteTenant
  settings: PublicSiteSettings
  navigation: SoftwareNavigation
  company: PublicCompanyData | null
  /** The promo bar, between the top bar and the header. */
  promo: ReactNode
  children: ReactNode
}

/**
 * Page frame of the Software line (SW4, ADR-014 rozstrz. 12; spec. §3): top bar, header with
 * the mega menu and „Twój projekt”, footer, and up to 1080 px the phone layer (bottom bar,
 * sheets) — all from `SiteSettings.software.navigation`; the menu's tile prices from the areas.
 */
export async function SoftwareFrame({
  tenant,
  settings,
  navigation,
  company,
  promo,
  children,
}: Props) {
  const areas = await getMenuAreas(tenant.id)
  // Header items with a section of the start page (Kreator → `#dobierz`) lend it to the same
  // address elsewhere (bottom bar, menu card).
  const homeHrefs: Record<string, string> = {}
  for (const item of navigation.header) {
    if ('href' in item && item.homeHref) homeHrefs[item.href] = item.homeHref
  }
  const tiles = menuTiles(navigation.mobileMenu.tiles, areas)
  const unmatched = tiles.filter((tile) => tile.key === null).map((tile) => tile.name)
  if (unmatched.length > 0) {
    log.warn({ tenant: tenant.id, tiles: unmatched }, 'Menu tiles without an area of that name')
  }
  // TODO(krystian): the sheet's bottom line is not in the panel (spec. §3.2 puts it in
  // `mobileMenuFooter`, whose schema has no text); the main branch is the first location.
  const location = company?.locations[0]
  return (
    <>
      <SwTopBar phone={settings.phone} />
      {promo}
      <SoftwareHeader tenant={tenant} navigation={navigation} />
      {children}
      <SoftwareFooter
        name={tenant.name}
        footer={navigation.footer}
        phone={settings.phone}
        email={settings.email}
        company={company}
      />
      {/* Room under the footer for the bottom bar and the project pill above it (spec. §8.6):
          the last footer links must not end up under either. */}
      <div
        aria-hidden="true"
        className="h-[calc(148px+env(safe-area-inset-bottom))] min-[1081px]:hidden"
      />
      {/* Outside the header: its backdrop blur would pin `fixed` children to the header. */}
      <ProjectToast canOpen={navigation.headerRight.projectDrawer} />
      <PhoneLayer
        navigation={navigation}
        tiles={tiles}
        homeHrefs={homeHrefs}
        phone={settings.phone ? { label: settings.phone, href: toTelHref(settings.phone) } : null}
        footerLine={location ? `PRO-KOM · ${location.street}, ${location.city} · od 2004 r.` : null}
      />
    </>
  )
}
