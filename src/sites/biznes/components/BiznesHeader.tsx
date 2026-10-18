import Link from 'next/link'

import { ICON_BUTTON } from '@/components/SiteHeader'
import { SiteLogo } from '@/components/SiteLogo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Container } from '@/components/ui/Container'
import type { MegaMenu } from '@/lib/catalog/menu'
import type { PublicBiznesNavigation } from '@/lib/site/navigation'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { HeaderNav } from './HeaderNav'
import { IndustriesPanel } from './IndustriesPanel'
import { MegaMenuPanel } from './MegaMenuPanel'

type Props = {
  tenant: SiteTenant
  navigation: PublicBiznesNavigation
  menu: MegaMenu
  /** Names of inactive industries, shown as "Wkrótce" under Branże ▾. */
  soonIndustries: string[]
}

/**
 * Sticky, translucent header of the Biznes line (spec. §3.2). Search and the inquiry counter
 * come with B4: until then the search field leads to the catalog and "Zapytanie" to its page.
 * Below 1024 px a plain `<details>` menu stands in until the full-screen menu of B3b.
 */
export function BiznesHeader({ tenant, navigation, menu, soonIndustries }: Props) {
  const flatLinks = navigation.menu.flatMap((item) =>
    item.type === 'industries'
      ? navigation.industries.map((industry) => ({
          label: industry.name,
          href: `/branze/${industry.slug}`,
        }))
      : [{ label: item.label, href: item.href ?? '/oferta' }],
  )
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md backdrop-saturate-150">
      <Container
        wide
        className="flex min-h-[66px] items-center justify-between gap-3 sm:min-h-[76px] sm:gap-4"
      >
        {/* 30 px on phones, as in the `Mobile` design. */}
        <SiteLogo tenant={tenant} className="h-[30px] w-auto sm:h-9" />

        <HeaderNav
          menu={navigation.menu}
          panels={{
            offer: (
              <MegaMenuPanel
                menu={menu}
                shortcuts={navigation.shortcuts}
                cards={navigation.cards}
              />
            ),
            industries: (
              <IndustriesPanel industries={navigation.industries} soon={soonIndustries} />
            ),
          }}
        />

        <div className="flex items-center gap-2">
          <Link
            href="/oferta"
            className="hidden h-11 items-center gap-2.5 whitespace-nowrap rounded-xl border border-border bg-surface-2 px-3.5 text-sm font-semibold text-ink-2 hover:text-ink xl:inline-flex"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M11 18a7 7 0 100-14 7 7 0 000 14z M20 20l-4.3-4.3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Szukaj w ofercie
          </Link>
          {/* TODO(B3b): on phones into the full-screen menu (spec. §3.3). */}
          <ThemeToggle className={ICON_BUTTON} />
          <Link
            href="/zapytanie"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent-text px-3.5 font-extrabold sm:px-4 text-accent-ink shadow-lg shadow-glow transition-transform hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            <span className="sr-only sm:not-sr-only">Zapytanie</span>
          </Link>
          <details className="relative lg:hidden">
            <summary
              className={`${ICON_BUTTON} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
              </svg>
              <span className="sr-only">Menu</span>
            </summary>
            <nav
              aria-label="Menu"
              className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-card p-3 shadow-lg"
            >
              <ul className="flex flex-col gap-1">
                {flatLinks.map((link) => (
                  <li key={link.href + link.label}>
                    <a
                      href={link.href}
                      className="flex min-h-11 items-center px-2 font-semibold text-ink"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </Container>
    </header>
  )
}
