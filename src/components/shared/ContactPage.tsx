import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { serializeJsonLd } from '@/lib/seo/jsonLd'
import { formConsent } from '@/lib/shared/consent'
import { hourTiles, weekHours } from '@/lib/shared/hourTiles'
import { isIconName } from '@/lib/shared/icons'
import { lineSalons, pageBreadcrumbsJsonLd, PLACE_KIND_LABEL } from '@/lib/shared/pages'
import type { SharedData } from '@/lib/shared/project'
import { warsawWeekday } from '@/lib/site/hours'
import { toTelHref } from '@/lib/site/link'
import type { Line } from '@/lib/tenant/lines'

import { AddressMap } from './AddressMap'
import { ContactForm } from './ContactForm'
import { Contours } from './Contours'
import { FaqBlock } from './FaqBlock'
import { OpeningStatus } from './OpeningStatus'
import { OtherLines } from './OtherLines'
import { PageCrumbs, type Crumb } from './PageCrumbs'
import { PAGE_CONTAINER as CONTAINER } from './pageContainer'
import { ServiceAreaMap } from './ServiceAreaMap'
import { Steps } from './Steps'
import { AccentText, HeadingText } from './HeadingText'
import { TAP_AREA } from './tapArea'

/** The line's own sections in named places (spec §6.0) — the template never knows their content. */
export type ContactSlots = {
  /** Under the address card, e.g. the second salon (Instalacje). */
  heroAside?: ReactNode
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
}: ContactPageProps) {
  const { company, lines } = shared
  const data = shared.line
  const contact = data.contact ?? {}
  const salons = lineSalons(shared.salons, contact.salonKeys)
  const salon = salons[0] ?? null
  const hours = salon?.hours ?? company.hours
  const tel = data.phone ? toTelHref(data.phone) : null
  const consent = formConsent(company.consent)
  const where = salon ? `${salon.street}, ${salon.postalCode} ${salon.city}` : null
  const today = warsawWeekday(new Date(now))
  const tiles = hours.length && hoursLayout === 'tiles' ? hourTiles(hours, today) : []
  const week = hours.length && hoursLayout === 'week' ? weekHours(hours, today) : []
  const routes = contact.routes ?? []
  // The map drawing is of the office (Orkana 16B) and the route is `CompanyData.mapsUrl` — shown only
  // when the card is that salon; another first salon gets its address and hours without a map.
  const officeCard = salon !== null && salon.key === (shared.salons[0]?.key ?? null)
  const others = lines.filter((item) => item.key !== line)
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
            'grid items-start gap-10 min-[1000px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]',
          )}
        >
          <div className="flex flex-col gap-5">
            <PageCrumbs items={breadcrumbs} onDark />
            <div className="self-start">
              <OpeningStatus
                hours={hours}
                holidays={company.holidays}
                now={now}
                variant="pill"
                onDark
              />
            </div>
            <h1
              id="kontakt-h1"
              className="font-display text-[clamp(42px,6vw,74px)] leading-[0.95] font-extrabold tracking-[-0.03em] text-line-dark-ink"
            >
              <HeadingText text={contact.h1 || 'Kontakt'} />
            </h1>
            {contact.lead && <p className="max-w-[56ch] text-lg">{contact.lead}</p>}
            {tel && (
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
            {contact.facts && contact.facts.length > 0 && (
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
                    {company.name} · NIP {company.nip}
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
          className={cx(CONTAINER, 'scroll-mt-28 py-16')}
          data-rail-section="Sprawy"
          data-rail-icon="compass"
        >
          <h2 id="kontakt-sprawy" className={H2}>
            <AccentText text="Z czym **dzwonisz?**" emClass={headingEmClass} />
          </h2>
          {/* Three routes in a row; four (Biznes, plan 0611 §8.2) two by two, then in one row. */}
          <ul
            className={cx(
              'mt-8 grid gap-3',
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

      {showServiceArea && company.serviceZones.length > 0 && (
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
