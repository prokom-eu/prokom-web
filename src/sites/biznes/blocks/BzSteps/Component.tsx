import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { BzStepsBlock as BzStepsBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'
import { splitCommitment } from './commitment'

type Props = { block: BzStepsBlockData; tenantId: number }

const COMMITMENT_ICONS = ['clock', 'mail', 'cal', 'users'] as const

/**
 * „Jak pracujemy” (runda 1411, board `JakPracujemy.dc.html`): the axis 01–04 in one colour — the
 * circles on white, so the line never runs through the digits — over four cards with the icon,
 * the title, the text and the „Dostajesz” panel; no „Zajmuje się” and no initials. Under them the
 * navy bar „Tak pracujemy na co dzień” with the commitments and both numbers. Phone (§5): the axis
 * on the left with the cards under one another, the commitments 2 × 2 and both numbers at full
 * width.
 */
export async function BzStepsBlock({ block, tenantId }: Props) {
  const settings = await getSiteSettings(tenantId)
  const phones = [settings?.phone, settings?.phone2].flatMap((number) => {
    const href = number ? toTelHref(number) : null
    return number && href ? [{ number, href }] : []
  })
  const commitments = (block.guarantees ?? []).map((row) => ({
    id: row.id,
    ...splitCommitment(row.text),
  }))

  return (
    <section id="jak-pracujemy" aria-labelledby="jak-pracujemy-h" className="py-6 md:py-20">
      <Container wide>
        <SectionHead
          id="jak-pracujemy-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead}
          appOnPhone
        />
        <div className="relative mt-11 max-md:mt-5">
          {/* The axis: one colour, behind the circles (white rings keep it off the digits). */}
          <span
            aria-hidden="true"
            className="absolute top-6 right-[calc(12.5%-24px)] left-6 hidden h-[2px] rounded-full bg-linear-90 from-accent-text via-accent to-border min-[1080px]:block"
          />
          <span
            aria-hidden="true"
            className="absolute top-6 bottom-6 left-6 w-[2px] rounded-full bg-linear-180 from-accent-text via-accent to-border min-[1080px]:hidden"
          />
          <ol data-reveal-cards="" className="relative grid gap-5 min-[1080px]:grid-cols-4">
            {block.steps.map((step, i) => (
              <li
                key={step.id ?? i}
                className="flex flex-col gap-[22px] max-[1079px]:flex-row max-[1079px]:gap-4"
              >
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={cx(
                      'relative z-[1] flex size-12 items-center justify-center rounded-full font-display text-base font-extrabold font-stretch-115% shadow-[0_0_0_6px_var(--surface)]',
                      i === 0
                        ? 'bg-accent-text text-accent-ink'
                        : 'border-2 border-accent-text bg-surface text-accent-text',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {step.label && (
                    <span className="bg-surface px-2.5 text-[12px] font-extrabold tracking-[0.16em] text-accent-text uppercase max-[1079px]:hidden">
                      {step.label}
                    </span>
                  )}
                </div>
                <article className="relative grid flex-1 gap-4 overflow-hidden rounded-[26px] bg-card px-[26px] pt-7 pb-6 shadow-[0_18px_40px_-34px_var(--glow),inset_0_0_0_1px_var(--border)] transition-[translate,box-shadow] duration-300 min-[1080px]:grid-rows-[auto_96px_auto] motion-safe:hover:-translate-y-1 max-md:px-5 max-md:pt-5 max-md:pb-5">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-[22px] -right-2 font-display text-[120px] leading-none font-extrabold text-transparent font-stretch-120% [-webkit-text-stroke:1.5px_var(--border)] max-md:text-[88px]"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="relative flex items-center gap-3.5">
                    <span
                      aria-hidden="true"
                      className="flex size-[46px] shrink-0 items-center justify-center rounded-[14px] bg-accent-soft text-accent-text"
                    >
                      <Icon name={step.icon} className="size-[22px]" />
                    </span>
                    <h3 className="font-display text-[28px] leading-tight font-extrabold tracking-[-0.02em] font-stretch-112% max-md:text-[22px]">
                      <span className="sr-only">Krok {i + 1}: </span>
                      {step.title}
                    </h3>
                  </div>
                  <p className="relative text-[15px] leading-relaxed text-ink-2 min-[1080px]:text-[14.5px]">
                    {step.text}
                  </p>
                  {step.gets && (
                    <p className="relative flex min-h-[62px] flex-col justify-center gap-1.5 rounded-2xl bg-accent-soft px-4 py-3.5">
                      {block.getsLabel && (
                        <span className="text-[12px] font-extrabold tracking-[0.16em] text-accent-text uppercase">
                          {block.getsLabel}
                        </span>
                      )}
                      <span className="text-[15px] leading-snug font-bold text-ink min-[1080px]:text-[14px]">
                        {step.gets}
                      </span>
                    </p>
                  )}
                </article>
              </li>
            ))}
          </ol>
        </div>
        {commitments.length > 0 && (
          <div
            data-surface="dark"
            className="mt-8 grid gap-6 rounded-[26px] bg-surface-dark p-7 text-white max-md:mt-6 max-md:gap-5 max-md:p-5"
            data-commitments
          >
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
              <div>
                {block.commitmentsEyebrow && (
                  <p className="text-[12px] font-extrabold tracking-[0.16em] text-accent-on-dark uppercase">
                    {block.commitmentsEyebrow}
                  </p>
                )}
                {block.commitmentsHeading && (
                  <h3 className="mt-1.5 font-display text-[24px] leading-tight font-extrabold text-balance text-white font-stretch-112%">
                    {block.commitmentsHeading}
                  </h3>
                )}
              </div>
              {phones.length > 0 && (
                <ul className="flex flex-wrap gap-2.5 max-md:grid max-md:w-full max-md:grid-cols-1">
                  {phones.map((item, i) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className={cx(
                          'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 font-display text-[17px] font-extrabold whitespace-nowrap max-md:w-full',
                          i === 0
                            ? 'bg-white text-surface-dark'
                            : 'text-white shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--c-white)_30%,transparent)]',
                          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                        )}
                      >
                        <Icon name="phone" className="size-[18px]" />
                        {item.number}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <ul
              aria-label={
                block.commitmentsHeading || block.commitmentsEyebrow || 'Nasze zobowiązania'
              }
              className="grid grid-cols-2 gap-4 max-md:gap-x-3 min-[1080px]:grid-cols-4"
            >
              {commitments.map((item, i) => (
                <li key={item.id ?? i} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-on-dark max-md:size-8"
                  >
                    <Icon
                      name={COMMITMENT_ICONS[i % COMMITMENT_ICONS.length] ?? 'check'}
                      className="size-[18px]"
                    />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <b className="text-[16px] leading-snug font-extrabold text-white max-md:text-[15px]">
                      {item.title}
                    </b>
                    {item.note && (
                      <span className="text-[13.5px] leading-snug text-white/75">{item.note}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </section>
  )
}
