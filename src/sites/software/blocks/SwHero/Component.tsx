import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Emphasis } from '@/components/Emphasis'
import { Icon } from '@/components/ui/Icon'
import { getEnv } from '@/lib/env'
import { isIconName } from '@/lib/catalog/options'
import { getSoftwareFacts, getSoftwareHome } from '@/lib/software/data'
import { fillText, type TextContext } from '@/lib/software/facts'
import type { SwHeroBlock as SwHeroBlockData } from '@/payload-types'

import { HeroBuilder, type HeroModule } from './HeroBuilder'

type Props = { block: SwHeroBlockData; tenantId: number; isFirst?: boolean }

const BUTTON =
  'inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl px-6 text-base font-extrabold transition-shadow'

/**
 * Hero of the Software start page (spec. §4 pkt 1–2, board `Main`): eyebrow, H1 with the
 * gradient ending, lead, two buttons, response time and trust points on the left, „Twój system”
 * on the right (one column up to 1080 px), then the 4 intent tiles (2×2 without texts on a phone).
 * The H1 only when the block opens the page; otherwise an h2.
 */
export async function SwHeroBlock({ block, tenantId, isFirst = true }: Props) {
  const [facts, home] = await Promise.all([getSoftwareFacts(tenantId), getSoftwareHome(tenantId)])
  const context: TextContext = {
    tenantId,
    facts,
    prices: {},
    strict: getEnv().SITE_ENV === 'production',
  }
  const response = fillText(block.response, context)
  const modules: HeroModule[] = (home?.heroModules ?? []).map(([key, label, icon]) => ({
    key,
    label,
    icon,
  }))
  const Title = isFirst ? 'h1' : 'h2'
  const trust = block.trust ?? []
  const intents = block.intents ?? []

  return (
    <section id="start" className="relative overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-dots opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <Container wide className="relative">
        <div className="grid items-center gap-10 pt-8 pb-10 min-[640px]:pt-12 min-[1081px]:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] min-[1081px]:gap-12 min-[1081px]:pt-16">
          <div className="flex min-w-0 flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 text-sm font-extrabold text-ink-2">
              <i aria-hidden="true" className="size-2.5 rounded-full bg-ok ring-4 ring-surface-2" />
              {block.eyebrow}
            </span>
            <Title className="font-display text-[40px] font-extrabold leading-[0.98] tracking-tight min-[640px]:text-6xl min-[1081px]:text-[clamp(46px,4.7vw,68px)]">
              {block.title}
              {block.titleAccent && (
                <>
                  {' '}
                  <span className="text-grad-h1">{block.titleAccent}</span>
                </>
              )}
            </Title>
            <p className="max-w-[44ch] text-lg text-ink-2 min-[640px]:text-xl">
              <Emphasis text={block.lead} boldClassName="font-extrabold text-ink" />
            </p>
            <div className="flex w-full flex-col gap-2.5 min-[640px]:w-auto min-[640px]:flex-row min-[640px]:flex-wrap">
              <Link
                href={block.primary.href}
                className={cx(BUTTON, 'bg-button text-accent-ink shadow-raised hover:shadow-none')}
              >
                {block.primaryBadge && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 ring-1 ring-current/40 text-xs">
                    <Icon name="clock" strokeWidth={2.2} className="size-3.5" />
                    {block.primaryBadge}
                  </span>
                )}
                {block.primary.label}
                <Icon name="arrow" strokeWidth={2.2} className="size-4" />
              </Link>
              {block.secondary?.label && block.secondary.href && (
                <Link
                  href={block.secondary.href}
                  className={cx(
                    BUTTON,
                    'border-2 border-border bg-card text-ink hover:border-accent-line',
                  )}
                >
                  {block.secondary.label}
                </Link>
              )}
            </div>
            {response && (
              <p className="inline-flex items-center gap-2.5 font-bold text-ink">
                <i
                  aria-hidden="true"
                  className="size-2.5 rounded-full bg-ok ring-4 ring-surface-2"
                />
                <span>
                  <Emphasis text={response} boldClassName="font-extrabold" />
                </span>
              </p>
            )}
            {trust.length > 0 && (
              <ul className="flex flex-wrap gap-2 min-[640px]:gap-x-6 min-[640px]:gap-y-3">
                {trust.map((item) => (
                  <li
                    key={item.id ?? item.text}
                    className="flex items-center gap-2.5 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-4 text-sm font-bold text-ink-2 min-[640px]:border-0 min-[640px]:bg-transparent min-[640px]:p-0"
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-accent-soft text-accent-text">
                      {isIconName(item.icon) && <Icon name={item.icon} className="size-4" />}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {modules.length > 0 && <HeroBuilder modules={modules} />}
        </div>

        {intents.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 pb-10 min-[640px]:gap-4 min-[1081px]:grid-cols-4">
            {intents.map((intent) => (
              <li key={intent.id ?? intent.title}>
                <Link
                  href={intent.href}
                  className="group relative flex h-full flex-col gap-3 rounded-[22px] border border-border bg-card p-4 shadow-raised transition-transform hover:-translate-y-0.5 min-[640px]:p-5"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-11 place-items-center rounded-2xl text-white min-[640px]:size-13"
                    style={{ backgroundImage: `var(--grad-area-${intent.tone})` }}
                  >
                    {isIconName(intent.icon) && <Icon name={intent.icon} className="size-6" />}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute right-3 top-3 hidden size-8 place-items-center rounded-full bg-surface-2 text-ink min-[640px]:grid"
                  >
                    <Icon name="arrow" strokeWidth={2.4} className="size-4" />
                  </span>
                  <b className="font-display text-[15px] font-extrabold leading-snug min-[640px]:text-lg">
                    {intent.title}
                  </b>
                  <span className="hidden text-sm text-ink-2 min-[640px]:block">{intent.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  )
}
