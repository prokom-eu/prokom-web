import { SiteLogo } from '@/components/SiteLogo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Container } from '@/components/ui/Container'
import { ICON_BUTTON } from '@/components/ui/iconButton'
import type { MegaMenu, OfferMenu } from '@/lib/catalog/menu'
import { type PublicBiznesNavigation, withoutEmptyDropdowns } from '@/lib/site/navigation'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { CartButton } from './CartButton'
import { CartDrawer } from './CartDrawer'
import { CartToast } from './CartToast'
import { HeaderNav } from './HeaderNav'
import { MegaMenuPanel } from './MegaMenuPanel'
import { MobileMenu } from './MobileMenu'
import { MobileMenuContent } from './MobileMenuContent'
import { ScreenTitle } from './mobile/ScreenTitle'
import { SearchOverlay } from './SearchOverlay'

type Props = {
  tenant: SiteTenant
  navigation: PublicBiznesNavigation
  /** Columns of the phone menu (`MobileMenuContent`). */
  menu: MegaMenu
  /** Oferta ▾ of K4 (mega menu v147c). */
  offer: OfferMenu
  /** Opening hours in short for the mega menu, e.g. „pn–pt 9–17”. */
  hours: string | null
  /** Main phone (`tel:`) and WhatsApp (wa.me) of the line, for the phone menu. */
  contact: { phone: { label: string; href: string } | null; whatsapp: string | null }
}

/**
 * Sticky, translucent header of the Biznes line (spec. §3.2) with the catalog search
 * (`SearchOverlay`) and the inquiry list ("Zapytanie" with its counter, drawer and toast).
 * Below 1080 px the full-screen menu (`MobileMenu`) replaces the desktop navigation (v20);
 * below 768 px it is the top bar of the phone app (`ScreenTitle`, MOBILE-APLIKACJA §1).
 */
export function BiznesHeader({ tenant, navigation, menu, offer, hours, contact }: Props) {
  const items = withoutEmptyDropdowns(navigation.menu, { offer: menu.columns.length > 0 })
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md backdrop-saturate-150">
        <Container
          wide
          className="flex min-h-[60px] items-center justify-between gap-3 sm:min-h-[76px] sm:gap-4"
        >
          {/* 30 px on phones, as in the `Mobile` design; subpages show „←” and the title there. */}
          <ScreenTitle logo={<SiteLogo tenant={tenant} className="h-[30px] w-auto sm:h-9" />} />

          {/* Nothing to show until the navigation is filled in the panel (no empty `<nav>`). */}
          {items.length > 0 && (
            <HeaderNav
              menu={items}
              panels={{
                offer: <MegaMenuPanel offer={offer} phone={contact.phone} hours={hours} />,
              }}
            />
          )}

          <div className="flex items-center gap-2">
            <SearchOverlay whatsapp={contact.whatsapp} />
            {/* On phones the switch lives in the menu (spec. §3.3). */}
            <div className="hidden sm:block">
              <ThemeToggle className={ICON_BUTTON} />
            </div>
            {/* Below 768 px the bottom tab bar carries „Zapytanie” with its counter. */}
            <CartButton
              iconSize={18}
              labelClassName="sr-only sm:not-sr-only"
              className="max-md:hidden inline-flex h-11 items-center gap-2 rounded-xl bg-accent-text px-3.5 font-extrabold text-accent-ink shadow-lg shadow-glow transition-transform hover:-translate-y-0.5 sm:px-4"
            />
            {items.length > 0 && (
              <div className="min-[1080px]:hidden">
                <MobileMenu>
                  <MobileMenuContent
                    items={items}
                    menu={menu}
                    phone={contact.phone}
                    whatsapp={contact.whatsapp}
                  />
                </MobileMenu>
              </div>
            )}
          </div>
        </Container>
      </header>
      {/* Outside the header: its backdrop blur would pin `fixed` children to the header. */}
      <CartDrawer phone={contact.phone} />
      <CartToast />
    </>
  )
}
