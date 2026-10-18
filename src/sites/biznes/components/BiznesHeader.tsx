import Link from 'next/link'

import { SiteLogo } from '@/components/SiteLogo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Container } from '@/components/ui/Container'
import { ICON_BUTTON } from '@/components/ui/iconButton'
import type { MegaMenu } from '@/lib/catalog/menu'
import { type PublicBiznesNavigation, withoutEmptyDropdowns } from '@/lib/site/navigation'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { HeaderNav } from './HeaderNav'
import { IndustriesPanel } from './IndustriesPanel'
import { MegaMenuPanel } from './MegaMenuPanel'
import { MobileMenu } from './MobileMenu'
import { MobileMenuContent } from './MobileMenuContent'

type Props = {
  tenant: SiteTenant
  navigation: PublicBiznesNavigation
  menu: MegaMenu
  /** Names of inactive industries, shown as "Wkrótce" under Branże ▾. */
  soonIndustries: string[]
  /** Main phone (`tel:`) and WhatsApp (wa.me) of the line, for the phone menu. */
  contact: { phone: { label: string; href: string } | null; whatsapp: string | null }
}

/**
 * Sticky, translucent header of the Biznes line (spec. §3.2). Search and the inquiry counter
 * come with B4: until then the search field leads to the catalog and "Zapytanie" to its page.
 * Below 1024 px the full-screen menu (`MobileMenu`) replaces the desktop navigation.
 */
export function BiznesHeader({ tenant, navigation, menu, soonIndustries, contact }: Props) {
  const items = withoutEmptyDropdowns(navigation.menu, {
    offer: menu.columns.length > 0,
    industries: navigation.industries.length > 0 || soonIndustries.length > 0,
  })
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md backdrop-saturate-150">
      <Container
        wide
        className="flex min-h-[66px] items-center justify-between gap-3 sm:min-h-[76px] sm:gap-4"
      >
        {/* 30 px on phones, as in the `Mobile` design. */}
        <SiteLogo tenant={tenant} className="h-[30px] w-auto sm:h-9" />

        {/* Nothing to show until the navigation is filled in the panel (no empty `<nav>`). */}
        {items.length > 0 && (
          <HeaderNav
            menu={items}
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
        )}

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
          <Link href="/oferta" className={`${ICON_BUTTON} xl:hidden`}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M11 18a7 7 0 100-14 7 7 0 000 14z M20 20l-4.3-4.3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="sr-only">Szukaj w ofercie</span>
          </Link>
          {/* On phones the switch lives in the menu (spec. §3.3). */}
          <div className="hidden sm:block">
            <ThemeToggle className={ICON_BUTTON} />
          </div>
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
          {items.length > 0 && (
            <div className="lg:hidden">
              <MobileMenu>
                <MobileMenuContent
                  items={items}
                  menu={menu}
                  industries={navigation.industries}
                  phone={contact.phone}
                  whatsapp={contact.whatsapp}
                />
              </MobileMenu>
            </div>
          )}
        </div>
      </Container>
    </header>
  )
}
