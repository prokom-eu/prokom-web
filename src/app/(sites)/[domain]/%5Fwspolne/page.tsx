import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AddressMap } from '@/components/shared/AddressMap'
import { BrandBar } from '@/components/shared/BrandBar'
import { CAPSULE } from '@/components/shared/capsule'
import { MenuButton } from '@/components/shared/MenuButton'
import { MenuSheet } from '@/components/shared/MenuSheet'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { SiteRail } from '@/components/shared/SiteRail'
import { TabBar } from '@/components/shared/TabBar'
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
  searchParams: Promise<{ stan?: string | string[]; szyna?: string | string[] }>
}

export const metadata: Metadata = {
  title: 'Elementy wspólne — podgląd',
  robots: { index: false, follow: false },
}

const STATE_LINKS = [
  { href: '?szyna=glowna', label: 'Szyna jak na stronie głównej' },
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
  // `?szyna=glowna`: the rail as on a home page, over the sections of this preview (D2-2).
  const railHome = (Array.isArray(query.szyna) ? query.szyna[0] : query.szyna) === 'glowna'
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
  const now = new Date().toISOString()
  const { address } = company
  const where = address ? `${address.street}, ${address.postalCode} ${address.city}` : null
  const columns = (line.footerColumns ?? []).map((column) => ({
    heading: column.heading ?? '',
    links: (column.links ?? []).map((link) => ({ label: link.label, href: link.href })),
  }))

  return (
    <div data-wspolne>
      <BrandBar
        lines={lines}
        current={tenant.line}
        hours={company.hours}
        holidays={company.holidays}
        now={now}
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
        menuButton={<MenuButton />}
        state={preview ? PREVIEW_STATES[preview] : undefined}
      />

      <section
        id="wspolne-start"
        aria-labelledby="wspolne-h1"
        className="mx-auto max-w-[1344px] scroll-mt-28 px-8 pt-20"
        data-rail-section="Kapsuła"
        data-rail-icon="rocket"
      >
        <h1 id="wspolne-h1" className="font-display text-3xl font-extrabold">
          Elementy wspólne — {tenant.name}
        </h1>
        <p className="mt-3 max-w-[70ch] text-ink-2">
          Powłoka linii na danych z panelu: pasek marki, nagłówek-kapsuła, mapa adresu, stopka, a na
          telefonie dolny pasek i arkusz Menu. Menu kapsuły i lista w arkuszu to przykłady —
          prawdziwe treści linii wchodzą w D3. Motyw zmienisz przełącznikiem w kapsule.
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

      {where && (
        <section
          id="wspolne-mapa-sekcja"
          aria-labelledby="wspolne-mapa"
          className="mx-auto max-w-[1344px] scroll-mt-28 px-8 py-16"
          data-rail-section="Mapa adresu"
          data-rail-icon="pin"
        >
          <h2 id="wspolne-mapa" className="font-display text-2xl font-extrabold">
            Mapa adresu
          </h2>
          <p className="mt-2 text-ink-2">
            Jasna z etykietą (hero Kontaktu, 290 px) i ciemna (O firmie, 400 px); mini w stopce.
          </p>
          <div className="mt-6 grid gap-6 min-[900px]:grid-cols-2">
            <AddressMap
              height={290}
              radius={28}
              label={{ title: 'PRO-KOM', text: where }}
              description={`Mapa: ${company.name}, ${where}`}
              mapsUrl={company.mapsUrl}
            />
            <AddressMap
              variant="dark"
              height={400}
              radius={28}
              label={{ title: 'PRO-KOM', text: where }}
              description={`Mapa: ${company.name}, ${where} — wariant ciemny`}
              mapsUrl={company.mapsUrl}
              routeLabel="Wyznacz trasę"
            />
          </div>
        </section>
      )}

      <div
        id="wspolne-stopka"
        className="scroll-mt-28"
        data-rail-section="Stopka"
        data-rail-icon="doc"
      >
        <SiteFooter
          line={tenant.line}
          lineName={tenant.name}
          description={line.footerDescription}
          promises={line.footerPromises ?? []}
          columns={columns}
          company={company}
          contact={{
            phone: line.phone,
            email: line.email,
            hours: company.hours,
            holidays: company.holidays,
            responsePromise: line.responsePromise,
          }}
          lines={lines}
          legalNote={line.legalNote}
          now={now}
        />
      </div>

      <SiteRail
        sections={
          railHome
            ? [
                { anchorId: 'wspolne-start', label: 'Kapsuła', icon: 'rocket' },
                { anchorId: 'wspolne-mapa-sekcja', label: 'Mapa adresu', icon: 'pin' },
                { anchorId: 'wspolne-stopka', label: 'Stopka', icon: 'doc' },
              ]
            : (line.rail?.sections ?? [])
        }
        onHome={railHome}
        action={
          line.tabBar?.center?.label && line.tabBar.center.href
            ? {
                label: line.tabBar.center.label,
                href: line.tabBar.center.href,
                icon: line.tabBar.center.icon,
                count: counted ? 3 : null,
                countLabel: counted ? 'W zapytaniu' : null,
              }
            : null
        }
      />

      <TabBar
        second={line.tabBar?.second ?? null}
        center={line.tabBar?.center ?? null}
        centerBadge={counted ? <em className={CAPSULE.count}>3</em> : undefined}
      />
      <MenuSheet
        lines={lines}
        current={tenant.line}
        phone={line.phone}
        hours={company.hours}
        holidays={company.holidays}
        now={now}
        themes={hasDarkTheme(tenant.line)}
      >
        <ul
          className="flex flex-col rounded-2xl border border-border bg-card"
          aria-label="Lista linii (przykład)"
        >
          {nav.map((item) => (
            <li key={item.key} className="border-t border-border first:border-t-0">
              <a
                href={item.href ?? '#'}
                className="flex min-h-[46px] items-center justify-between px-3.5 font-bold"
              >
                {item.label}
                <Icon name="arrow" className="size-4 text-ink-2" />
              </a>
            </li>
          ))}
        </ul>
      </MenuSheet>
    </div>
  )
}
