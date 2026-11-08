import Link from 'next/link'
import { connection } from 'next/server'

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
import { LevelCards } from '@/sites/software/components/pricing/LevelCards'
import { softwareTextContext } from '@/sites/software/components/textContext'
import { Glass } from '@/sites/software/components/ui/Glass'
import { PageHero } from '@/sites/software/components/ui/PageHero'
import { SectionHead } from '@/sites/software/components/ui/SectionHead'

import { AuditForm } from './AuditFormLazy'
import { AuditScanCard } from './AuditScanCardLazy'

type Props = { block: SwAuditFormData; tenantId: number; isFirst: boolean }

type LinkField = { label?: string | null; href?: string | null } | null | undefined
const linkOf = (link: LinkField) =>
  link?.label && link.href ? { label: link.label, href: link.href } : null

/**
 * `/audyt` of the Software line (ZMIANY-v24 §9.1, board `AU-audyt`): the subpage hero with the
 * quick audit form and the sample scan card, „Pięć rzeczy…” (the last card highlighted), the three
 * audit kinds and „Jak wygląda darmowy audyt”. Never cached: the form token carries the render
 * time. Prices and terms of the kinds from the tenant's published audit solution
 * (`Solutions.levels`); a missing one hides the section. A hero block: the H1 when first.
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
  const hasScan = reportRows.length > 0 && Boolean(block.reportTitle)
  const checks = block.checksTitle ? (block.checks ?? []) : []
  const steps = block.stepsTitle ? (block.steps ?? []) : []
  const ctaPrimary = linkOf(block.ctaPrimary)
  const ctaSecondary = linkOf(block.ctaSecondary)

  return (
    <>
      <PageHero
        level={isFirst ? 'h1' : 'h2'}
        id="formularz"
        className="scroll-mt-24"
        crumb="Darmowy audyt"
        eyebrow={fill(block.eyebrow) ?? ''}
        title={title}
        em={block.titleAccent}
        lead={lead}
        aside={
          hasScan && block.reportTitle ? (
            <AuditScanCard
              title={block.reportTitle}
              subtitle={block.reportSubtitle ?? null}
              badge={block.reportBadge ?? null}
              rows={reportRows.map((row) => ({
                icon: row.icon,
                title: row.title,
                text: row.text ?? null,
                status: row.status,
              }))}
            />
          ) : undefined
        }
      >
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
              contact: wizard?.send.contact.error ?? FIELD_MESSAGES.email,
              consent: wizard?.send.errors.consent ?? FIELD_MESSAGES.consent,
            }}
            formToken={issueFormToken(getEnv().PAYLOAD_SECRET)}
            scan={hasScan}
          />
        </div>
      </PageHero>

      {checks.length > 0 && block.checksTitle ? (
        <section aria-labelledby="sprawdzamy-h" className="v-sec">
          <div className="v-wrap flex flex-col gap-10">
            <SectionHead
              id="sprawdzamy-h"
              width="max-w-[900px]"
              eyebrow={block.checksEyebrow ?? ''}
              title={block.checksTitle}
              lead={fill(block.checksLead)}
            />
            <ul className="sw-checks">
              {checks.map((check, i) => {
                // The last card is the result (board: „Wynik: raport”, highlighted).
                const strong = i === checks.length - 1 && checks.length > 1
                return (
                  <Glass
                    as="li"
                    rise
                    key={check.id ?? check.title}
                    className={cx('sw-check', strong && 'sw-check-strong')}
                  >
                    <span aria-hidden="true" className="sw-check-icon">
                      <Icon name={check.icon} className="size-5" />
                    </span>
                    <h3>{check.title}</h3>
                    {check.text ? <p>{fill(check.text)}</p> : null}
                  </Glass>
                )
              })}
            </ul>
          </div>
        </section>
      ) : null}

      {plans.length > 0 && block.levelsTitle ? (
        <section id="rodzaje" aria-labelledby="rodzaje-h" className="v-sec">
          <div className="v-wrap flex flex-col gap-10">
            <SectionHead
              id="rodzaje-h"
              width="max-w-[900px]"
              eyebrow={block.levelsEyebrow ?? ''}
              title={block.levelsTitle}
              lead={fill(block.levelsLead)}
            />
            <LevelCards
              plans={plans}
              button={(plan) => {
                const button = buttons[plans.indexOf(plan)]
                return button ? { label: button.label, href: button.href } : null
              }}
            />
          </div>
        </section>
      ) : null}

      {steps.length > 0 && block.stepsTitle ? (
        <section aria-labelledby="kroki-h" className="v-sec">
          <div className="v-wrap flex flex-col gap-10">
            <SectionHead id="kroki-h" eyebrow={block.stepsEyebrow ?? ''} title={block.stepsTitle} />
            <ol className="sw-steps">
              {steps.map((step, i) => (
                <Glass as="li" rise key={step.id ?? step.title} className="sw-step">
                  <span aria-hidden="true" className="sw-step-no">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3>{step.title}</h3>
                  {step.text ? <p>{fill(step.text)}</p> : null}
                </Glass>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {block.ctaTitle ? (
        // `data-final-cta`: the page ends with its own CTA (spec. §6.0) — no footer band.
        <section data-final-cta aria-labelledby="audyt-cta-h" className="v-sec">
          <div className="v-wrap">
            <Glass featured className="sw-cta">
              <div className="max-w-[56ch]">
                <h2 id="audyt-cta-h" className="sw-h2 sw-cta-title">
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
                    data-motion="button"
                    className="inline-flex min-h-13 items-center justify-center rounded-full bg-button px-6 font-extrabold text-accent-ink"
                  >
                    {ctaPrimary.label}
                  </Link>
                ) : null}
                {ctaSecondary ? (
                  <Link
                    href={ctaSecondary.href}
                    data-motion="button-outline"
                    className="inline-flex min-h-13 items-center justify-center rounded-full border border-border bg-card px-6 font-extrabold"
                  >
                    {ctaSecondary.label}
                  </Link>
                ) : null}
              </div>
            </Glass>
          </div>
        </section>
      ) : null}
    </>
  )
}
