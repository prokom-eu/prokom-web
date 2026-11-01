import Link from 'next/link'
import { connection } from 'next/server'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { getEnv } from '@/lib/env'
import { AUDIT_URL_MESSAGE } from '@/lib/inquiry/auditForm'
import { SOFTWARE_CONTACT_MESSAGES } from '@/lib/inquiry/contactForm'
import { FIELD_MESSAGES } from '@/lib/inquiry/form'
import { issueFormToken } from '@/lib/inquiry/spam'
import { getPricingSource, getSoftwareWizard } from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'
import { findLevelSolution, levelPlans } from '@/lib/software/pricing'
import type { SwAuditFormBlock as SwAuditFormData } from '@/payload-types'
import { Breadcrumbs } from '@/sites/software/components/Breadcrumbs'
import { LevelCards } from '@/sites/software/components/pricing/LevelCards'
import { softwareTextContext } from '@/sites/software/components/textContext'

import { AuditForm } from './AuditForm'

type Props = { block: SwAuditFormData; tenantId: number; isFirst: boolean }

const eyebrowClass = 'text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text'
const h2Class =
  'mt-2 font-display text-[32px] font-extrabold leading-[1.04] tracking-tight min-[641px]:text-[clamp(32px,3.6vw,52px)]'

type LinkField = { label?: string | null; href?: string | null } | null | undefined
const linkOf = (link: LinkField) =>
  link?.label && link.href ? { label: link.label, href: link.href } : null

/**
 * `/audyt` of the Software line (spec. §6.5; board `Audyt`). Never cached: the form token carries
 * the render time. Prices and terms of the audit kinds from the tenant's published audit solution
 * (`Solutions.levels`); a missing one hides the section.
 */
export async function SwAuditFormBlock({ block, tenantId, isFirst }: Props) {
  await connection()
  const [{ solutions }, wizard, context] = await Promise.all([
    getPricingSource(tenantId),
    getSoftwareWizard(tenantId),
    softwareTextContext(tenantId),
  ])
  const fill = (text: string | null | undefined) => (text ? fillText(text, context) : null)
  const title = fill(block.title)
  const lead = fill(block.lead)
  if (!title || !lead) return null

  const audit = findLevelSolution(solutions, 'audit')
  const plans = audit && block.levelsTitle ? levelPlans(audit) : []
  const buttons = block.levelButtons ?? []
  const reportRows = block.reportTitle ? (block.reportRows ?? []) : []
  const checks = block.checksTitle ? (block.checks ?? []) : []
  const steps = block.stepsTitle ? (block.steps ?? []) : []
  const ctaPrimary = linkOf(block.ctaPrimary)
  const ctaSecondary = linkOf(block.ctaSecondary)
  const Heading = isFirst ? 'h1' : 'h2'

  return (
    <>
      <section
        id="formularz"
        className="scroll-mt-24 pt-6 pb-10 min-[641px]:pt-10 min-[641px]:pb-16"
      >
        <Container wide>
          <Breadcrumbs current="Darmowy audyt strony" />
          <div className="mt-3 grid gap-8 min-[1081px]:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] min-[1081px]:items-center">
            <div className="flex flex-col gap-6">
              <div>
                <p className={eyebrowClass}>{fill(block.eyebrow)}</p>
                <Heading className="mt-3 font-display text-[40px] font-extrabold leading-[1.02] tracking-tight min-[641px]:text-[clamp(44px,5vw,68px)]">
                  {title}
                  {block.titleAccent ? (
                    <>
                      {' '}
                      <span className="text-accent-text">{block.titleAccent}</span>
                    </>
                  ) : null}
                </Heading>
                <p className="mt-5 max-w-[56ch] text-lg text-ink-2 min-[641px]:text-xl">{lead}</p>
              </div>
              <div className="max-w-[580px]">
                <AuditForm
                  texts={{
                    label: fill(block.formLabel),
                    urlLabel: block.urlLabel,
                    urlPlaceholder: block.urlPlaceholder ?? null,
                    nameLabel: block.nameLabel,
                    namePlaceholder: block.namePlaceholder ?? null,
                    contactLabel: block.contactLabel,
                    contactPlaceholder: block.contactPlaceholder ?? null,
                    submit: block.submit,
                    submitNote: fill(block.submitNote),
                  }}
                  errors={{
                    url: AUDIT_URL_MESSAGE,
                    name: SOFTWARE_CONTACT_MESSAGES.name,
                    contact: wizard?.send.contact.any.error ?? FIELD_MESSAGES.email,
                    consent: wizard?.send.errors.consent ?? FIELD_MESSAGES.consent,
                  }}
                  formToken={issueFormToken(getEnv().PAYLOAD_SECRET)}
                />
              </div>
            </div>
            {reportRows.length > 0 ? (
              // A sample, not data: hidden from screen readers like the board's mock-ups.
              <div
                aria-hidden="true"
                className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-[26px] bg-card shadow-[inset_0_0_0_1px_var(--border),var(--shadow)]"
              >
                <div className="bg-(image:--grad-say-no) px-5 py-4 text-white">
                  <p className="font-display text-lg font-extrabold">{block.reportTitle}</p>
                  {block.reportSubtitle ? (
                    <p className="text-xs text-white/85">{block.reportSubtitle}</p>
                  ) : null}
                </div>
                {block.reportBadge ? (
                  <span className="absolute top-5 -right-9 rotate-45 bg-(--badge-warn) px-10 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-(--badge-warn-ink)">
                    {block.reportBadge}
                  </span>
                ) : null}
                <ul className="flex flex-col gap-2 p-5">
                  {reportRows.map((row) => (
                    <li
                      key={row.id ?? row.title}
                      className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-2xl bg-surface-2 px-3 py-2.5"
                    >
                      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
                        <Icon name={row.icon} className="size-4" />
                      </span>
                      <span>
                        <b className="block text-sm">{row.title}</b>
                        {row.text ? (
                          <span className="block text-[13px] text-ink-2">{row.text}</span>
                        ) : null}
                      </span>
                      <span
                        className={cx(
                          'rounded-lg px-2 py-1 text-xs font-extrabold text-ink',
                          row.status === 'good' ? 'bg-ok/20' : 'bg-warn/25',
                        )}
                      >
                        {row.status === 'good' ? 'dobrze' : 'do poprawy'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      {checks.length > 0 ? (
        <section aria-labelledby="sprawdzamy-h" className="py-10 min-[641px]:py-14">
          <Container wide className="flex flex-col gap-6">
            <div className="max-w-[760px]">
              {block.checksEyebrow ? <p className={eyebrowClass}>{block.checksEyebrow}</p> : null}
              <h2 id="sprawdzamy-h" className={h2Class}>
                {block.checksTitle}
              </h2>
              {block.checksLead ? (
                <p className="mt-4 max-w-[56ch] text-lg text-ink-2">{fill(block.checksLead)}</p>
              ) : null}
            </div>
            <ul className="grid gap-3 min-[641px]:grid-cols-2 min-[1081px]:grid-cols-3">
              {checks.map((check, i) => {
                const strong = i === checks.length - 1 && checks.length > 1
                return (
                  <li
                    key={check.id ?? check.title}
                    className={cx(
                      'flex items-start gap-3.5 rounded-[24px] p-4 min-[641px]:flex-col min-[641px]:p-6',
                      strong
                        ? 'bg-(image:--grad-say-no) text-white shadow-raised'
                        : 'bg-card shadow-[inset_0_0_0_1px_var(--border)]',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cx(
                        'inline-flex size-12 shrink-0 items-center justify-center rounded-[14px]',
                        strong ? 'bg-white/16' : 'bg-accent-soft text-accent-text',
                      )}
                    >
                      <Icon name={check.icon} className="size-5" />
                    </span>
                    <span className="flex flex-col gap-1.5 min-[641px]:gap-3">
                      <h3 className="font-display text-lg font-extrabold min-[641px]:text-xl">
                        {check.title}
                      </h3>
                      {check.text ? (
                        <p className={cx('text-[15px]', strong ? 'text-white/85' : 'text-ink-2')}>
                          {fill(check.text)}
                        </p>
                      ) : null}
                    </span>
                  </li>
                )
              })}
            </ul>
          </Container>
        </section>
      ) : null}

      {plans.length > 0 ? (
        <section
          id="rodzaje"
          aria-labelledby="rodzaje-h"
          className="scroll-mt-24 py-10 min-[641px]:py-14"
        >
          <Container wide className="flex flex-col gap-6">
            <div className="max-w-[720px]">
              {block.levelsEyebrow ? <p className={eyebrowClass}>{block.levelsEyebrow}</p> : null}
              <h2 id="rodzaje-h" className={h2Class}>
                {block.levelsTitle}
              </h2>
              {block.levelsLead ? (
                <p className="mt-4 text-lg text-ink-2">{fill(block.levelsLead)}</p>
              ) : null}
            </div>
            <LevelCards
              plans={plans}
              button={(plan) => {
                const button = buttons[plans.indexOf(plan)]
                return button ? { label: button.label, href: button.href } : null
              }}
            />
          </Container>
        </section>
      ) : null}

      {steps.length > 0 ? (
        <section aria-labelledby="kroki-h" className="py-10 min-[641px]:py-14">
          <Container wide className="flex flex-col gap-6">
            <div>
              {block.stepsEyebrow ? <p className={eyebrowClass}>{block.stepsEyebrow}</p> : null}
              <h2 id="kroki-h" className={cx(h2Class, 'max-w-[18ch]')}>
                {block.stepsTitle}
              </h2>
            </div>
            <ol className="grid gap-3 min-[1081px]:grid-cols-3">
              {steps.map((step, i) => (
                <li
                  key={step.id ?? step.title}
                  className="flex flex-col gap-1.5 rounded-[24px] bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)] min-[641px]:p-6"
                >
                  <span
                    aria-hidden="true"
                    className="font-display text-[34px] font-extrabold leading-none text-accent-text"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2 text-lg font-extrabold">{step.title}</h3>
                  {step.text ? <p className="text-[15px] text-ink-2">{fill(step.text)}</p> : null}
                </li>
              ))}
            </ol>
          </Container>
        </section>
      ) : null}

      {block.ctaTitle ? (
        // `data-final-cta`: the page ends with its own CTA (spec. §6.0) — no footer band.
        <section data-final-cta aria-labelledby="audyt-cta-h" className="py-10 min-[641px]:py-14">
          <Container wide>
            <div className="flex flex-col gap-6 rounded-[30px] bg-linear-to-br from-accent-soft to-card p-6 shadow-[inset_0_0_0_1px_var(--accent-line)] min-[641px]:p-12 min-[1081px]:flex-row min-[1081px]:items-center min-[1081px]:justify-between">
              <div className="max-w-[56ch]">
                <h2
                  id="audyt-cta-h"
                  className="font-display text-[30px] font-extrabold leading-tight min-[641px]:text-[40px]"
                >
                  {block.ctaTitle}
                </h2>
                {block.ctaText ? (
                  <p className="mt-3 text-lg text-ink-2">{fill(block.ctaText)}</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2.5 min-[641px]:flex-row min-[1081px]:shrink-0">
                {ctaPrimary ? (
                  <Link
                    href={ctaPrimary.href}
                    className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-button px-6 font-extrabold text-accent-ink shadow-raised active:scale-[0.98] motion-reduce:transition-none"
                  >
                    {ctaPrimary.label}
                  </Link>
                ) : null}
                {ctaSecondary ? (
                  <Link
                    href={ctaSecondary.href}
                    className="inline-flex min-h-14 items-center justify-center rounded-2xl border-[1.5px] border-border bg-card px-6 font-extrabold active:scale-[0.98] motion-reduce:transition-none"
                  >
                    {ctaSecondary.label}
                  </Link>
                ) : null}
              </div>
            </div>
          </Container>
        </section>
      ) : null}
    </>
  )
}
