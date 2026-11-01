import Link from 'next/link'

import { HomeAwareLink } from '@/components/HomeAwareLink'
import { SiteLogo } from '@/components/SiteLogo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Container } from '@/components/ui/Container'
import { ICON_BUTTON } from '@/components/ui/iconButton'
import type { SoftwareNavigation } from '@/lib/software/navigation'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { ProjectMenu } from './ProjectMenu'
import { SwHeaderNav } from './SwHeaderNav'
import { SwMegaMenu } from './SwMegaMenu'

type Props = { tenant: SiteTenant; navigation: SoftwareNavigation }

const CTA =
  'inline-flex min-h-11 items-center whitespace-nowrap rounded-xl bg-button px-3 text-sm font-bold text-accent-ink shadow-raised min-[1360px]:px-5 min-[1360px]:text-[15px]'

/**
 * Sticky header of the Software line (spec. §3.1–3.2): logo, the menu in the panel's order,
 * theme switch, „Twój projekt” (only with items) and „Bezpłatna wycena”. Up to 1080 px only the
 * logo and „Wycena” (`headerMobile`) stay — the phone's bottom bar and sheets take the rest.
 * Between 1081 and 1359 px everything is tighter (14 px), so the row fits without wrapping.
 */
export function SoftwareHeader({ tenant, navigation }: Props) {
  const { header, headerRight, headerMobile, mega, projectDrawer } = navigation
  const [mobileLabel, mobileHref] = headerMobile.cta
  return (
    <header
      data-sw-header
      className="sticky top-0 z-40 border-b border-border bg-header-bg backdrop-blur-md backdrop-saturate-150"
    >
      <Container
        wide
        className="flex min-h-[66px] items-center justify-between gap-2 sm:min-h-[76px] min-[1360px]:gap-3"
      >
        <SiteLogo tenant={tenant} className="h-[30px] w-auto min-[1081px]:h-7 min-[1360px]:h-9" />

        <SwHeaderNav items={header} mega={<SwMegaMenu mega={mega} />} />

        <div className="hidden items-center gap-1.5 min-[1081px]:flex min-[1360px]:gap-2.5">
          {headerRight.themeToggle && <ThemeToggle className={ICON_BUTTON} />}
          {headerRight.projectDrawer && <ProjectMenu texts={projectDrawer} />}
          {headerRight.cta.homeHref ? (
            <HomeAwareLink
              href={headerRight.cta.href}
              homeHref={headerRight.cta.homeHref}
              className={CTA}
              data-project-fallback
            >
              {headerRight.cta.label}
            </HomeAwareLink>
          ) : (
            <Link href={headerRight.cta.href} className={CTA} data-project-fallback>
              {headerRight.cta.label}
            </Link>
          )}
        </div>

        {/* Spec. §3.2: on the start page „Wycena” leads to its contact section. */}
        <HomeAwareLink
          href={mobileHref}
          homeHref="#kontakt"
          className={`${CTA} min-[1081px]:hidden`}
          data-project-fallback
        >
          {mobileLabel}
        </HomeAwareLink>
      </Container>
    </header>
  )
}
