import Link from 'next/link'
import { connection } from 'next/server'
import type { CSSProperties } from 'react'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'
import { getEnv } from '@/lib/env'
import { publicImage } from '@/lib/media/public'
import { SOFTWARE_CONTACT_MESSAGES } from '@/lib/inquiry/contactForm'
import { FIELD_MESSAGES } from '@/lib/inquiry/form'
import { issueFormToken } from '@/lib/inquiry/spam'
import { SOFTWARE_TOPIC_LABELS, type SoftwareTopic } from '@/lib/inquiry/types'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { openingStatus } from '@/lib/site/hours'
import { closedDays, hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref } from '@/lib/site/link'
import { getSoftwareWizard, getSolutionsIndex } from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'
import type { ProjectSolution } from '@/lib/software/projectSummary'
import type { SwContactPageBlock as SwContactPageData } from '@/payload-types'
import { Breadcrumbs } from '@/sites/software/components/Breadcrumbs'
import { Photo } from '@/sites/software/components/about/Photo'
import { WandIcon } from '@/sites/software/components/FrameIcons'
import { softwareTextContext } from '@/sites/software/components/textContext'

import { ContactForm } from '../SwContact/ContactForm'
import { ContactHours } from './ContactHours'
import { OsmMap } from './OsmMap'
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
  const phone2 = settings?.phone2 ?? null
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
        // The second number goes first under the main one: „albo 788 986 074 · pn–pt…” (v23).
        text:
          [channel.kind === 'phone' && phone2 ? `albo ${phone2}` : null, fill(channel.text)]
            .filter(Boolean)
            .join(' · ') || null,
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
  const meetLead = fill(block.meetLead)
  const entranceCaption = block.entranceCaption ?? 'Tak wygląda wejście'
  const entranceImage = publicImage(block.entrancePhoto, tenantId)
  // Placeholder only off production (spec. §13 pkt 25), like the photos of `/o-firmie`.
  const entrance =
    entranceImage || !context.strict ? { image: entranceImage, caption: entranceCaption } : null
  const emailNote = fill((block.channels ?? []).find((c) => c.kind === 'email')?.text)
  // Data cards next to the map (v23): the names are labels of the data, like „NIP”.
  const facts = [
    main && main.hours.length > 0
      ? {
          label: 'Godziny',
          value: hoursSummary(main.hours),
          note: closedDays(main.hours),
          href: null,
        }
      : null,
    phone ? { label: 'Telefon', value: phone, note: phone2, href: toTelHref(phone) } : null,
    email ? { label: 'E-mail', value: email, note: emailNote, href: `mailto:${email}` } : null,
    company
      ? {
          label: block.companyTitle ?? 'Dane firmy',
          value: company.name,
          note: [`NIP ${company.nip}`, block.companyNote].filter(Boolean).join(' · '),
          href: null,
        }
      : null,
  ].filter((fact) => fact !== null)
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
                      <b
                        className={cx(
                          'break-words font-display leading-tight',
                          // A long address fits one line, like the board (v23).
                          channel.kind === 'email'
                            ? 'text-base min-[641px]:text-[17px]'
                            : 'text-lg min-[641px]:text-xl',
                        )}
                      >
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
                    ? 'bg-cta text-white shadow-raised'
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
              className="order-2 flex flex-col gap-6 bg-surface-dark px-[18px] py-[26px] text-white min-[641px]:p-[clamp(28px,4vw,46px)] min-[1081px]:order-1"
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
                      className="inline-flex size-[34px] items-center justify-center rounded-full bg-button font-extrabold text-accent-ink"
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
          <Container wide className="flex flex-col gap-6">
            <div className="flex max-w-[62ch] flex-col gap-2">
              <p className={eyebrowClass}>{block.meetEyebrow}</p>
              <h2
                id="gdzie-h"
                className="font-display text-[30px] font-extrabold leading-[1.05] tracking-tight min-[641px]:text-[clamp(32px,3.4vw,48px)]"
              >
                {block.meetTitle}
              </h2>
              {meetLead ? (
                <p className="text-base leading-relaxed text-ink-2 min-[641px]:text-lg">
                  {meetLead}
                </p>
              ) : null}
            </div>
            <div className="grid gap-4 min-[1081px]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
              {block.mapHref ? (
                <OsmMap
                  routeHref={block.mapHref}
                  routeLabel={block.navigateLabel ?? 'Wyznacz trasę'}
                  zoomLabel={block.mapZoomLabel ?? 'Powiększ mapę'}
                  label={
                    main
                      ? `Mapa: ${company?.name ?? ''}, ${main.street}, ${main.postalCode} ${main.city}`
                      : 'Mapa dojazdu'
                  }
                  pin={
                    main
                      ? {
                          eyebrow: block.mapCaption ?? null,
                          street: main.street,
                          city: `${main.postalCode} ${main.city}`,
                        }
                      : null
                  }
                />
              ) : null}
              <div className="flex flex-col gap-3">
                {entrance ? (
                  <div className="relative">
                    <Photo
                      photo={entrance}
                      sizes="(min-width: 1081px) 40vw, 100vw"
                      className="aspect-[16/10] w-full rounded-[26px]"
                    />
                    {entrance.image ? (
                      <span className="absolute bottom-3 left-3 rounded-xl bg-surface-dark/85 px-3 py-1.5 text-[13px] font-extrabold text-white">
                        {entrance.caption}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <ul className="grid gap-3 min-[641px]:grid-cols-2">
                  {facts.map((fact) => (
                    <li
                      key={fact.label}
                      className="flex flex-col gap-1 rounded-[20px] bg-card px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--border)]"
                    >
                      <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-accent-text">
                        {fact.label}
                      </span>
                      {fact.href ? (
                        <a
                          href={fact.href}
                          className="font-extrabold break-words hover:text-accent-text"
                        >
                          {fact.value}
                        </a>
                      ) : (
                        <b className="break-words">{fact.value}</b>
                      )}
                      {fact.note ? (
                        <span className="text-[13px] text-ink-2">{fact.note}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {places.length > 0 ? (
              <ul className="grid gap-2.5 min-[641px]:grid-cols-3">
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
