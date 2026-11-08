import Link from 'next/link'
import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { plural } from '@/lib/plural'
import { serializeJsonLd } from '@/lib/seo/jsonLd'
import { aboutStats, FOUNDED, pageBreadcrumbsJsonLd } from '@/lib/shared/pages'
import type { SharedData } from '@/lib/shared/project'
import { toTelHref } from '@/lib/site/link'
import type { Line } from '@/lib/tenant/lines'

import { AddressMap } from './AddressMap'
import { type AuthLogo, CompanyCard } from './CompanyCard'
import { Contours } from './Contours'
import { FamilyStrip } from './FamilyStrip'
import { PageCrumbs, type Crumb } from './PageCrumbs'
import { PAGE_CONTAINER as CONTAINER } from './pageContainer'
import { RulesBento } from './RulesBento'
import { StatsStrip } from './StatsStrip'
import { Steps } from './Steps'
import { VerifyCards } from './VerifyCards'

/** The line's own sections in named places (spec §6.0). */
export type AboutSlots = {
  afterStats?: ReactNode
  /** E.g. authorisations and partners. */
  afterRules?: ReactNode
  afterSteps?: ReactNode
  beforeVisit?: ReactNode
}

export type AboutPageProps = {
  shared: SharedData
  line: Line
  /** `https://prokombiznes.pl`, no trailing slash (breadcrumb addresses in JSON-LD). */
  origin: string
  /** `SITE_ENV`: a flagged number is hidden on production (`StatsStrip`). */
  siteEnv: string
  /** Default: home → O firmie (`/o-firmie`). */
  breadcrumbs?: readonly Crumb[]
  slots?: AboutSlots
  /** Optional section (spec §6.0) — on by default. */
  showVerify?: boolean
  /** Logos of the line's authorisations in the company card (Biznes, plan 0611 §8.2). */
  authLogos?: readonly AuthLogo[]
}

const H2 =
  'font-display text-[clamp(32px,3.8vw,48px)] leading-none font-extrabold tracking-[-0.025em]'
const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark-text'

/**
 * The O firmie page of every line (spec §6.2, board „05 · O firmie”): hero with the company card,
 * stats over its edge, „Dlaczego PRO-KOM”, steps, the lines, „Nie musisz wierzyć nam na słowo”, the
 * visit card. No people, no photos. Texts from `shared.about` (H1 and lead differ per line — SEO).
 */
export function AboutPage({
  shared,
  line,
  origin,
  siteEnv,
  breadcrumbs = [
    { name: 'Strona główna', path: '/' },
    { name: 'O firmie', path: '/o-firmie' },
  ],
  slots = {},
  showVerify = true,
  authLogos,
}: AboutPageProps) {
  const { company, lines } = shared
  const data = shared.line
  const about = data.about ?? {}
  const tel = data.phone ? toTelHref(data.phone) : null
  const { address } = company
  const where = address ? `${address.street}, ${address.postalCode} ${address.city}` : null
  const lineCount = lines.filter((item) => item.kind === 'linia').length
  const gaming = lines.some((item) => item.key === 'gaming')
  const jsonLd = pageBreadcrumbsJsonLd(origin, breadcrumbs)

  return (
    <div data-about-page>
      <script
        type="application/ld+json"
        // Panel texts, serialized with `<` escaped (`serializeJsonLd`).
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <section
        aria-labelledby="o-firmie-h1"
        className="relative isolate overflow-hidden bg-line-dark pt-10 pb-24 text-line-dark-text min-[1000px]:pt-14"
        data-rail-section="O firmie"
        data-rail-icon="users"
      >
        <Contours />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 bottom-0 -z-[1] font-display text-[clamp(160px,25vw,360px)] leading-none font-extrabold text-transparent opacity-10"
          style={{ WebkitTextStroke: '2px var(--on-dark)' }}
        >
          {FOUNDED.year}
        </span>
        <div
          className={cx(
            CONTAINER,
            'grid items-start gap-10 min-[1000px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]',
          )}
        >
          <div className="flex flex-col gap-5">
            <PageCrumbs items={breadcrumbs} onDark />
            <p className="self-start rounded-full border border-line-dark-rule bg-line-dark-card px-4 py-1.5 text-sm font-bold text-line-dark-ink">
              {company.name}
              {address && ` · ${address.city}`}, od {FOUNDED.year}
            </p>
            <h1
              id="o-firmie-h1"
              className="font-display text-[clamp(42px,6vw,74px)] leading-[0.95] font-extrabold tracking-[-0.03em] text-line-dark-ink"
            >
              {about.h1 || 'O firmie'}
            </h1>
            {about.lead && <p className="max-w-[56ch] text-lg">{about.lead}</p>}
            <div className="flex flex-wrap gap-3">
              {tel && (
                <a
                  href={tel}
                  className={cx(
                    'inline-flex min-h-12 items-center gap-2 rounded-[14px] bg-on-dark px-5 font-extrabold text-on-dark-ink',
                    FOCUS,
                  )}
                >
                  <Icon name="phone" className="size-4" strokeWidth={2.2} />
                  {data.phone}
                </a>
              )}
              <a
                href="#wspolpraca"
                className={cx(
                  'inline-flex min-h-12 items-center gap-2 rounded-[14px] border-[1.5px] border-line-dark-rule px-5 font-extrabold text-line-dark-ink hover:bg-line-dark-current',
                  FOCUS,
                )}
              >
                Jak pracujemy
              </a>
            </div>
          </div>
          <CompanyCard
            company={company}
            phone={data.phone}
            email={data.email}
            hours={company.hours}
            authTitle={about.authTitle}
            auth={about.auth}
            authLogos={authLogos}
          />
        </div>
      </section>

      <div className={cx(CONTAINER, 'relative z-[1] -mt-9')}>
        <StatsStrip stats={aboutStats(about.stats, lines)} siteEnv={siteEnv} />
      </div>

      {slots.afterStats}

      {about.rules && about.rules.length > 0 && (
        <section
          id="dlaczego"
          aria-labelledby="o-firmie-zasady"
          className={cx(CONTAINER, 'scroll-mt-28 py-16')}
          data-rail-section="Zasady"
          data-rail-icon="star"
        >
          <h2 id="o-firmie-zasady" className={H2}>
            Dlaczego PRO-KOM
          </h2>
          <RulesBento rules={about.rules} className="mt-8" />
        </section>
      )}

      {slots.afterRules}

      {about.steps && about.steps.length > 0 && (
        <section
          id="wspolpraca"
          aria-labelledby="o-firmie-kroki"
          className={cx(CONTAINER, 'scroll-mt-28 py-16')}
          data-rail-section="Jak pracujemy"
          data-rail-icon="compass"
        >
          <h2 id="o-firmie-kroki" className={H2}>
            Jak to wygląda krok po kroku
          </h2>
          <Steps steps={about.steps} className="mt-8" />
        </section>
      )}

      {slots.afterSteps}

      <section
        id="linie"
        aria-labelledby="o-firmie-linie"
        className={cx(CONTAINER, 'scroll-mt-28 py-16')}
        data-rail-section="Linie"
        data-rail-icon="grid"
      >
        <h2 id="o-firmie-linie" className={H2}>
          {lineCount} {plural(lineCount, ['linia', 'linie', 'linii'])}
          {gaming ? ' i marka PRO-KOM Gaming' : ' PRO-KOM'}
        </h2>
        <FamilyStrip lines={lines} current={line} className="mt-8" />
      </section>

      {showVerify && about.verify && about.verify.length > 0 && (
        <section
          id="sprawdz"
          aria-labelledby="o-firmie-sprawdz"
          className={cx(CONTAINER, 'scroll-mt-28 py-16')}
          data-rail-section="Sprawdź nas"
          data-rail-icon="shield"
        >
          <h2 id="o-firmie-sprawdz" className={H2}>
            Nie musisz wierzyć nam na słowo
          </h2>
          <VerifyCards items={about.verify} className="mt-8" />
        </section>
      )}

      {slots.beforeVisit}

      {address && where && (
        <section
          id="wizyta"
          aria-labelledby="o-firmie-wizyta"
          className={cx(CONTAINER, 'scroll-mt-28 py-16')}
          data-rail-section="Wizyta"
          data-rail-icon="pin"
        >
          <div className="grid overflow-hidden rounded-[30px] min-[1000px]:grid-cols-2">
            <div className="relative isolate flex flex-col gap-5 overflow-hidden bg-line-dark p-8 text-line-dark-text min-[768px]:p-10">
              <Contours />
              <h2
                id="o-firmie-wizyta"
                className="font-display text-[clamp(28px,3vw,40px)] leading-tight font-extrabold text-line-dark-ink"
              >
                Wpadnij do nas — {address.street}, {address.city}.
              </h2>
              {about.visitText && <p className="max-w-[48ch]">{about.visitText}</p>}
              <div className="mt-auto flex flex-wrap gap-3">
                {company.mapsUrl && (
                  <a
                    href={company.mapsUrl}
                    target="_blank"
                    rel="noopener"
                    className={cx(
                      'inline-flex min-h-12 items-center gap-2 rounded-[14px] bg-on-dark px-5 font-extrabold text-on-dark-ink',
                      FOCUS,
                    )}
                  >
                    <Icon name="pin" className="size-4" strokeWidth={2.2} />
                    Wyznacz trasę<span className="sr-only"> (Mapy Google, nowe okno)</span>
                  </a>
                )}
                <Link
                  href="/kontakt"
                  className={cx(
                    'inline-flex min-h-12 items-center gap-2 rounded-[14px] border-[1.5px] border-line-dark-rule px-5 font-extrabold text-line-dark-ink hover:bg-line-dark-current',
                    FOCUS,
                  )}
                >
                  Kontakt
                </Link>
              </div>
            </div>
            <AddressMap
              variant="dark"
              height={400}
              radius={0}
              label={{ title: 'PRO-KOM', text: where }}
              description={`Mapa: ${company.name}, ${where}`}
              // The route button sits next to it — one link to the map is enough.
              mapsUrl={null}
            />
          </div>
        </section>
      )}
    </div>
  )
}
