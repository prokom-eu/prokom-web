import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BrandBar } from '@/components/shared/BrandBar'
import { CAPSULE } from '@/components/shared/capsule'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Icon } from '@/components/ui/Icon'
import { hasDarkTheme } from '@/lib/brand/theme'
import { getEnv } from '@/lib/env'
import { getSharedData } from '@/lib/shared/getSharedData'

import { requireTenant } from '../tenant'
import { DEMO_NAV, DEMO_SHORT_CTA, isPreviewState, PREVIEW_STATES } from './demo'
import { DemoMega } from './DemoMega'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<{ stan?: string | string[] }>
}

export const metadata: Metadata = {
  title: 'Elementy wspólne — podgląd',
  robots: { index: false, follow: false },
}

const STATE_LINKS = [
  { href: '?', label: 'Na żywo (przewiń stronę)' },
  { href: '?stan=gora', label: 'Góra strony' },
  { href: '?stan=przewinieta', label: 'Po przewinięciu' },
  { href: '?stan=mega', label: 'Mega menu otwarte' },
]

/**
 * `/_wspolne` — the shared elements of the lines on this site's real data (`getSharedData`), for
 * comparing with the boards and for the e2e tests (plan D2, spec §10 pkt 4). Local and staging
 * only (404 on production), `noindex`, not in the sitemap. One instance of each component per page
 * (unique landmarks for axe); fixed capsule states through `?stan=`. Grows with each D2 PR.
 */
export default async function SharedPreviewPage({ params, searchParams }: Props) {
  const tenant = await requireTenant(params)
  if (getEnv().SITE_ENV === 'production') notFound()
  const [shared, query] = await Promise.all([getSharedData(tenant.id), searchParams])
  const stan = Array.isArray(query.stan) ? query.stan[0] : query.stan
  const preview = isPreviewState(stan) ? stan : null

  if (!shared) {
    return (
      <div className="mx-auto max-w-[1280px] px-8 py-16">
        <h1 className="font-display text-3xl font-extrabold">Elementy wspólne — podgląd</h1>
        <p className="mt-4">Brak danych wspólnych w bazie — uruchom lokalnie `pnpm seed`.</p>
      </div>
    )
  }

  const { company, line, lines } = shared
  const nav = DEMO_NAV[tenant.line]
  const cta = line.headerCta?.label && line.headerCta.href ? line.headerCta : null
  const counted = cta?.counter && cta.counter !== 'none'

  return (
    <div data-wspolne className="pb-[120vh]">
      <BrandBar
        lines={lines}
        current={tenant.line}
        hours={company.hours}
        holidays={company.holidays}
        now={new Date().toISOString()}
        slot={line.brandBarSlot}
        phone={line.phone}
        phoneLabel={line.phoneLabel}
      />
      <SiteHeader
        line={tenant.line}
        homeLabel={`${tenant.name} — strona główna`}
        nav={nav}
        megaFor={(key) => {
          const item = nav.find((entry) => entry.key === key)
          const first = key === nav.find((entry) => !entry.href)?.key
          return item ? (
            <DemoMega label={item.label} initiallyOpen={preview === 'mega' && first} />
          ) : null
        }}
        actions={
          <>
            {tenant.line === 'biznes' && (
              <button type="button" className={CAPSULE.searchButton}>
                <Icon name="search" strokeWidth={2.2} className="size-4" />
                <span>Szukaj</span>
                <kbd>Ctrl K</kbd>
              </button>
            )}
            {hasDarkTheme(tenant.line) && <ThemeToggle className={CAPSULE.iconButton} />}
            {tenant.line === 'software' && (
              <button type="button" className={CAPSULE.pillButton}>
                Twój projekt <em className={CAPSULE.count}>2</em>
              </button>
            )}
          </>
        }
        cta={
          cta && {
            label: cta.label!,
            shortLabel: DEMO_SHORT_CTA[tenant.line],
            href: cta.href!,
            badge: counted ? <em className={CAPSULE.count}>3</em> : undefined,
          }
        }
        menuButton={
          <button type="button" className={CAPSULE.iconButton} aria-label="Menu">
            <Icon name="grid" />
          </button>
        }
        state={preview ? PREVIEW_STATES[preview] : undefined}
      />

      <section aria-labelledby="wspolne-h1" className="mx-auto max-w-[1344px] px-8 pt-20">
        <h1 id="wspolne-h1" className="font-display text-3xl font-extrabold">
          Elementy wspólne — {tenant.name}
        </h1>
        <p className="mt-3 max-w-[70ch] text-ink-2">
          Pasek marki i nagłówek-kapsuła na danych tej linii z panelu (linie, godziny, telefon,
          odnośnik paska, przycisk akcji). Menu to przykład z planszy 11 — prawdziwe menu i mega
          menu linii wchodzą w D3. Motyw zmienisz przełącznikiem w kapsule.
        </p>
        <ul className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
          {STATE_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 hover:bg-surface-2"
                aria-current={
                  (link.href === '?' ? !preview : link.href === `?stan=${preview}`)
                    ? 'page'
                    : undefined
                }
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
