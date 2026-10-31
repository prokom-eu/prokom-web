import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { getSiteSettings } from '@/lib/site/data'
import { splitBold } from '@/lib/site/emphasis'
import { toTelHref } from '@/lib/site/link'
import { getSoftwareThanks } from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'
import { inquiryNumberParam } from '@/lib/software/pages'
import { Breadcrumbs } from '@/sites/software/components/Breadcrumbs'
import { SectionHead } from '@/sites/software/components/home/SectionHead'
import { SentProject } from '@/sites/software/components/SentProject'
import { softwareTextContext } from '@/sites/software/components/textContext'

import { requireLine } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const TITLE = 'Dziękujemy'

// After a form: personal, nothing to index, not in the sitemap (spec. §2, §6.11).
export const metadata: Metadata = {
  title: TITLE,
  robots: { index: false, follow: true },
}

function Bold({ text }: { text: string }) {
  return splitBold(text).map((part, index) =>
    part.bold ? (
      <strong key={index} className="text-ink">
        {part.text}
      </strong>
    ) : (
      <span key={index}>{part.text}</span>
    ),
  )
}

/**
 * `/dziekujemy?nr=PKS-…` — board `Dziekujemy` (spec. §6.11): a card with the number, the H1 and
 * „Co dalej”, then three cards „W tym czasie…”. Texts from `SoftwareSettings.thanks` with facts
 * and prices filled; no CTA band, no e-mail sentence, no KSeF (ZMIANY-v21 §9, §10.4).
 */
export default async function ThanksPage({ params, searchParams }: Props) {
  // The layout already guards; repeated here so the page never renders on its own.
  const tenant = await requireLine(params, 'software')
  const [thanks, context, settings, query] = await Promise.all([
    getSoftwareThanks(tenant.id),
    softwareTextContext(tenant.id),
    getSiteSettings(tenant.id),
    searchParams,
  ])
  if (!thanks) notFound()

  const fill = (value: string | undefined) => fillText(value, context)
  const number = inquiryNumberParam(query.nr)
  const steps = thanks.steps.map(fill).filter((step): step is string => Boolean(step))
  const tel = settings?.phone ? toTelHref(settings.phone) : null
  const hours = fill(thanks.hours)
  // On production a text with a missing fact is `null`: the element goes, the page keeps an H1.
  const title = fill(thanks.title) ?? TITLE
  const accent = fill(thanks.titleAccent)
  const lead = fill(thanks.lead)
  const stepsTitle = fill(thanks.stepsTitle)
  const urgent = fill(thanks.urgent)
  const cards = thanks.more.cards.flatMap((card) => {
    const text = fill(card.text)
    return text ? [{ ...card, text }] : []
  })

  return (
    // `data-final-cta`: no CTA band after a sent inquiry (spec. §3.4, SWR2).
    <div data-final-cta>
      <section className="pt-6 min-[641px]:pt-10">
        <Container wide>
          <Breadcrumbs current={TITLE} />
          <div className="mt-3 grid gap-6 rounded-[28px] border border-border bg-card p-[18px] shadow-raised min-[641px]:p-8 min-[1081px]:grid-cols-[minmax(0,1fr)_minmax(0,520px)] min-[1081px]:items-center min-[1081px]:gap-10 min-[1081px]:p-11">
            <div>
              <span
                aria-hidden="true"
                className="grid size-[60px] place-items-center rounded-full bg-ok text-white ring-[10px] ring-ok/15 min-[641px]:size-[68px]"
              >
                <Icon name="check" strokeWidth={2.6} className="size-7" />
              </span>
              {number ? (
                <p className="mt-5 inline-flex rounded-full border border-accent-line bg-accent-soft px-3.5 py-1.5 text-sm font-extrabold text-accent-text">
                  {thanks.numberLabel}&nbsp;<span data-testid="inquiry-number">{number}</span>
                </p>
              ) : null}
              <h1 className="mt-4 font-display text-[40px] font-extrabold leading-[1.02] tracking-tight min-[641px]:text-[clamp(44px,5vw,64px)]">
                {title}
                {accent ? (
                  <>
                    {' '}
                    <span className="text-grad-h1">{accent}</span>
                  </>
                ) : null}
              </h1>
              {lead ? (
                <p className="mt-4 max-w-[52ch] text-lg text-ink-2 min-[641px]:text-xl">{lead}</p>
              ) : null}
              <SentProject number={number} />
            </div>
            {stepsTitle && steps.length > 0 ? (
              <div className="rounded-[22px] bg-surface-2 p-[18px] min-[641px]:p-6">
                <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink-2">
                  {stepsTitle}
                </h2>
                <ol className="mt-4 flex flex-col gap-4">
                  {steps.map((step, index) => (
                    <li key={index} className="flex gap-3 text-ink-2">
                      <span
                        aria-hidden="true"
                        className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-sm font-extrabold text-accent-ink"
                      >
                        {index + 1}
                      </span>
                      <span>
                        <Bold text={step} />
                      </span>
                    </li>
                  ))}
                </ol>
                {tel && urgent && settings?.phone ? (
                  <p className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-border pt-4">
                    <Icon name="phone" className="size-4 self-center text-accent-text" />
                    <span>{urgent}</span>
                    <a
                      href={tel}
                      className="inline-flex min-h-11 items-center font-extrabold underline-offset-4 hover:underline"
                    >
                      {settings.phone}
                    </a>
                    {hours ? (
                      <span className="basis-full pl-6 text-sm text-ink-2">{hours}</span>
                    ) : null}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      {cards.length > 0 ? (
        <section className="py-14 min-[641px]:py-20">
          <Container wide>
            <SectionHead eyebrow={thanks.more.eyebrow} title={thanks.more.title} lead={null} />
            <ul className="mt-6 grid gap-3 min-[761px]:grid-cols-3">
              {cards.map((card, index) => {
                const strong = index === 0
                return (
                  <li key={card.href}>
                    <Link
                      href={card.href}
                      className={cx(
                        'flex h-full flex-col gap-3 rounded-[24px] p-[22px] transition-transform active:scale-[0.99]',
                        strong
                          ? 'bg-(image:--grad-say-no) text-white shadow-raised'
                          : 'border border-border bg-card',
                      )}
                    >
                      {card.icon ? (
                        <span
                          aria-hidden="true"
                          className={cx(
                            'grid size-12 place-items-center rounded-[14px]',
                            strong ? 'bg-white/16' : 'bg-accent-soft text-accent-text',
                          )}
                        >
                          <Icon name={card.icon} className="size-5" />
                        </span>
                      ) : null}
                      <h3 className="mt-2 font-display text-xl font-extrabold">{card.title}</h3>
                      <p className={strong ? 'text-white/90' : 'text-ink-2'}>{card.text}</p>
                      <span
                        className={cx(
                          'mt-auto pt-2 font-extrabold',
                          strong ? 'text-white' : 'text-accent-text',
                        )}
                      >
                        {card.cta}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Container>
        </section>
      ) : null}
    </div>
  )
}
