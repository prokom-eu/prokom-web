import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { SolutionCategory } from '@/lib/software/options'
import { cardPrice } from '@/lib/software/cardPrice'
import { getPricingSource } from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'
import { findLevelSolution, levelAccusative, levelPlans, pricingTabs } from '@/lib/software/pricing'
import { keepTogether } from '@/lib/software/price'
import type { SwPricingBlock as SwPricingData } from '@/payload-types'
import { Breadcrumbs } from '@/sites/software/components/Breadcrumbs'
import { LevelCards } from '@/sites/software/components/pricing/LevelCards'
import { softwareTextContext } from '@/sites/software/components/textContext'

import { PricingTable } from './PricingTable'

type Props = { block: SwPricingData; tenantId: number; isFirst: boolean }

const eyebrowClass = 'text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text'
const h2Class =
  'mt-2 font-display text-[32px] font-extrabold leading-[1.04] tracking-tight min-[641px]:text-[clamp(32px,3.6vw,52px)]'

type LinkField = { label?: string | null; href?: string | null } | null | undefined
const linkOf = (link: LinkField) =>
  link?.label && link.href ? { label: link.label, href: link.href } : null

/**
 * `/cennik` of the Software line (spec. §6.4, v22; board `Cennik`, stan `89b`). Everything with a
 * price comes from the tenant's published `Solutions`: a featured solution of another tenant or
 * a draft simply shows no card.
 */
export async function SwPricingBlock({ block, tenantId, isFirst }: Props) {
  const [{ solutions, display }, context] = await Promise.all([
    getPricingSource(tenantId),
    softwareTextContext(tenantId),
  ])
  const fill = (text: string | null | undefined) => (text ? fillText(text, context) : null)
  const count = String(solutions.length)
  const title = fill(block.title)
  if (!title) return null

  const names: Partial<Record<SolutionCategory, string>> = {}
  const notes: Partial<Record<SolutionCategory, string>> = {}
  for (const tab of block.tabs ?? []) {
    if (tab.label) names[tab.category] = tab.label
    const note = fill(tab.note)
    if (note) notes[tab.category] = note
  }
  const tabs = pricingTabs(solutions, display, names).map((tab) => ({
    ...tab,
    note: notes[tab.slug] ?? null,
  }))

  const featuredId = typeof block.featured === 'object' ? block.featured?.id : block.featured
  const featured = solutions.find((solution) => solution.id === featuredId) ?? null
  const featuredPrice = featured ? cardPrice(featured, display) : null

  const care = findLevelSolution(solutions, 'care')
  const audit = findLevelSolution(solutions, 'audit')
  const carePlans = care && block.careTitle ? levelPlans(care) : []
  const auditPlans = audit && block.auditTitle ? levelPlans(audit) : []
  const auditLink =
    block.auditButton && block.auditHref
      ? { label: block.auditButton, href: block.auditHref }
      : null

  const primary = linkOf(block.primary)
  const secondary = linkOf(block.secondary)
  const ctaPrimary = linkOf(block.ctaPrimary)
  const ctaSecondary = linkOf(block.ctaSecondary)
  const included = block.includedTitle ? (block.includedItems ?? []) : []
  const Heading = isFirst ? 'h1' : 'h2'

  return (
    <>
      <section className="pt-6 pb-10 min-[641px]:pt-10 min-[641px]:pb-16">
        <Container wide>
          <Breadcrumbs current="Cennik" />
          <div className="mt-3 grid gap-8 min-[1081px]:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] min-[1081px]:items-center">
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
              {block.lead ? (
                <p className="mt-5 max-w-[56ch] text-lg text-ink-2 min-[641px]:text-xl">
                  {fill(block.lead.replaceAll('{liczba}', count))}
                </p>
              ) : null}
              {primary || secondary ? (
                <div className="mt-7 flex flex-col gap-2.5 min-[641px]:flex-row">
                  {primary ? (
                    <Link
                      href={primary.href}
                      className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-button px-6 font-extrabold text-accent-ink shadow-raised active:scale-[0.98] motion-reduce:transition-none"
                    >
                      {primary.label}
                    </Link>
                  ) : null}
                  {secondary ? (
                    <Link
                      href={secondary.href}
                      className="inline-flex min-h-14 items-center justify-center rounded-2xl border-[1.5px] border-border bg-card px-6 font-extrabold active:scale-[0.98] motion-reduce:transition-none"
                    >
                      {secondary.label}
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
            {featured && featuredPrice ? (
              <div className="relative mx-auto w-full max-w-[420px] rounded-[26px] bg-card p-6 shadow-[inset_0_0_0_2px_var(--accent),var(--shadow)]">
                {block.featuredBadge ? (
                  <span className="absolute -top-3 left-6 rounded-full bg-button px-3 py-1 text-xs font-extrabold text-accent-ink">
                    {block.featuredBadge}
                  </span>
                ) : null}
                <p className="font-display text-xl font-extrabold">{featured.name}</p>
                <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
                  <b className="font-display text-[34px] font-extrabold leading-none text-accent-text">
                    {keepTogether(
                      [featuredPrice.head.before, featuredPrice.head.amount, 'zł']
                        .filter(Boolean)
                        .join(' '),
                    )}
                  </b>
                  <span className="text-sm font-bold text-ink-2">
                    {featuredPrice.head.after.replace(/^zł\s*/, '')}
                  </span>
                </p>
                <p className="mt-2 text-sm text-ink-2">Termin: {featuredPrice.term}</p>
                {(block.featuredPoints ?? []).length > 0 ? (
                  <ul className="mt-4 flex flex-col gap-2 text-[15px]">
                    {(block.featuredPoints ?? []).map((point) => (
                      <li key={point.id ?? point.text} className="flex items-start gap-2.5">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-ok/15 text-ok-text"
                        >
                          <Icon name="check" strokeWidth={3} className="size-3" />
                        </span>
                        {point.text}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      {tabs.length > 0 ? (
        <section aria-labelledby="cennik-h" className="py-10 min-[641px]:py-14">
          <Container wide className="flex flex-col gap-6">
            <div>
              {block.tableEyebrow ? <p className={eyebrowClass}>{block.tableEyebrow}</p> : null}
              <h2 id="cennik-h" className={h2Class}>
                {block.tableTitle}
              </h2>
            </div>
            <PricingTable tabs={tabs} />
          </Container>
        </section>
      ) : null}

      {carePlans.length > 0 ? (
        <section
          id="opieka"
          aria-labelledby="opieka-h"
          className="scroll-mt-24 py-10 min-[641px]:py-14"
        >
          <Container wide className="flex flex-col gap-6">
            <div className="max-w-[720px]">
              {block.careEyebrow ? <p className={eyebrowClass}>{block.careEyebrow}</p> : null}
              <h2 id="opieka-h" className={h2Class}>
                {block.careTitle}
              </h2>
              {block.careLead ? (
                <p className="mt-4 text-lg text-ink-2">{fill(block.careLead)}</p>
              ) : null}
            </div>
            <LevelCards
              plans={carePlans}
              note={block.careNote}
              button={(plan) =>
                plan.href
                  ? {
                      label: `${block.careButton ?? 'Zapytaj o opiekę'} ${levelAccusative(plan.name)} →`,
                      href: plan.href,
                    }
                  : null
              }
            />
          </Container>
        </section>
      ) : null}

      {auditPlans.length > 0 ? (
        <section
          id="audyt"
          aria-labelledby="audyt-h"
          className="scroll-mt-24 py-10 min-[641px]:py-14"
        >
          <Container wide className="flex flex-col gap-6">
            <div className="max-w-[720px]">
              {block.auditEyebrow ? <p className={eyebrowClass}>{block.auditEyebrow}</p> : null}
              <h2 id="audyt-h" className={h2Class}>
                {block.auditTitle}
              </h2>
              {block.auditLead ? (
                <p className="mt-4 text-lg text-ink-2">{fill(block.auditLead)}</p>
              ) : null}
            </div>
            <LevelCards plans={auditPlans} button={() => auditLink} />
          </Container>
        </section>
      ) : null}

      {included.length > 0 ? (
        <section aria-labelledby="w-cenie-h" className="py-10 min-[641px]:py-14">
          <Container wide className="flex flex-col gap-6">
            <div>
              {block.includedEyebrow ? (
                <p className={eyebrowClass}>{block.includedEyebrow}</p>
              ) : null}
              <h2 id="w-cenie-h" className={h2Class}>
                {block.includedTitle}
              </h2>
            </div>
            <ul className="grid gap-2.5 min-[641px]:grid-cols-2 min-[1081px]:grid-cols-4">
              {included.map((item) => (
                <li
                  key={item.id ?? item.title}
                  className="flex items-start gap-3 rounded-[20px] bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-ok text-white"
                  >
                    <Icon name="check" strokeWidth={3.2} className="size-3.5" />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <b className="text-[15px]">{item.title}</b>
                    {item.text ? <span className="text-sm text-ink-2">{item.text}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {block.ctaTitle ? (
        // `data-final-cta`: the page ends with its own CTA (spec. §6.0) — no footer band.
        <section data-final-cta aria-labelledby="cennik-cta-h" className="py-10 min-[641px]:py-14">
          <Container wide>
            <div className="flex flex-col gap-6 rounded-[30px] bg-linear-to-br from-accent-soft to-card p-6 shadow-[inset_0_0_0_1px_var(--accent-line)] min-[641px]:p-12 min-[1081px]:flex-row min-[1081px]:items-center min-[1081px]:justify-between">
              <div className="max-w-[56ch]">
                <h2
                  id="cennik-cta-h"
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
                    className={cx(
                      'inline-flex min-h-14 items-center justify-center rounded-2xl border-[1.5px] border-border bg-card px-6 font-extrabold active:scale-[0.98] motion-reduce:transition-none',
                    )}
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
