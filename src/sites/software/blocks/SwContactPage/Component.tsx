import Link from 'next/link'
import { connection } from 'next/server'
import type { CSSProperties } from 'react'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'
import { getEnv } from '@/lib/env'
import { SOFTWARE_CONTACT_MESSAGES } from '@/lib/inquiry/contactForm'
import { PRIVACY_POLICY_PATH } from '@/lib/inquiry/consent'
import { FIELD_MESSAGES } from '@/lib/inquiry/form'
import { issueFormToken } from '@/lib/inquiry/spam'
import { SOFTWARE_TOPIC_LABELS, type SoftwareTopic } from '@/lib/inquiry/types'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { openingStatus } from '@/lib/site/hours'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref } from '@/lib/site/link'
import { getSoftwareWizard, getSolutionsIndex } from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'
import type { ProjectSolution } from '@/lib/software/projectSummary'
import type { SwContactPageBlock as SwContactPageData } from '@/payload-types'
import { Breadcrumbs } from '@/sites/software/components/Breadcrumbs'
import { WandIcon } from '@/sites/software/components/FrameIcons'
import { softwareTextContext } from '@/sites/software/components/textContext'

import { ContactForm } from '../SwContact/ContactForm'
import { ContactHours } from './ContactHours'
import type { CONTACT_CHANNELS } from './config'

type ContactChannel = (typeof CONTACT_CHANNELS)[number]

type Props = { block: SwContactPageData; tenantId: number; isFirst: boolean }

const TOPIC_ICONS: Record<SoftwareTopic, IconName> = {
  strona: 'site',
  system: 'panel',
  mobile: 'phone',
  laczenie: 'plug',
  opieka: 'lifebuoy',
  audyt: 'search',
}

/** `/kontakt` names the app topic shorter than the e-mails do (board `Kontakt`). */
const TOPICS = (Object.keys(SOFTWARE_TOPIC_LABELS) as SoftwareTopic[]).map((value) => ({
  value,
  label: value === 'mobile' ? 'Aplikacja' : SOFTWARE_TOPIC_LABELS[value],
  icon: TOPIC_ICONS[value],
}))

const CHANNEL_ICONS: Record<ContactChannel, IconName> = {
  phone: 'phone',
  email: 'mail',
  salon: 'pin',
  online: 'monitor',
}

const eyebrowClass = 'text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text'
const h2Class =
  'font-display text-[32px] font-extrabold leading-[1.04] tracking-tight min-[641px]:text-[clamp(32px,3.6vw,52px)]'

/**
 * `/kontakt` of the Software line (spec. §6.10; board `Kontakt`, stany `kontakt-90…99c`).
 * Never cached: the form token carries the render time and the hours card its status. The form
 * is the page's final CTA (`data-final-cta`), the lines section hides the footer's line cards
 * (`data-lines-section`).
 */
export async function SwContactPageBlock({ block, tenantId, isFirst }: Props) {
  await connection()
  const [settings, wizard, context, company, index] = await Promise.all([
    getSiteSettings(tenantId),
    getSoftwareWizard(tenantId),
    softwareTextContext(tenantId),
    getCompanyData(),
    getSolutionsIndex(tenantId),
  ])
  const fill = (text: string | null | undefined) => (text ? fillText(text, context) : null)
  const title = fill(block.title)
  const lead = fill(block.lead)
  if (!title || !lead) return null

  const main = company?.locations[0] ?? null
  const status = main && main.hours.length > 0 ? openingStatus(main.hours, new Date()) : null
  const hoursCaption = main
    ? [hoursSummary(main.hours), fill(block.hoursNote)].filter(Boolean).join(' · ')
    : ''

  const phone = settings?.phone ?? null
  const email = settings?.email ?? null
  const channels = (block.channels ?? []).flatMap((channel, i) => {
    const value =
      channel.kind === 'phone'
        ? phone
        : channel.kind === 'email'
          ? email
          : (fill(channel.value) ??
            (channel.kind === 'salon' && main ? `${main.city}, ${main.street}` : null))
    if (!value) return []
    const href =
      channel.kind === 'phone'
        ? toTelHref(value)
        : channel.kind === 'email'
          ? `mailto:${value}`
          : (channel.href ?? null)
    return [
      {
        key: channel.id ?? String(i),
        kind: channel.kind,
        label: fill(channel.label),
        badge: fill(channel.badge),
        value,
        text: fill(channel.text),
        href,
      },
    ]
  })

  const steps = (block.steps ?? []).map((step) => ({
    key: step.id ?? step.title,
    when: fill(step.when),
    title: fill(step.title),
    text: fill(step.text),
  }))
  const shortcuts = (block.shortcuts ?? []).flatMap((shortcut) => {
    const label = fill(shortcut.title)
    return label ? [{ ...shortcut, title: label, text: fill(shortcut.text) }] : []
  })

  const solutions: ProjectSolution[] = index.solutions.map((solution) => ({
    slug: solution.slug,
    name: solution.name,
    category: solution.category,
    priceFrom: solution.priceFrom,
    priceMonthly: solution.priceMonthly,
    leadTime: solution.leadTime,
    thumbnail: solution.thumbnail,
    levels: solution.levels,
  }))

  const lines = block.linesTitle ? (block.lines ?? []) : []
  const places = (block.places ?? []).flatMap((place) => {
    const text = fill(place.text)
    return text ? [{ key: place.id ?? place.title, title: place.title, text }] : []
  })
  const linesMore =
    block.linesMore?.label && block.linesMore.href
      ? { label: block.linesMore.label, href: block.linesMore.href }
      : null

  const Heading = isFirst ? 'h1' : 'h2'

  return (
    <>
      <section className="pt-6 min-[641px]:pt-10">
        <Container wide>
          <Breadcrumbs current="Kontakt" />
          <div className="mt-3 grid gap-6 min-[1081px]:grid-cols-[minmax(0,1fr)_320px] min-[1081px]:items-end">
            <div>
              <p className={eyebrowClass}>{fill(block.eyebrow)}</p>
              <Heading className="mt-3 font-display text-[40px] font-extrabold leading-[1.02] tracking-tight min-[641px]:text-[clamp(44px,5vw,68px)]">
                {title}
                {block.titleAccent ? (
                  <>
                    {' '}
                    <span className="text-grad-h1">{block.titleAccent}</span>
                  </>
                ) : null}
              </Heading>
              <p className="mt-5 max-w-[62ch] text-lg text-ink-2 min-[641px]:text-xl">{lead}</p>
            </div>
            {main && status ? (
              <ContactHours hours={main.hours} initial={status} caption={hoursCaption} />
            ) : null}
          </div>
          {channels.length > 0 ? (
            <ul className="mt-7 grid grid-cols-2 gap-2.5 min-[1081px]:grid-cols-4 min-[1081px]:gap-3">
              {channels.map((channel, i) => {
                const strong = i === 0
                const content = (
                  <>
                    <span className="flex items-start justify-between gap-2">
                      <span
                        aria-hidden="true"
                        className={cx(
                          'inline-flex size-11 items-center justify-center rounded-[14px]',
                          strong ? 'bg-white/16' : 'bg-accent-soft text-accent-text',
                        )}
                      >
                        <Icon name={CHANNEL_ICONS[channel.kind]} className="size-5" />
                      </span>
                      {channel.badge ? (
                        <span
                          className={cx(
                            'rounded-full px-2.5 py-1 text-xs font-extrabold',
                            strong ? 'bg-white/16' : 'bg-accent-soft text-accent-text',
                          )}
                        >
                          {channel.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-auto flex flex-col gap-0.5 pt-4">
                      {channel.label ? (
                        <span
                          className={cx(
                            'text-xs font-extrabold uppercase tracking-[0.12em]',
                            strong ? 'text-white/80' : 'text-ink-2',
                          )}
                        >
                          {channel.label}
                        </span>
                      ) : null}
                      <b className="break-words font-display text-lg leading-tight min-[641px]:text-xl">
                        {channel.value}
                      </b>
                      {channel.text ? (
                        <span className={cx('text-sm', strong ? 'text-white/80' : 'text-ink-2')}>
                          {channel.text}
                        </span>
                      ) : null}
                    </span>
                  </>
                )
                const className = cx(
                  'flex h-full min-h-[180px] flex-col rounded-[22px] p-4 transition-transform active:scale-[0.98] motion-reduce:transition-none min-[641px]:p-5',
                  strong
                    ? 'bg-(image:--grad-say-no) text-white shadow-raised'
                    : 'bg-card shadow-[inset_0_0_0_1px_var(--border)]',
                )
                return (
                  <li key={channel.key}>
                    {channel.href ? (
                      <a href={channel.href} className={className}>
                        {content}
                      </a>
                    ) : (
                      <div className={className}>{content}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : null}
        </Container>
      </section>

      <section
        id="formularz"
        data-final-cta
        aria-labelledby="formularz-h"
        className="scroll-mt-24 py-10 min-[641px]:py-14"
      >
        <Container wide>
          <div className="grid overflow-hidden rounded-[26px] border border-border bg-card shadow-raised min-[641px]:rounded-[32px] min-[1081px]:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            {/* On the phone the form comes first, „Co dalej” after it (ZMIANY-v21 §10.5). */}
            <div className="order-1 px-[18px] py-[22px] min-[641px]:p-[clamp(24px,3.5vw,44px)] min-[1081px]:order-2">
              <p className={eyebrowClass}>{fill(block.formEyebrow)}</p>
              <h2
                id="formularz-h"
                className="mt-2 mb-5 font-display text-[30px] font-extrabold leading-[1.05] tracking-tight min-[641px]:text-[clamp(28px,2.8vw,40px)]"
              >
                {fill(block.formTitle)}
              </h2>
              <ContactForm
                texts={{
                  topicsLabel: block.topicsLabel,
                  messageLabel: block.messageLabel,
                  messagePlaceholder: block.messagePlaceholder ?? null,
                  nameLabel: block.nameLabel,
                  namePlaceholder: block.namePlaceholder ?? null,
                  contactLabel: block.contactLabel,
                  contactPlaceholder: block.contactPlaceholder ?? null,
                  submit: block.submit,
                  alternative: null,
                  alternativeLink: null,
                }}
                topics={TOPICS}
                // v21: no topic at first, optional (Krystian 31.10); „Twój projekt” sets it.
                initialTopic={null}
                errors={{
                  ...SOFTWARE_CONTACT_MESSAGES,
                  contact: wizard?.send.contact.any.error ?? FIELD_MESSAGES.email,
                  consent: wizard?.send.errors.consent ?? FIELD_MESSAGES.consent,
                }}
                formToken={issueFormToken(getEnv().PAYLOAD_SECRET)}
                page={{
                  solutions,
                  projectMessageLabel: block.projectMessageLabel,
                  projectMessagePlaceholder: block.projectMessagePlaceholder ?? null,
                  hintsLabel: block.hintsLabel ?? null,
                  hints: (block.hints ?? []).map(({ topic, text }) => ({ topic, text })),
                  contactHint: block.contactHint ?? null,
                  talkLabel: block.talkLabel,
                  submitNote: fill(block.submitNote),
                }}
              />
            </div>
            <aside
              aria-labelledby="co-dalej-h"
              className="order-2 flex flex-col gap-6 bg-surface-dark bg-[radial-gradient(ellipse_80%_50%_at_0%_0%,var(--glow),transparent_70%)] px-[18px] py-[26px] text-white min-[641px]:p-[clamp(28px,4vw,46px)] min-[1081px]:order-1"
            >
              <h2
                id="co-dalej-h"
                className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-accent-on-dark"
              >
                {fill(block.stepsTitle)}
              </h2>
              <ol className="flex flex-col">
                {steps.map((step, i) => (
                  <li
                    key={step.key}
                    className="relative grid grid-cols-[34px_1fr] gap-x-3.5 pb-6 last:pb-0"
                  >
                    {i < steps.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="absolute top-9 bottom-0 left-[16px] w-0.5 bg-accent-on-dark/40"
                      />
                    ) : null}
                    <span
                      aria-hidden="true"
                      className="inline-flex size-[34px] items-center justify-center rounded-full bg-button font-extrabold text-accent-ink shadow-[0_0_0_5px_var(--glow)]"
                    >
                      {i + 1}
                    </span>
                    <span className="flex flex-col gap-1">
                      {step.when ? (
                        <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-accent-on-dark">
                          {step.when}
                        </span>
                      ) : null}
                      <b className="text-lg leading-snug">{step.title}</b>
                      {step.text ? (
                        <span className="text-[14.5px] leading-relaxed text-white/80">
                          {step.text}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
              {shortcuts.length > 0 ? (
                <ul className="mt-auto flex flex-col gap-2.5 pt-4">
                  {shortcuts.map((shortcut) => (
                    <li key={shortcut.id ?? shortcut.href}>
                      <Link
                        href={shortcut.href}
                        className="grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-2xl bg-white/[0.07] px-3.5 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] transition-colors hover:bg-white/[0.12] active:scale-[0.99] motion-reduce:transition-none"
                      >
                        <span
                          aria-hidden="true"
                          className="inline-flex size-10 items-center justify-center rounded-xl bg-white/[0.1] text-accent-on-dark"
                        >
                          {shortcut.icon === 'wand' ? (
                            <WandIcon className="size-5" />
                          ) : (
                            <Icon name="search" className="size-5" />
                          )}
                        </span>
                        <span className="flex flex-col">
                          <b className="text-[15px]">{shortcut.title}</b>
                          {shortcut.text ? (
                            <span className="text-[13px] text-white/80">{shortcut.text}</span>
                          ) : null}
                        </span>
                        <Icon name="arrow" className="size-4 text-accent-on-dark" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </aside>
          </div>
        </Container>
      </section>

      {lines.length > 0 ? (
        <section data-lines-section aria-labelledby="linie-h" className="py-10 min-[641px]:py-14">
          <Container wide>
            <p className={eyebrowClass}>{block.linesEyebrow}</p>
            <h2 id="linie-h" className={cx(h2Class, 'mt-2 max-w-[24ch]')}>
              {block.linesTitle}
            </h2>
            {block.linesText ? (
              <p className="mt-4 max-w-[56ch] text-lg text-ink-2">{block.linesText}</p>
            ) : null}
            <ul className="-mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] min-[641px]:mx-0 min-[641px]:grid min-[641px]:grid-cols-3 min-[641px]:overflow-visible min-[641px]:p-0 min-[1081px]:grid-cols-5">
              {lines.map((card) => (
                <li
                  key={card.id ?? card.line}
                  className="shrink-0 basis-[78%] snap-start min-[641px]:basis-auto"
                >
                  <a
                    href={card.href}
                    style={
                      {
                        '--lc': `var(--c-${card.line})`,
                        '--line-text': `var(--c-${card.line}-text)`,
                      } as CSSProperties
                    }
                    className="relative flex h-full flex-col gap-3 rounded-[22px] border-t-4 border-(--lc) bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)] transition-transform active:scale-[0.99] motion-reduce:transition-none"
                  >
                    <span aria-hidden="true" className="flex flex-col items-start gap-1">
                      <b className="inline-flex items-center font-display text-xl leading-none font-extrabold">
                        PRO
                        <i className="mx-[0.05em] inline-block h-[0.16em] w-[0.36em] rounded-[1px] bg-(--lc)" />
                        KOM
                      </b>
                      <small className="flex items-center gap-2 text-xs font-extrabold tracking-[0.2em] text-ink">
                        <i className="inline-block h-0.5 w-10 bg-(--lc)" />
                        {card.label}
                      </small>
                    </span>
                    <span className="sr-only">PRO-KOM {card.label}: </span>
                    <span className="text-sm leading-relaxed text-ink-2">{card.text}</span>
                    <span className="line-ink mt-auto inline-flex min-h-11 items-center gap-1.5 text-sm font-extrabold">
                      {card.linkLabel}
                      {card.href.startsWith('http') ? (
                        <ExternalIcon />
                      ) : (
                        <Icon name="arrow" className="size-3.5" />
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            {linesMore ? (
              <Link
                href={linesMore.href}
                className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-extrabold hover:text-accent-text"
              >
                {linesMore.label}
                <Icon name="arrow" className="size-4" />
              </Link>
            ) : null}
          </Container>
        </section>
      ) : null}

      {block.meetTitle ? (
        <section
          id="gdzie"
          aria-labelledby="gdzie-h"
          className="scroll-mt-24 py-10 min-[641px]:py-14"
        >
          <Container
            wide
            className="grid gap-6 min-[1081px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
          >
            {block.mapHref ? (
              <MapMock
                href={block.mapHref}
                caption={block.mapCaption ?? null}
                navigate={block.navigateLabel ?? 'Nawiguj'}
                pin={
                  main
                    ? {
                        title: company?.name ?? '',
                        address: `${main.street}, ${main.postalCode} ${main.city}`,
                      }
                    : null
                }
              />
            ) : null}
            <div className="flex flex-col gap-4">
              <div>
                <p className={eyebrowClass}>{block.meetEyebrow}</p>
                <h2
                  id="gdzie-h"
                  className="mt-2 font-display text-[30px] font-extrabold leading-[1.05] tracking-tight min-[641px]:text-[clamp(28px,2.8vw,40px)]"
                >
                  {block.meetTitle}
                </h2>
              </div>
              {places.length > 0 ? (
                <ul className="grid gap-2.5 min-[641px]:grid-cols-2">
                  {places.map((place, i) => (
                    <li
                      key={place.key}
                      className={cx(
                        'flex flex-col gap-1 rounded-2xl bg-card px-4 py-3.5',
                        i === 0
                          ? 'shadow-[inset_0_0_0_1.5px_var(--accent)]'
                          : 'shadow-[inset_0_0_0_1px_var(--border)]',
                      )}
                    >
                      <b className="text-[15px]">{place.title}</b>
                      <span className="text-[13px] text-ink-2">{place.text}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {company ? (
                <div className="flex flex-col gap-1.5 rounded-[22px] bg-surface-2 p-5 shadow-[inset_0_0_0_1px_var(--border)]">
                  {block.companyTitle ? (
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent-text">
                      {block.companyTitle}
                    </p>
                  ) : null}
                  <b>{company.name}</b>
                  {main ? (
                    <span className="text-sm text-ink-2">
                      {main.street}, {main.postalCode} {main.city}
                    </span>
                  ) : null}
                  <span className="text-sm text-ink-2">
                    NIP {company.nip}
                    {block.companyNote ? ` · ${block.companyNote}` : ''}
                  </span>
                  <Link
                    href={PRIVACY_POLICY_PATH}
                    className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm font-extrabold text-accent-text"
                  >
                    Polityka prywatności
                    <Icon name="arrow" className="size-3.5" />
                  </Link>
                </div>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  )
}

/** „Opens another site” mark of a line card link (board `Kontakt`). */
function ExternalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-3.5"
    >
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  )
}

/**
 * Map mock-up with „Nawiguj” (spec. §6.10): a drawing in tokens (board `.gmaps`) and a plain
 * link to Google Maps — no embedded map, so no third-party cookies.
 */
function MapMock({
  href,
  caption,
  navigate,
  pin,
}: {
  href: string
  caption: string | null
  navigate: string
  pin: { title: string; address: string } | null
}) {
  return (
    <div className="relative min-h-[300px] overflow-hidden rounded-[26px] bg-(--map-land) shadow-[inset_0_0_0_1px_var(--border)] min-[641px]:min-h-[420px] min-[641px]:rounded-[30px]">
      <svg
        aria-hidden="true"
        viewBox="0 0 600 420"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
      >
        <rect width="600" height="420" className="fill-(--map-land)" />
        <path
          d="M-20 300 C 120 280 220 330 330 300 S 520 250 640 270"
          className="fill-none stroke-(--map-water) [stroke-linecap:round] [stroke-width:16]"
        />
        <g className="fill-none stroke-(--map-road)">
          <path d="M60 -10 L 140 440" strokeWidth="8" />
          <path d="M-10 120 L 610 170" strokeWidth="14" />
          <path d="M300 -10 C 290 120 330 220 310 440" strokeWidth="14" />
          <path d="M420 -10 L 470 440" strokeWidth="8" />
          <path d="M-10 380 L 610 340" strokeWidth="8" />
          <path d="M180 200 L 430 230" strokeWidth="8" />
        </g>
        <g className="fill-(--map-block)">
          <rect x="350" y="40" width="90" height="60" rx="6" />
          <rect x="90" y="190" width="70" height="80" rx="6" />
          <rect x="470" y="300" width="90" height="70" rx="6" />
        </g>
        <rect x="200" y="40" width="70" height="55" rx="6" className="fill-(--map-park)" />
      </svg>
      {caption ? (
        <span className="absolute top-3.5 left-3.5 rounded-full bg-card px-3 py-1.5 text-xs font-extrabold shadow-raised">
          {caption}
        </span>
      ) : null}
      {pin ? (
        <div className="absolute top-[40%] left-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center gap-2">
          <span className="rounded-xl bg-card px-3.5 py-2.5 text-center shadow-raised">
            <b className="block text-sm">{pin.title}</b>
            <span className="block text-xs text-ink-2">{pin.address}</span>
          </span>
          <span
            aria-hidden="true"
            className="size-5 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-(--map-pin)"
          />
        </div>
      ) : null}
      <a
        href={href}
        rel="noopener"
        target="_blank"
        className="absolute right-4 bottom-4 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-button px-5 font-extrabold text-accent-ink shadow-raised active:scale-[0.98] motion-reduce:transition-none"
      >
        <Icon name="pin" className="size-4" />
        {navigate}
        <span className="sr-only"> (Mapy Google, nowe okno)</span>
      </a>
    </div>
  )
}
