import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { serializeJsonLd } from '@/lib/seo/jsonLd'
import { formConsent } from '@/lib/shared/consent'
import { dayTiles, hourTiles, weekHours } from '@/lib/shared/hourTiles'
import { isIconName } from '@/lib/shared/icons'
import { lineSalons, pageBreadcrumbsJsonLd, PLACE_KIND_LABEL } from '@/lib/shared/pages'
import type { SharedData } from '@/lib/shared/project'
import { warsawWeekday } from '@/lib/site/hours'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref } from '@/lib/site/link'
import type { Line } from '@/lib/tenant/lines'

import { AddressMap } from './AddressMap'
import { ContactForm } from './ContactForm'
import { Contours } from './Contours'
import { CopyEmail } from './CopyEmail'
import { FaqBlock } from './FaqBlock'
import { OpeningStatus } from './OpeningStatus'
import { OtherLines } from './OtherLines'
import { PageCrumbs, type Crumb } from './PageCrumbs'
import { PAGE_CONTAINER as CONTAINER } from './pageContainer'
import { ServiceAreaMap } from './ServiceAreaMap'
import { ServiceAreaRings } from './ServiceAreaRings'
import { Steps } from './Steps'
import { AccentText, HeadingText } from './HeadingText'
import { TAP_AREA } from './tapArea'

/** The line's own sections in named places (spec §6.0) — the template never knows their content. */
export type ContactSlots = {
  /** Under the address card, e.g. the second salon (Instalacje). */
  heroAside?: ReactNode
  /**
   * Under the hero's call buttons and facts, in the text column (hub 16.11: short notes there
   * keep both hero columns about as tall).
   */
  heroBelow?: ReactNode
  /** After „Z czym dzwonisz?”. */
  afterRoutes?: ReactNode
  /** Above the form fields, e.g. Software „Twój projekt”. */
  formPrefill?: ReactNode
  /**
   * The line's own form in place of the shared panel (Biznes: the home form, one component for
   * both pages). Only the content changes: the `#formularz` section with its scroll margin and
   * rail entry stays here (routes, `?temat=…#formularz` and CTAs scroll to it); `formPrefill` is
   * then the line's business. The slot brings its own H2.
   */
  form?: ReactNode
  /** Before „Dojazd i zasięg”. */
  afterForm?: ReactNode
  beforeFaq?: ReactNode
  /** Under the FAQ heading, e.g. Biznes „Masz listę pozycji z katalogu?” — shown with the FAQ,
   * which needs at least one answered question. */
  faqAside?: ReactNode
}

export type ContactPageProps = {
  shared: SharedData
  line: Line
  /** `https://prokombiznes.pl`, no trailing slash (breadcrumb addresses in JSON-LD). */
  origin: string
  /** ISO time of the render (opening status, „dziś”). */
  now: string
  /** Signed form time (`issueFormToken`, ADR-003). */
  formToken: string
  /** Default: home → Kontakt (`/kontakt`). */
  breadcrumbs?: readonly Crumb[]
  slots?: ContactSlots
  /** Optional sections (spec §6.0) — on by default. */
  showServiceArea?: boolean
  showOtherLines?: boolean
  /** The line's class for the highlighted word of the section H2s (Software: `sw-em`, AUDYT-0911
   * #1). Without it the H2s written here stay plain text. */
  headingEmClass?: string
  /** Hours in the address card: three tiles (default) or the seven days with „dziś” (Web-kontakt). */
  hoursLayout?: 'tiles' | 'week'
  /**
   * Top of the hero: `number` (default) — the big number and „Zadzwoń teraz”; `calls` (Biznes,
   * runda 1411 KontaktHero) — two equal call tiles (the line's phone and second phone), the facts
   * as one bar with „Kopiuj” at the e-mail, the card with seven day tiles. A line without a second
   * number gets one tile.
   */
  heroLayout?: 'number' | 'calls'
  /**
   * „Dojazd”: `search` (default) — the town field and the zone drawing; `rings` (Biznes, runda 1411
   * Obszar) — rings of 15 / 35 / 55 km with the towns at their true place (needs the salon's geo).
   */
  serviceArea?: 'search' | 'rings'
  /**
   * „Z czym dzwonisz?” on a phone (< 700 px): `cards` (default) — the big numbered cards; `chips`
   * (Biznes, audyt 15.11 P2-3) — one row of chips over the form, each the route's link
   * (`?temat=…#formularz`): the form's own topic choice repeats the cards, so the phone skips them.
   */
  routesOnPhone?: 'cards' | 'chips'
}

const H2 =
  'font-display text-[clamp(32px,3.8vw,48px)] leading-none font-extrabold tracking-[-0.025em]'
const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark-text'

/**
 * The Kontakt page of every line (spec §6.1, board „04 · Kontakt”): hero with the phone and the
 * address card, „Z czym dzwonisz?”, the form with next steps, service area, the other lines, FAQ.
 * Every text from the panel (`shared.contact`, `CompanyData`); the order of shared sections never
 * changes, a line adds its own in the slots and may switch off the optional ones (§6.0).
 */
export function ContactPage({
  shared,
  line,
  origin,
  now,
  formToken,
  breadcrumbs = [
    { name: 'Strona główna', path: '/' },
    { name: 'Kontakt', path: '/kontakt' },
  ],
  slots = {},
  showServiceArea = true,
  showOtherLines = true,
  headingEmClass,
  hoursLayout = 'tiles',
  heroLayout = 'number',
  serviceArea = 'search',
  routesOnPhone = 'cards',
}: ContactPageProps) {
  const { company, lines } = shared
  const data = shared.line
  const contact = data.contact ?? {}
  const salons = lineSalons(shared.salons, contact.salonKeys)
  const salon = salons[0] ?? null
  const hours = salon?.hours ?? company.hours
  const tel = data.phone ? toTelHref(data.phone) : null
  const calls = heroLayout === 'calls'
  // The first number there is the main tile (a line with only its second number still gets one).
  const callNumbers = [data.phone, data.phone2]
    .flatMap((number) => {
      const href = number ? toTelHref(number) : null
      return number && href ? [{ number, href }] : []
    })
    .map((item, i) => ({
      ...item,
      main: i === 0,
      label: i === 0 ? 'Numer główny' : 'Drugi numer',
    }))
  const consent = formConsent(company.consent)
  const where = salon ? `${salon.street}, ${salon.postalCode} ${salon.city}` : null
  const today = warsawWeekday(new Date(now))
  const tiles = hours.length && hoursLayout === 'tiles' && !calls ? hourTiles(hours, today) : []
  const week = hours.length && hoursLayout === 'week' && !calls ? weekHours(hours, today) : []
  const days = hours.length && calls ? dayTiles(hours, today) : []
  const routes = contact.routes ?? []
  const routeChips = routesOnPhone === 'chips'
  // The map drawing is of the office (Orkana 16B) and the route is `CompanyData.mapsUrl` — shown only
  // when the card is that salon; another first salon gets its address and hours without a map.
  const officeCard = salon !== null && salon.key === (shared.salons[0]?.key ?? null)
  const others = lines.filter((item) => item.key !== line)
  const ringsGeo = salon?.geo ?? company.geo
  // Rings need the salon's place; without it the line falls back to the town field.
  const areaMode = serviceArea === 'rings' && ringsGeo ? 'rings' : 'search'
  const jsonLd = pageBreadcrumbsJsonLd(origin, breadcrumbs)

  return (
    <div data-contact-page>
      <script
        type="application/ld+json"
        // Panel texts, serialized with `<` escaped (`serializeJsonLd`).
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <section
        aria-labelledby="kontakt-h1"
        className="relative isolate overflow-hidden bg-line-dark pt-10 pb-16 text-line-dark-text min-[1000px]:pt-14"
        data-rail-section="Kontakt"
        data-rail-icon="phone"
      >
        <Contours />
        <div
          className={cx(
            CONTAINER,
            // `grid-cols-1` = minmax(0, 1fr): below 1000 px the column must not grow to its widest
            // child (the status pill) — the section's `overflow-hidden` would clip it (audit 14.11).
            'grid grid-cols-1 items-start gap-10 min-[1000px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]',
          )}
        >
          <div className="flex min-w-0 flex-col gap-5">
            <PageCrumbs items={breadcrumbs} onDark />
            <div className="self-start">
              <OpeningStatus
                hours={hours}
                holidays={company.holidays}
                now={now}
                variant="pill"
                onDark
                pulse={calls}
              />
            </div>
            <h1
              id="kontakt-h1"
              className="font-display text-[clamp(42px,6vw,74px)] leading-[0.95] font-extrabold tracking-[-0.03em] text-line-dark-ink"
            >
              <HeadingText text={contact.h1 || 'Kontakt'} />
            </h1>
            {contact.lead && <p className="max-w-[56ch] text-lg">{contact.lead}</p>}
            {calls && (
              <CallsHero
                numbers={callNumbers}
                facts={contact.facts ?? []}
                hours={hours.length ? hoursSummary(hours) : null}
                responsePromise={data.responsePromise}
                writeCta={contact.writeCta}
              />
            )}
            {!calls && tel && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-extrabold tracking-[0.12em] text-on-dark-text uppercase">
                  Najszybciej — zadzwoń
                </span>
                <a
                  href={tel}
                  className={cx(
                    // One line down to 360 px (audit 08.11 §2 pkt 4): scales with the screen below ~510 px.
                    'font-display text-[min(8.6vw,clamp(44px,5vw,66px))] leading-none font-extrabold whitespace-nowrap text-line-dark-ink',
                    FOCUS,
                  )}
                >
                  {data.phone}
                </a>
              </div>
            )}
            {!calls && (
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
                    Zadzwoń teraz
                  </a>
                )}
                <a
                  href="#formularz"
                  className={cx(
                    'inline-flex min-h-12 items-center gap-2 rounded-[14px] border-[1.5px] border-line-dark-rule px-5 font-extrabold text-line-dark-ink hover:bg-line-dark-current',
                    FOCUS,
                  )}
                >
                  <Icon name="chat" className="size-4" strokeWidth={2.2} />
                  {contact.writeCta || 'Napisz do nas'}
                </a>
              </div>
            )}
            {!calls && contact.facts && contact.facts.length > 0 && (
              <ul className="mt-2 grid gap-px overflow-hidden rounded-[22px] border border-line-dark-rule bg-line-dark-rule min-[640px]:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
                {contact.facts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-3 bg-line-dark-card p-4">
                    <Icon
                      name={isIconName(fact.icon) ? fact.icon : 'check'}
                      className="mt-0.5 size-5 text-on-dark-text"
                    />
                    {/* Contact data never cut off (AUDYT-0811 #12): a long e-mail wraps. */}
                    <span className="flex min-w-0 flex-col [overflow-wrap:anywhere]">
                      <span className="text-xs font-bold text-line-dark-text">{fact.label}</span>
                      <FactValue kind={fact.kind} value={fact.value ?? ''} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {slots.heroBelow}
          </div>

          <div className="flex flex-col gap-4">
            {salon && where && (
              <div
                className="flex flex-col gap-5 rounded-[28px] bg-card p-4 text-ink shadow-raised"
                data-address-card
              >
                {officeCard && (
                  <AddressMap
                    height={290}
                    mobileHeight={108}
                    radius={22}
                    label={{ title: 'PRO-KOM', text: where }}
                    description={`Mapa: ${company.name}, ${where}`}
                    mapsUrl={company.mapsUrl}
                    routeLabel="Wyznacz trasę"
                  />
                )}
                <div className="flex flex-col gap-1 px-2">
                  <span className="text-xs font-extrabold tracking-[0.12em] text-accent-text uppercase">
                    {PLACE_KIND_LABEL[contact.placeKind ?? 'salon']} · {salon.city}
                  </span>
                  <b className="font-display text-xl font-extrabold">{salon.street}</b>
                  <span className="text-ink-2">
                    {salon.postalCode} {salon.city}
                  </span>
                </div>
                {tiles.length > 0 && (
                  <ul className="grid grid-cols-3 gap-2" aria-label="Godziny otwarcia">
                    {tiles.map((tile) => (
                      <li
                        key={tile.key}
                        className={cx(
                          'flex flex-col gap-0.5 rounded-2xl border p-3 text-sm',
                          tile.today ? 'border-accent-text bg-accent-soft' : 'border-border',
                        )}
                      >
                        <span className="font-bold">
                          {tile.label}
                          {tile.today && <span> · dziś</span>}
                        </span>
                        <span className="text-ink-2">{tile.value}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {days.length > 0 && (
                  <ul
                    className="grid grid-cols-7 gap-1.5"
                    aria-label="Godziny otwarcia"
                    data-day-tiles
                  >
                    {days.map((day) => (
                      <li
                        key={day.key}
                        aria-current={day.today ? 'date' : undefined}
                        className={cx(
                          'flex min-w-0 flex-col items-center gap-0.5 rounded-[11px] py-2',
                          day.today
                            ? 'bg-button text-accent-ink'
                            : day.compact
                              ? 'bg-surface-2 text-ink'
                              : 'border border-dashed border-border text-ink-2',
                        )}
                      >
                        <span className="sr-only">
                          {day.label}
                          {day.today && ' (dziś)'}: {day.value}
                        </span>
                        <b aria-hidden="true" className="text-[12px]">
                          {day.short}
                        </b>
                        <span
                          aria-hidden="true"
                          className="text-[11px] leading-tight tracking-[-0.02em] whitespace-nowrap tabular-nums"
                        >
                          {/* A closed day: a dash — „zamkn.” needed 10.5 px to fit seven tiles in
                              360 px (audyt 15.11 P2-5: nothing under 11 px; §4 says 12, the
                              seven tiles do not fit it); the full text is
                              in the label above for screen readers. */}
                          {day.compact ?? '—'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {week.length > 0 && (
                  <div className="px-2">
                    <table
                      className="w-full border-separate border-spacing-0 text-sm"
                      data-week-hours
                    >
                      <caption className="sr-only">Godziny otwarcia</caption>
                      <tbody>
                        {week.map((day) => {
                          const cell = cx('py-1.5', day.today && 'bg-accent-soft font-extrabold')
                          return (
                            <tr key={day.key} aria-current={day.today ? 'date' : undefined}>
                              <th
                                scope="row"
                                className={cx(
                                  cell,
                                  'rounded-l-xl pl-3 text-left',
                                  !day.today && 'font-semibold',
                                )}
                              >
                                {day.label}
                                {day.today && <span> · dziś</span>}
                              </th>
                              <td
                                className={cx(
                                  cell,
                                  'rounded-r-xl pr-3 text-right tabular-nums',
                                  day.value === 'nieczynne' ? 'text-ink-2' : 'font-bold',
                                )}
                              >
                                {day.value}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="flex flex-wrap justify-between gap-2 px-2 text-sm text-ink-2">
                  <span>
                    {company.name} · <span className="whitespace-nowrap">NIP {company.nip}</span>
                  </span>
                  {company.ceidgUrl && (
                    <a
                      href={company.ceidgUrl}
                      target="_blank"
                      rel="noopener"
                      className={cx(
                        'font-bold text-accent-text underline-offset-4 hover:underline',
                        TAP_AREA,
                      )}
                    >
                      Sprawdź w CEIDG →<span className="sr-only"> (nowe okno)</span>
                    </a>
                  )}
                </p>
              </div>
            )}
            {slots.heroAside}
          </div>
        </div>
      </section>

      {routes.length > 0 && (
        <section
          id="z-czym-dzwonisz"
          aria-labelledby="kontakt-sprawy"
          className={cx(CONTAINER, 'scroll-mt-28 py-16', routeChips && 'max-[699px]:py-6')}
          data-rail-section="Sprawy"
          data-rail-icon="compass"
        >
          <h2
            id="kontakt-sprawy"
            className={cx(H2, routeChips && 'max-[699px]:text-[26px] max-[699px]:leading-tight')}
          >
            <AccentText text="Z czym **dzwonisz?**" emClass={headingEmClass} />
          </h2>
          {routeChips && (
            <ul className="mt-4 -mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] min-[700px]:hidden">
              {/* A chip is the route's link itself, so it needs only the address (a card shows its
                  link with the CTA label). */}
              {routes
                .filter((route) => route.href)
                .map((route, i) => (
                  <li key={i} className="flex">
                    <a
                      href={route.href ?? undefined}
                      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-card px-4 text-[15px] font-bold whitespace-nowrap text-ink shadow-[inset_0_0_0_1.5px_var(--border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
                    >
                      {route.title}
                      <Icon name="arrow" className="size-4 text-accent-text" />
                    </a>
                  </li>
                ))}
            </ul>
          )}
          {/* Three routes in a row; four (Biznes, plan 0611 §8.2) two by two, then in one row. */}
          <ul
            className={cx(
              'mt-8 grid gap-3',
              routeChips && 'max-[699px]:hidden',
              routes.length === 4
                ? 'min-[700px]:grid-cols-2 min-[1200px]:grid-cols-4'
                : 'min-[900px]:grid-cols-3',
            )}
          >
            {routes.map((route, i) => {
              const accent = i === 0
              return (
                <li
                  key={i}
                  className={cx(
                    'flex min-h-[250px] flex-col gap-3 rounded-[28px] p-7',
                    accent ? 'bg-button text-accent-ink' : 'border border-border bg-card',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="font-display text-[64px] leading-none font-extrabold text-transparent"
                    style={{
                      WebkitTextStroke: `1.5px var(${accent ? '--accent-ink' : '--accent-text'})`,
                    }}
                  >
                    {i + 1}
                  </span>
                  <b className="font-display text-2xl font-extrabold">{route.title}</b>
                  {route.text && (
                    <span className={accent ? undefined : 'text-ink-2'}>{route.text}</span>
                  )}
                  {route.cta && route.href && (
                    <a
                      href={route.href}
                      className={cx(
                        'mt-auto inline-flex min-h-11 items-center justify-between gap-3 font-extrabold',
                        accent ? 'text-accent-ink' : 'text-accent-text',
                      )}
                    >
                      {route.cta}
                      <span
                        aria-hidden="true"
                        className={cx(
                          'flex size-10 items-center justify-center rounded-full',
                          accent ? 'bg-accent-ink/15' : 'bg-accent-soft',
                        )}
                      >
                        <Icon name="arrow" className="size-4" />
                      </span>
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {slots.afterRoutes}

      <section
        id="formularz"
        aria-labelledby={slots.form ? undefined : 'kontakt-formularz'}
        className={cx(CONTAINER, 'scroll-mt-28 py-16')}
        data-rail-section="Formularz"
        data-rail-icon="chat"
      >
        {slots.form ?? (
          <div className="grid overflow-hidden rounded-[30px] border border-border bg-card min-[1000px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className="relative isolate flex flex-col gap-5 overflow-hidden bg-line-dark p-8 text-line-dark-text min-[768px]:p-10">
              <Contours />
              <p className="text-xs font-extrabold tracking-[0.12em] text-on-dark-text uppercase">
                Formularz
              </p>
              <h2
                id="kontakt-formularz"
                className="font-display text-[clamp(28px,3vw,40px)] leading-tight font-extrabold text-line-dark-ink"
              >
                <HeadingText text={contact.formTitle || 'Napisz, oddzwonimy'} />
              </h2>
              {contact.nextSteps && contact.nextSteps.length > 0 && (
                <>
                  <p className="mt-4 text-xs font-extrabold tracking-[0.12em] text-on-dark-text uppercase">
                    Co dalej po wysłaniu
                  </p>
                  <Steps steps={contact.nextSteps} orientation="vertical" onDark />
                </>
              )}
            </div>
            <div className="p-6 min-[768px]:p-10">
              <ContactForm
                formToken={formToken}
                topics={contact.topics ?? []}
                placeholder={contact.placeholder}
                sendLabel={contact.sendLabel}
                responsePromise={data.responsePromise}
                consent={{ ...consent, privacyHref: company.legal.privacy }}
                zones={company.serviceZones}
                nextSteps={contact.nextSteps ?? []}
                line={line}
                prefill={slots.formPrefill}
              />
            </div>
          </div>
        )}
      </section>

      {slots.afterForm}

      {showServiceArea && company.serviceZones.length > 0 && areaMode === 'rings' && ringsGeo && (
        <section
          id="dojazd"
          aria-labelledby="kontakt-dojazd"
          className={cx(CONTAINER, 'scroll-mt-28 py-16')}
          data-rail-section="Dojazd"
          data-rail-icon="map"
        >
          <ServiceAreaRings
            zones={company.serviceZones}
            salon={{
              city: salon?.city ?? company.address?.city ?? '',
              street: salon?.street ?? company.address?.street ?? '',
              geo: ringsGeo,
            }}
            title={contact.mapTitle || 'Obszar działania'}
            lead={contact.mapLead}
            headingId="kontakt-dojazd"
            phones={callNumbers.map((item) => item.number)}
            headingEmClass={headingEmClass}
          />
        </section>
      )}

      {showServiceArea && company.serviceZones.length > 0 && areaMode === 'search' && (
        <section
          id="dojazd"
          aria-labelledby="kontakt-dojazd"
          className={cx(CONTAINER, 'scroll-mt-28 py-16')}
          data-rail-section="Dojazd"
          data-rail-icon="map"
        >
          <h2 id="kontakt-dojazd" className={H2}>
            {/* A light section: only a line with its own class gets the `<em>`. */}
            <AccentText text={contact.mapTitle || 'Dojazd i zasięg'} emClass={headingEmClass} />
          </h2>
          {contact.mapLead && <p className="mt-3 max-w-[60ch] text-ink-2">{contact.mapLead}</p>}
          <ServiceAreaMap
            zones={company.serviceZones}
            center={salon?.city ?? company.address?.city ?? ''}
            background={<Contours />}
            className="mt-6"
          />
        </section>
      )}

      {showOtherLines && others.length > 0 && (
        <section
          id="inne-linie"
          aria-labelledby="kontakt-linie"
          className={cx(CONTAINER, 'scroll-mt-28 py-16')}
          data-rail-section="Linie"
          data-rail-icon="grid"
        >
          <h2 id="kontakt-linie" className={H2}>
            <AccentText
              text="Inna sprawa? Każda linia ma **swój zespół.**"
              emClass={headingEmClass}
            />
          </h2>
          <OtherLines lines={lines} current={line} className="mt-8" />
        </section>
      )}

      {slots.beforeFaq}

      <FaqBlock
        id="pytania"
        eyebrow="Pytania"
        title="Zanim **zadzwonisz**"
        emClass={headingEmClass}
        items={contact.faq ?? []}
        aside={slots.faqAside}
      />
    </div>
  )
}

/** A fact's value: the line's e-mail or phone as a link, any other text as it is. */
function FactValue({ kind, value }: { kind: string; value: string }) {
  const href =
    kind === 'email'
      ? `mailto:${value}`
      : kind === 'phone' || kind === 'phone2'
        ? toTelHref(value)
        : null
  // An e-mail breaks after „@” when it must, not in the middle of the domain.
  const at = kind === 'email' ? value.indexOf('@') : -1
  return href ? (
    <a href={href} className={cx('font-bold text-line-dark-ink', FOCUS)}>
      {at > 0 ? (
        <>
          {value.slice(0, at + 1)}
          <wbr />
          {value.slice(at + 1)}
        </>
      ) : (
        value
      )}
    </a>
  ) : (
    <b className="text-line-dark-ink">{value}</b>
  )
}

type CallNumber = { label: string; number: string; href: string; main: boolean }
type Fact = NonNullable<NonNullable<SharedData['line']['contact']>['facts']>[number]

/**
 * The calls part of the Kontakt hero (runda 1411, KontaktHero): two equal call tiles (the main
 * one in the line's colour), the facts bar — e-mail with „Kopiuj”, the salon's hours, the line's
 * text facts — with labels over values that never wrap, and the line's promise with a link to
 * the form. Phone: tiles and bar rows one under another.
 */
/** Characters of an e-mail that still fit the first of three cells in one row. */
const LONG_EMAIL = 24

function CallsHero({
  numbers,
  facts,
  hours,
  responsePromise,
  writeCta,
}: {
  numbers: CallNumber[]
  facts: readonly Fact[]
  hours: string | null
  responsePromise: string | null
  writeCta?: string | null
}) {
  const email = facts.find((fact) => fact.kind === 'email' && fact.value)
  const texts = facts.filter((fact) => fact.kind === 'text' && fact.value)
  // A long address (kontakt@prokominstalacje.pl) gets the whole first row instead of being cut.
  const longEmail = (email?.value?.length ?? 0) > LONG_EMAIL
  const cells: { key: string; label: string; icon: string; node: ReactNode; wide?: boolean }[] = [
    ...(email?.value
      ? [
          {
            key: 'email',
            label: email.label,
            icon: email.icon ?? 'mail',
            node: <CopyEmail email={email.value} />,
            wide: true,
          },
        ]
      : []),
    ...(hours
      ? [
          {
            key: 'hours',
            label: 'Godziny',
            icon: 'clock',
            node: <b className="whitespace-nowrap text-line-dark-ink">{hours}</b>,
          },
        ]
      : []),
    ...texts.map((fact, i) => ({
      key: `text-${i}`,
      label: fact.label,
      icon: fact.icon ?? 'check',
      node: <b className="whitespace-nowrap text-line-dark-ink">{fact.value}</b>,
    })),
  ]
  return (
    <div className="flex flex-col gap-4" data-contact-calls>
      {numbers.length > 0 && (
        <>
          <span className="mt-1 text-xs font-extrabold tracking-[0.14em] text-on-dark-text uppercase">
            {numbers.length > 1
              ? 'Najszybciej — zadzwoń na którykolwiek numer'
              : 'Najszybciej — zadzwoń'}
          </span>
          <ul
            className={cx(
              'grid grid-cols-1 gap-3',
              numbers.length > 1 && 'min-[560px]:grid-cols-2',
            )}
          >
            {numbers.map((item) => (
              <li key={item.href} className="min-w-0">
                <a
                  href={item.href}
                  className={cx(
                    'call-tile flex min-h-[86px] items-center gap-4 rounded-[20px] border px-5 py-4',
                    item.main
                      ? 'border-transparent bg-button text-accent-ink shadow-raised'
                      : 'border-line-dark-rule bg-line-dark-card text-line-dark-ink hover:bg-line-dark-current',
                    FOCUS,
                  )}
                  data-call-tile={item.main ? 'main' : 'second'}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      'call-tile__icon flex size-[50px] shrink-0 items-center justify-center rounded-[15px]',
                      item.main ? 'bg-accent-ink/15' : 'bg-line-dark-current text-on-dark-text',
                    )}
                  >
                    <Icon name="phone" className="size-[22px]" strokeWidth={2} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-xs font-bold">{item.label}</span>
                    <b className="font-display text-[clamp(24px,7.4vw,30px)] leading-tight font-extrabold tracking-[-0.01em] whitespace-nowrap">
                      {item.number}
                    </b>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      {cells.length > 0 && (
        // A container query: the bar goes to one row only when its own box is wide enough for
        // the e-mail, hours and promise without wrapping (the hero column, not the window).
        <div className="@container">
          <ul
            className={cx(
              'grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-line-dark-rule bg-line-dark-rule',
              cells.length === 3 && !longEmail && '@[640px]:grid-cols-[1.5fr_1fr_0.8fr]',
              cells.length === 3 && longEmail && '@[520px]:grid-cols-2',
              cells.length === 2 && '@[520px]:grid-cols-2',
            )}
            data-contact-bar
          >
            {cells.map((cell) => (
              <li
                key={cell.key}
                className={cx(
                  'flex min-w-0 items-center gap-3 bg-line-dark-card px-4 py-3.5',
                  cell.wide && longEmail && cells.length === 3 && '@[520px]:col-span-2',
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-line-dark-current text-on-dark-text max-[399px]:hidden @min-[640px]:@max-[800px]:hidden"
                >
                  <Icon
                    name={isIconName(cell.icon) ? cell.icon : 'check'}
                    className="size-[18px]"
                  />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-px">
                  <span className="text-xs font-bold text-line-dark-text">{cell.label}</span>
                  {cell.node}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {responsePromise && (
        <p className="text-sm text-line-dark-text">
          {responsePromise}. Wolisz napisać?{' '}
          <a
            href="#formularz"
            className={cx(
              'font-extrabold text-line-dark-ink underline-offset-4 hover:underline',
              FOCUS,
              TAP_AREA,
            )}
          >
            {writeCta || 'Formularz zapytania'} ↓
          </a>
        </p>
      )}
    </div>
  )
}
