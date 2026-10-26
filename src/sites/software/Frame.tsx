import type { ReactNode } from 'react'

import type { PublicCompanyData, PublicSiteSettings } from '@/lib/site/public'
import type { SoftwareNavigation } from '@/lib/software/navigation'
import type { SiteTenant } from '@/lib/tenant/byHost'

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
 * the mega menu and „Twój projekt”, footer — all from `SiteSettings.software.navigation`.
 */
export function SoftwareFrame({ tenant, settings, navigation, company, promo, children }: Props) {
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
      {/* Outside the header: its backdrop blur would pin `fixed` children to the header. */}
      <ProjectToast canOpen={navigation.headerRight.projectDrawer} />
    </>
  )
}
