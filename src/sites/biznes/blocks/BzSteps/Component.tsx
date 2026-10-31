import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { BzStepsBlock as BzStepsBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'
import { TONE_ICON, type Tone } from '../../components/home/tones'
import { splitCommitment } from './commitment'

type Props = { block: BzStepsBlockData; tenantId: number }

/** Board `#s4-jak`: each step its colour (blue, violet, green, the fourth warm). */
const STEP_TONES: Tone[] = ['blue', 'violet', 'green', 'red']

const COMMITMENT_ICONS = ['clock', 'doc', 'check', 'phone'] as const

/**
 * „Jak pracujemy” (board v150 `#s4-jak`, K36 §1): four steps on a line — label, what happens,
 * who does it and what you get — then the navy bar „Nasze zobowiązania” with the phone. People
 * as initials, not photos (decision 15.10: no own photos on Biznes).
 */
export async function BzStepsBlock({ block, tenantId }: Props) {
  const settings = await getSiteSettings(tenantId)
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  const commitments = (block.guarantees ?? []).map((row) => ({
    id: row.id,
    ...splitCommitment(row.text),
  }))

  return (
    <section id="jak-pracujemy" aria-labelledby="jak-pracujemy-h" className="py-16 sm:py-24">
      <Container wide>
        <SectionHead
          id="jak-pracujemy-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead}
        />
        <div className="relative mt-12">
          {/* The line joining the step icons (desktop). */}
          <span
            aria-hidden="true"
            className="absolute top-[30px] right-[12.5%] left-[12.5%] hidden h-[2px] rounded-full bg-linear-90 from-tone-blue via-tone-green to-tone-red opacity-40 min-[1080px]:block"
          />
          <ol className="relative grid gap-4 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
            {block.steps.map((step, i) => {
              const tone = STEP_TONES[i % STEP_TONES.length] ?? 'blue'
              return (
                <li key={step.id ?? i} className="relative flex flex-col items-center">
                  <span
                    aria-hidden="true"
                    className={cx(
                      'relative z-[1] flex size-[60px] items-center justify-center rounded-[18px] bg-linear-145 text-white',
                      TONE_ICON[tone],
                    )}
                  >
                    <Icon name={step.icon} className="size-6" />
                    <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-surface-dark font-display text-[11px] font-extrabold text-white shadow-[0_0_0_3px_var(--surface)]">
                      {i + 1}
                    </span>
                  </span>
                  <div className="-mt-6 flex w-full flex-1 flex-col rounded-[22px] bg-card px-4 pt-10 pb-4 text-center shadow-[inset_0_0_0_1px_var(--border)]">
                    {step.roleNote && (
                      <p className="text-[11.5px] font-extrabold tracking-[0.1em] text-accent-text uppercase">
                        {step.roleNote}
                      </p>
                    )}
                    <h3 className="mt-1 font-display text-[22px] leading-tight font-extrabold">
                      <span className="sr-only">Krok {i + 1}: </span>
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{step.text}</p>
                    <div className="mt-auto flex flex-col gap-2 pt-4 text-left">
                      {step.role && (
                        <p className="flex items-center gap-2.5 rounded-xl bg-surface-2 px-3 py-2">
                          <span
                            aria-hidden="true"
                            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-card font-display text-[13px] font-extrabold text-accent-text"
                          >
                            {step.role.charAt(0).toUpperCase()}
                          </span>
                          <span className="flex flex-col">
                            <span className="text-[11.5px] text-ink-2">Zajmuje się</span>
                            <span className="text-[13.5px] font-extrabold text-ink">
                              {step.role}
                            </span>
                          </span>
                        </p>
                      )}
                      {step.gets && (
                        <p className="rounded-xl bg-accent-soft px-3 py-2.5 text-[13.5px] leading-snug font-bold text-ink">
                          {block.getsLabel && (
                            <span className="block text-[11px] font-extrabold tracking-[0.12em] text-accent-text uppercase">
                              {block.getsLabel}
                            </span>
                          )}
                          <span className="mt-0.5 flex gap-1.5">
                            <Icon
                              name="check"
                              strokeWidth={2.4}
                              className="mt-0.5 size-3.5 shrink-0 text-ok-text"
                            />
                            {step.gets}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
        {commitments.length > 0 && (
          <div
            data-surface="dark"
            className="mt-8 grid items-center gap-6 rounded-[26px] bg-surface-dark p-6 text-white min-[1080px]:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] sm:p-7"
          >
            <div>
              <p className="text-[12px] font-extrabold tracking-[0.12em] text-accent-on-dark uppercase">
                Nasze zobowiązania
              </p>
              <h3 className="mt-1.5 font-display text-[22px] leading-tight font-extrabold text-balance text-white">
                Tak pracujemy — nie tylko na&nbsp;stronie.
              </h3>
            </div>
            <ul className="grid gap-4 min-[640px]:grid-cols-2 min-[1240px]:grid-cols-4">
              {commitments.map((item, i) => (
                <li key={item.id ?? i} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10"
                  >
                    <Icon
                      name={COMMITMENT_ICONS[i % COMMITMENT_ICONS.length] ?? 'check'}
                      className="size-[18px]"
                    />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[15px] leading-snug font-extrabold text-white">
                      {item.title}
                    </span>
                    {item.note && (
                      <span className="text-[13px] leading-snug text-white/75">{item.note}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {phone && tel && (
              <a
                href={tel}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 font-extrabold text-surface-dark hover:underline"
              >
                <Icon name="phone" className="size-[18px]" />
                Zadzwoń
                <span className="sr-only">: {phone}</span>
              </a>
            )}
          </div>
        )}
      </Container>
    </section>
  )
}
