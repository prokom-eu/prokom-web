import Image from 'next/image'
import Link from 'next/link'

import { AddressMap } from '@/components/shared/AddressMap'
import type { AuthLogo } from '@/components/shared/CompanyCard'
import { Contours } from '@/components/shared/Contours'
import { HeadingText } from '@/components/shared/HeadingText'
import { OpeningStatus } from '@/components/shared/OpeningStatus'
import { PageCrumbs, type Crumb } from '@/components/shared/PageCrumbs'
import { PAGE_CONTAINER } from '@/components/shared/pageContainer'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'
import { serializeJsonLd } from '@/lib/seo/jsonLd'
import { FOUNDED, pageBreadcrumbsJsonLd } from '@/lib/shared/pages'
import type { SharedData } from '@/lib/shared/project'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref } from '@/lib/site/link'
import { BZ_H1, BZ_H2 } from '@/sites/biznes/typography'

import type { AboutBrand } from '@/lib/biznes/aboutBrands'

export type AboutAuth = AuthLogo & { slug: string; text: string; href: string | null }

type Props = {
  shared: SharedData
  origin: string
  now: string
  auth: readonly AboutAuth[]
  /** Optivendi („Partner”), COMEX („We współpracy”): their badge in the wall of other brands. */
  tagged: readonly (AboutBrand & { status: string })[]
  others: readonly AboutBrand[]
  /** All brands of the catalog (the „+ N marek” tile). */
  brandTotal: number
}

const FOCUS_DARK =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark-text'
const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text'
const KICKER =
  'flex items-center gap-2.5 text-[12px] font-extrabold tracking-[0.16em] text-accent-text uppercase before:h-0.5 before:w-[22px] before:bg-current'
const CARD =
  'rounded-[22px] bg-card shadow-[0_18px_40px_-34px_var(--glow),inset_0_0_0_1px_var(--border)] transition-[translate,box-shadow] duration-300 motion-safe:hover:-translate-y-1'

const BREADCRUMBS: readonly Crumb[] = [
  { name: 'Strona główna', path: '/' },
  { name: 'O firmie', path: '/o-firmie' },
]
const RULE_ICONS: IconName[] = ['check', 'phone', 'pin', 'cal']

/** „Tel” links of the line's numbers, the first is the main one. */
function phonesOf(line: SharedData['line']) {
  return [line.phone, line.phone2].flatMap((number) => {
    const href = number ? toTelHref(number) : null
    return number && href ? [{ number, href }] : []
  })
}

/**
 * `/o-firmie` of Biznes (runda 1411, board `OFirmie.dc.html`): the navy hero with the outlined
 * „2004”, both numbers and the company card (status, six fields, the four authorisations); four
 * numbers over its edge; „Dlaczego PRO-KOM” as a bento (the e-mail quote mock-up is decoration);
 * the brands — four authorisation cards and the wall of the other brands (Optivendi and COMEX with
 * their status badge, „+ N marek” to /marki); the steps on an axis; the five PRO-KOM lines; the
 * final call with the map. No CEIDG, no „Nie musisz wierzyć nam na słowo”. Every value from the
 * panel or the catalog (`shared`, `Partners`); the shared template stays as it is for the other
 * lines.
 */
export function BzAboutView({ shared, origin, now, auth, tagged, others, brandTotal }: Props) {
  const { company, lines } = shared
  const about = shared.line.about ?? {}
  const phones = phonesOf(shared.line)
  const address = company.address
  const where = address ? `${address.street}, ${address.postalCode} ${address.city}` : null
  const rules = about.rules ?? []
  const [firstRule, ...middle] = rules
  const lastRule = middle.length > 4 ? middle.pop() : undefined
  const steps = about.steps ?? []
  const lineCount = lines.filter((line) => line.kind === 'linia').length
  const clients = (about.stats ?? []).find((stat) => /klient/i.test(stat.label))
  const services = auth.filter((item) => item.status.endsWith('serwis'))
  const partners = auth.filter((item) => item.status.endsWith('partner'))
  const facts = [
    { value: FOUNDED.year, label: FOUNDED.label, icon: 'store' as IconName },
    ...(clients ? [{ value: clients.value, label: clients.label, icon: 'users' as IconName }] : []),
    ...(auth.length > 0
      ? [
          {
            value: `${services.length} + ${partners.length}`,
            label: `autoryzowane serwisy ${services.map((item) => item.name).join(' i ')}, partner ${partners.map((item) => item.name).join(' i ')}`,
            icon: 'shield' as IconName,
          },
        ]
      : []),
    {
      value: `${lineCount} linii`,
      label: 'w jednej firmie — od kas po strony i naprawy',
      icon: 'grid' as IconName,
    },
  ]
  const fields = [
    address && { label: 'Adres', value: address.street },
    { label: 'NIP', value: company.nip },
    phones[0] && { label: 'Telefon', value: phones[0].number, href: phones[0].href },
    phones[1] && { label: 'Drugi numer', value: phones[1].number, href: phones[1].href },
    shared.line.email && {
      label: 'E-mail',
      value: shared.line.email,
      href: `mailto:${shared.line.email}`,
    },
    company.hours.length > 0 && { label: 'Godziny', value: hoursSummary(company.hours) },
  ].filter((field): field is { label: string; value: string; href?: string } => Boolean(field))
  const wall = [...tagged, ...others].slice(0, 11)
  const more = Math.max(0, brandTotal - auth.length - wall.length)

  return (
    <div data-about-page>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(pageBreadcrumbsJsonLd(origin, BREADCRUMBS)),
        }}
      />

      {/* 1. Hero with the company card */}
      <section
        aria-labelledby="o-firmie-h1"
        className="relative isolate overflow-hidden bg-line-dark pt-10 pb-28 text-line-dark-text max-md:pb-10 min-[1000px]:pt-14"
      >
        <Contours />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-10 -right-8 -z-[1] font-display text-[clamp(160px,22vw,300px)] leading-none font-extrabold tracking-[-0.06em] text-transparent font-stretch-125% [-webkit-text-stroke:1px_var(--line-dark-rule)]"
        >
          {FOUNDED.year}
        </span>
        <div
          className={cx(
            PAGE_CONTAINER,
            'grid grid-cols-1 items-start gap-10 min-[1000px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]',
          )}
        >
          <div className="flex min-w-0 flex-col gap-5">
            <PageCrumbs items={BREADCRUMBS} onDark />
            <p className="inline-flex items-center gap-2 self-start rounded-full border border-line-dark-rule bg-line-dark-card px-4 py-1.5 text-sm font-bold text-line-dark-ink">
              <span aria-hidden="true" className="size-2 rounded-full bg-on-dark" />
              {company.name}
              {address && ` · ${address.city}`}, od&nbsp;{FOUNDED.year}
            </p>
            <h1 id="o-firmie-h1" className={cx(BZ_H1, 'text-line-dark-ink')}>
              <HeadingText text={about.h1 || 'O firmie'} />
            </h1>
            {about.lead && <p className="max-w-[56ch] text-lg">{about.lead}</p>}
            <div className="flex flex-wrap gap-3 max-md:grid max-md:grid-cols-1">
              {phones.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cx(
                    'inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] px-5 font-display text-[17px] font-extrabold whitespace-nowrap',
                    i === 0
                      ? 'bg-on-dark text-on-dark-ink'
                      : 'border-[1.5px] border-line-dark-rule text-line-dark-ink hover:bg-line-dark-current',
                    FOCUS_DARK,
                  )}
                >
                  <Icon name="phone" className="size-4" strokeWidth={2.2} />
                  {item.number}
                </a>
              ))}
              <a
                href="#wspolpraca"
                className={cx(
                  'inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] px-3 font-extrabold text-line-dark-ink underline-offset-4 hover:underline',
                  FOCUS_DARK,
                )}
              >
                Jak pracujemy ↓
              </a>
            </div>
          </div>

          <div
            className="flex flex-col gap-4 rounded-[28px] bg-card p-6 text-ink shadow-raised"
            data-company-card
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] font-extrabold tracking-[0.16em] text-accent-text uppercase">
                Wizytówka firmy
              </span>
              <OpeningStatus
                hours={company.hours}
                holidays={company.holidays}
                now={now}
                variant="pill"
              />
            </div>
            <b className="font-display text-[22px] leading-tight font-extrabold">{company.name}</b>
            <dl className="grid grid-cols-2 gap-2 max-[399px]:grid-cols-1">
              {fields.map((field) => (
                <div
                  key={field.label}
                  className="flex min-w-0 flex-col gap-0.5 rounded-2xl bg-surface-2 px-3.5 py-2.5"
                >
                  <dt className="text-[12px] font-bold text-ink-2">{field.label}</dt>
                  <dd className="min-w-0 text-[14.5px] font-extrabold">
                    {field.href ? (
                      <a
                        href={field.href}
                        className={cx(
                          'inline-flex min-h-6 items-center [overflow-wrap:anywhere] underline-offset-2 hover:underline',
                          field.href.startsWith('tel:') && 'whitespace-nowrap',
                          FOCUS,
                        )}
                      >
                        {field.value}
                      </a>
                    ) : (
                      field.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            {auth.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <p className="text-[12px] font-extrabold tracking-[0.16em] text-accent-text uppercase">
                  {about.authTitle || 'Autoryzacje i partnerstwa'}
                </p>
                <ul className="grid grid-cols-2 gap-2">
                  {auth.map((item) => (
                    <li
                      key={item.name}
                      className="flex flex-col items-start gap-1.5 rounded-xl border border-border bg-white px-3 py-2.5"
                      data-auth-logo
                    >
                      <Image
                        src={item.logo.url}
                        alt={item.name}
                        width={item.logo.width}
                        height={item.logo.height}
                        unoptimized
                        className="h-[18px] w-auto object-contain"
                      />
                      <span className="flex items-center gap-1 text-[12px] font-extrabold whitespace-nowrap text-[var(--c-biznes-tone-green-tag)]">
                        <Icon name="check" strokeWidth={2.8} className="size-3" />
                        {item.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Four numbers over the hero's edge */}
      <div className={cx(PAGE_CONTAINER, 'relative z-[1] -mt-14 max-md:mt-6')}>
        <ul
          className="grid gap-3 min-[600px]:grid-cols-2 min-[1080px]:grid-cols-4"
          data-stats-strip
        >
          {facts.map((fact, i) => (
            <li
              key={fact.label}
              className={cx(
                'flex flex-col gap-2 rounded-[22px] px-6 py-[22px] shadow-[0_26px_44px_-30px_var(--glow)]',
                i === 1
                  ? 'bg-accent-text text-accent-ink'
                  : 'bg-card shadow-[0_26px_44px_-30px_var(--glow),inset_0_0_0_1px_var(--border)]',
              )}
            >
              <span
                aria-hidden="true"
                className={cx(
                  'grid size-10 place-items-center rounded-xl',
                  i === 1 ? 'bg-white/16' : 'bg-accent-soft text-accent-text',
                )}
              >
                <Icon name={fact.icon} className="size-5" />
              </span>
              <b
                className={cx(
                  'mt-1.5 font-display text-[40px] leading-none font-extrabold tracking-[-0.03em] whitespace-nowrap font-stretch-112%',
                  i === 1 ? 'text-accent-ink' : 'text-accent-text',
                )}
              >
                {fact.value}
              </b>
              <span
                className={cx(
                  'text-[14px] leading-snug',
                  i === 1 ? 'text-accent-ink' : 'text-ink-2',
                )}
              >
                {fact.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Dlaczego PRO-KOM — bento */}
      {firstRule && (
        <section
          id="dlaczego"
          aria-labelledby="o-firmie-zasady"
          className={cx(PAGE_CONTAINER, 'scroll-mt-28 py-16')}
        >
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div className="flex flex-col gap-3">
              <p className={KICKER}>Dlaczego PRO-KOM</p>
              <h2 id="o-firmie-zasady" className={BZ_H2}>
                Sześć rzeczy, których możesz od nas oczekiwać.
              </h2>
            </div>
            <p className="max-w-[40ch] text-ink-2">
              Nie obiecujemy cudów. Obiecujemy konkretny sposób pracy, który sprawdza się u nas od{' '}
              {FOUNDED.year} roku.
            </p>
          </div>
          <div className="mt-8 grid gap-4 min-[1080px]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] min-[1080px]:grid-rows-2">
            <article className="relative isolate flex flex-col gap-3 overflow-hidden rounded-[26px] bg-line-dark p-7 text-line-dark-text min-[1080px]:row-span-2">
              <span className="font-display text-[15px] font-extrabold text-on-dark-text">01</span>
              <h3 className="font-display text-[28px] leading-tight font-extrabold text-line-dark-ink font-stretch-112%">
                {firstRule.title}
              </h3>
              {firstRule.text && <p>{firstRule.text}</p>}
              {/* The quote by e-mail as a picture: decoration, its content is in the text above. */}
              <div
                aria-hidden="true"
                className="bzo-float mt-auto self-start rounded-2xl bg-card p-4 text-ink shadow-raised"
              >
                <p className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent-text">
                    <Icon name="mail" className="size-4" />
                  </span>
                  <span className="flex flex-col">
                    <b className="text-[14px]">Wycena — kasa i program dla sklepu</b>
                    <span className="text-[12px] text-ink-2">od: {shared.line.email}</span>
                  </span>
                </p>
                <p className="mt-3 grid grid-cols-3 gap-3 text-[12px] text-ink-2">
                  <span>
                    <b className="text-ink">Zakres</b>
                    <br />3 pozycje
                  </span>
                  <span>
                    <b className="text-ink">Termin</b>
                    <br />
                    uzgodniony
                  </span>
                  <span>
                    <b className="text-ink">Bez zobowiązań</b>
                    <br />
                    decydujesz Ty
                  </span>
                </p>
              </div>
            </article>
            {middle.map((rule, i) => (
              <article key={rule.id ?? rule.title} className={cx(CARD, 'flex flex-col gap-2 p-6')}>
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden="true"
                    className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent-text"
                  >
                    <Icon name={RULE_ICONS[i] ?? 'check'} className="size-5" />
                  </span>
                  <span className="font-display text-[15px] font-extrabold text-ink-2">
                    {String(i + 2).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-display text-[20px] leading-tight font-extrabold">
                  {rule.title}
                </h3>
                {rule.text && <p className="text-[15px] leading-relaxed text-ink-2">{rule.text}</p>}
              </article>
            ))}
          </div>
          {lastRule && (
            <div className="relative mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 overflow-hidden rounded-[22px] bg-accent-soft px-7 py-5">
              <span className="font-display text-[15px] font-extrabold text-ink">06</span>
              <b className="font-display text-[20px] leading-tight font-extrabold">
                {lastRule.title}
              </b>
              {lastRule.text && <span className="text-ink-2">{lastRule.text}</span>}
            </div>
          )}
        </section>
      )}

      {/* 4. Brands */}
      {auth.length > 0 && (
        <section
          id="marki"
          aria-labelledby="o-firmie-marki"
          className={cx(PAGE_CONTAINER, 'scroll-mt-28 py-16')}
          data-about-brands
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-3">
              <p className={KICKER}>Autoryzacje i marki</p>
              <h2 id="o-firmie-marki" className={BZ_H2}>
                Marki, które sprzedajemy, wdrażamy i serwisujemy
              </h2>
            </div>
            <Link
              href="/marki"
              className={cx(
                'inline-flex min-h-11 items-center gap-2 font-extrabold text-accent-text hover:underline',
                FOCUS,
              )}
            >
              Wszystkie marki <Icon name="arrow" className="size-4" />
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-4 max-[479px]:gap-2.5 min-[1080px]:grid-cols-4">
            {auth.map((item) => (
              <li
                key={item.name}
                className={cx(CARD, 'flex min-w-0 flex-col gap-3 p-6 max-md:p-4 max-[479px]:p-3')}
              >
                <span className="flex h-12 items-center rounded-xl bg-white px-3">
                  <Image
                    src={item.logo.url}
                    alt={item.name}
                    width={item.logo.width}
                    height={item.logo.height}
                    unoptimized
                    className="h-6 w-auto object-contain"
                  />
                </span>
                <span className="flex items-center gap-1.5 text-[14px] font-extrabold whitespace-nowrap text-ok-text max-[479px]:text-[12px] max-[479px]:tracking-[-0.02em]">
                  <Icon
                    name={item.status.endsWith('serwis') ? 'shield' : 'check'}
                    className="size-4 shrink-0"
                    strokeWidth={2.4}
                  />
                  {item.status}
                </span>
                <span className="text-[14px] leading-snug text-ink-2">{item.text}</span>
              </li>
            ))}
          </ul>
          {wall.length > 0 && (
            <div className="mt-6 grid gap-5 rounded-[26px] bg-surface-2 p-6 min-[1080px]:grid-cols-[150px_minmax(0,1fr)] min-[1080px]:items-center">
              <p className="text-[12px] font-extrabold tracking-[0.16em] text-ink-2 uppercase">
                Pozostałe marki w ofercie
              </p>
              <ul
                className="grid grid-cols-3 gap-2.5 min-[1080px]:grid-cols-6"
                aria-label="Pozostałe marki w ofercie"
              >
                {wall.map((brand) => {
                  const status = 'status' in brand ? (brand as { status: string }).status : null
                  const tile = (
                    <>
                      <Image
                        src={brand.logo.url}
                        alt={brand.name}
                        width={brand.logo.width}
                        height={brand.logo.height}
                        unoptimized
                        className="bzo-logo max-h-7 w-auto max-w-[80%] object-contain"
                      />
                      {status && (
                        <span className="absolute top-1.5 right-1.5 rounded-md bg-surface-dark px-1.5 py-0.5 text-[11px] font-extrabold text-white">
                          {status}
                        </span>
                      )}
                    </>
                  )
                  const box =
                    'bzo-brand relative flex h-[76px] items-center justify-center rounded-2xl bg-white shadow-[inset_0_0_0_1px_var(--border)]'
                  return (
                    <li key={brand.slug}>
                      {brand.href ? (
                        <Link href={brand.href} className={cx(box, FOCUS)}>
                          {tile}
                        </Link>
                      ) : (
                        <span className={box}>{tile}</span>
                      )}
                    </li>
                  )
                })}
                {more > 0 && (
                  <li>
                    <Link
                      href="/marki"
                      className={cx(
                        'flex h-[76px] items-center justify-center rounded-2xl bg-accent-text px-2 text-center text-[14px] font-extrabold text-accent-ink',
                        FOCUS,
                      )}
                    >
                      + {more} marek →
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
          <p className="mt-3 text-[12px] text-ink-2">Logotypy należą do ich właścicieli.</p>
        </section>
      )}

      {/* 5. Steps */}
      {steps.length > 0 && (
        <section
          id="wspolpraca"
          aria-labelledby="o-firmie-kroki"
          className={cx(PAGE_CONTAINER, 'scroll-mt-28 py-16')}
        >
          <p className={KICKER}>Krok po kroku</p>
          <h2 id="o-firmie-kroki" className={cx(BZ_H2, 'mt-3')}>
            Jak to wygląda u Ciebie
          </h2>
          <ol className="relative mt-10 grid gap-5 min-[1080px]:grid-cols-4">
            <span
              aria-hidden="true"
              className="absolute top-7 right-[12.5%] left-7 hidden h-0.5 bg-border min-[1080px]:block"
            />
            <span
              aria-hidden="true"
              className="absolute top-7 bottom-7 left-7 w-0.5 bg-border min-[1080px]:hidden"
            />
            {steps.map((step, i) => (
              <li key={step.id ?? step.title} className="relative flex gap-4 min-[1080px]:flex-col">
                <span
                  aria-hidden="true"
                  className={cx(
                    'relative z-[1] grid size-14 shrink-0 place-items-center rounded-full font-display text-base font-extrabold',
                    i === 0
                      ? 'bg-accent-text text-accent-ink shadow-[0_0_0_8px_var(--accent-soft)]'
                      : 'border-2 border-border bg-surface text-accent-text',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className={cx(CARD, 'flex-1 p-5')}>
                  <h3 className="font-display text-[19px] leading-tight font-extrabold">
                    <span className="sr-only">Krok {i + 1}: </span>
                    {step.title}
                  </h3>
                  {step.text && <p className="mt-1.5 text-[15px] text-ink-2">{step.text}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 6. The PRO-KOM lines */}
      {lines.length > 0 && (
        <section
          id="linie"
          aria-labelledby="o-firmie-linie"
          className={cx(PAGE_CONTAINER, 'scroll-mt-28 py-16')}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-3">
              <p className={KICKER}>Jedna firma</p>
              <h2 id="o-firmie-linie" className={BZ_H2}>
                {lineCount} linii PRO-KOM
              </h2>
            </div>
            <p className="max-w-[40ch] text-ink-2">
              Każda linia ma swój zespół i swoją stronę. Ten sam adres, te same zasady.
            </p>
          </div>
          <ul
            className="-mx-4 mt-8 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] min-[1080px]:mx-0 min-[1080px]:grid min-[1080px]:grid-cols-5 min-[1080px]:overflow-visible min-[1080px]:px-0"
            data-family-strip
          >
            {lines
              .filter((line) => line.kind === 'linia')
              .map((line) => {
                const here = line.key === 'biznes'
                const body = (
                  <>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-[5px]"
                      style={{ background: line.color ?? 'var(--accent)' }}
                    />
                    <span className="flex items-start justify-between gap-2">
                      <span className="flex flex-col">
                        <b className="font-display text-[18px] font-extrabold">PRO-KOM</b>
                        <span className="text-[11px] font-extrabold tracking-[0.3em] text-ink-2 uppercase">
                          {line.name.replace(/^PRO-KOM\s*/i, '')}
                        </span>
                      </span>
                      {here && (
                        <span
                          className="rounded-full bg-accent-text px-2.5 py-1 text-[11px] font-extrabold text-accent-ink"
                          aria-current="page"
                        >
                          Jesteś tutaj
                        </span>
                      )}
                    </span>
                    {line.description && (
                      <span className="text-[14px] leading-snug text-ink-2">
                        {line.description}
                      </span>
                    )}
                    {line.domain && (
                      <span className="mt-auto text-[13px] font-extrabold text-ink">
                        {line.domain} ↗
                      </span>
                    )}
                  </>
                )
                const box = cx(
                  CARD,
                  'relative flex min-h-[200px] flex-col gap-3.5 overflow-hidden px-5 pt-6 pb-5',
                  here && 'bg-accent-soft',
                )
                return (
                  <li
                    key={line.key}
                    className="w-[78%] shrink-0 snap-start min-[600px]:w-[45%] min-[1080px]:w-auto"
                    data-family-line={line.key}
                  >
                    {line.url && !here ? (
                      <a href={line.url} className={cx(box, 'h-full', FOCUS)}>
                        {body}
                      </a>
                    ) : (
                      <span className={cx(box, 'h-full')}>{body}</span>
                    )}
                  </li>
                )
              })}
          </ul>
        </section>
      )}

      {/* 7. The final call with the map */}
      <section
        id="wizyta"
        aria-labelledby="o-firmie-wizyta"
        className={cx(PAGE_CONTAINER, 'scroll-mt-28 py-16')}
        data-talk-band
      >
        <div className="grid overflow-hidden rounded-[30px] min-[1000px]:grid-cols-2">
          <div className="relative isolate flex flex-col gap-5 overflow-hidden bg-line-dark p-8 text-line-dark-text min-[768px]:p-10">
            <Contours />
            <p className="text-[12px] font-extrabold tracking-[0.16em] text-on-dark-text uppercase">
              Porozmawiajmy
            </p>
            <h2 id="o-firmie-wizyta" className={cx(BZ_H2, 'text-line-dark-ink')}>
              Opowiedz, jak pracuje Twoja firma.
            </h2>
            <p className="max-w-[52ch]">
              Przyjedziemy albo zadzwonimy. Wycenę dostajesz na mailu, bez zobowiązań.
              {about.visitText && ` ${about.visitText}`}
            </p>
            <div className="grid gap-2.5 min-[480px]:grid-cols-2">
              {phones.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cx(
                    'inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] px-5 font-display text-[17px] font-extrabold whitespace-nowrap',
                    i === 0
                      ? 'bg-on-dark text-on-dark-ink'
                      : 'border-[1.5px] border-line-dark-rule text-line-dark-ink',
                    FOCUS_DARK,
                  )}
                >
                  <Icon name="phone" className="size-4" strokeWidth={2.2} />
                  {item.number}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/kontakt#formularz"
                className={cx(
                  'inline-flex min-h-11 items-center font-extrabold text-line-dark-ink underline underline-offset-4',
                  FOCUS_DARK,
                )}
              >
                Napisz do nas
              </Link>
              {company.mapsUrl && (
                <a
                  href={company.mapsUrl}
                  target="_blank"
                  rel="noopener"
                  className={cx(
                    'inline-flex min-h-11 items-center font-extrabold text-line-dark-ink underline underline-offset-4',
                    FOCUS_DARK,
                  )}
                >
                  Wyznacz trasę ↗<span className="sr-only"> (Mapy Google, nowe okno)</span>
                </a>
              )}
            </div>
          </div>
          {where && (
            <AddressMap
              height={420}
              mobileHeight={220}
              radius={0}
              label={{ title: 'PRO-KOM', text: where }}
              description={`Mapa: ${company.name}, ${where}`}
              mapsUrl={company.mapsUrl}
              routeLabel="Wyznacz trasę"
            />
          )}
        </div>
      </section>
    </div>
  )
}
