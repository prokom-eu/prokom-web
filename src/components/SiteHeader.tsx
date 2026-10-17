import Image from 'next/image'
import Link from 'next/link'

import { brandAsset } from '@/lib/brand/lines'
import { hasDarkTheme } from '@/lib/brand/theme'
import type { PublicSiteSettings } from '@/lib/site/public'
import type { SiteTenant } from '@/lib/tenant/byHost'

import { NavLinks } from './NavLinks'
import { ThemeToggle } from './ThemeToggle'
import { Container } from './ui/Container'

type Props = { tenant: SiteTenant; settings: PublicSiteSettings | null }

// Intrinsic size of the horizontal marks in `public/brand/` (all lines share the viewBox).
const LOGO = { width: 836, height: 167 }

const ICON_BUTTON =
  'inline-flex size-11 items-center justify-center rounded-xl border border-border text-ink hover:bg-surface-2'

/**
 * Sticky header: the line's logo (negative version in the dark theme), the main navigation from
 * `SiteSettings` and — on lines with a dark design — the theme switch. On phones the
 * navigation folds into a `<details>` menu: no JavaScript needed to open it.
 */
export function SiteHeader({ tenant, settings }: Props) {
  const dark = hasDarkTheme(tenant.line)
  const links = settings?.navigation ?? []
  const alt = `${tenant.name} — strona główna`
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md">
      <Container className="flex min-h-[76px] items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Image
            src={brandAsset(tenant.line, 'poziome_kolor.svg')}
            alt={alt}
            {...LOGO}
            className={dark ? 'theme-light-only h-9 w-auto' : 'h-9 w-auto'}
          />
          {dark && (
            <Image
              src={brandAsset(tenant.line, 'poziome_negatyw.svg')}
              alt={alt}
              {...LOGO}
              className="theme-dark-only h-9 w-auto"
            />
          )}
        </Link>

        <div className="flex items-center gap-2">
          {links.length > 0 && (
            <nav aria-label="Główna">
              <NavLinks links={links} className="hidden items-center gap-5 md:flex" />
              <details className="group relative md:hidden">
                <summary className={`${ICON_BUTTON} cursor-pointer list-none`}>
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
                <NavLinks
                  links={links}
                  className="absolute right-0 top-full mt-2 flex w-64 flex-col gap-1 rounded-2xl border border-border bg-card p-3 shadow-lg"
                />
              </details>
            </nav>
          )}
          {dark && <ThemeToggle className={ICON_BUTTON} />}
        </div>
      </Container>
    </header>
  )
}
