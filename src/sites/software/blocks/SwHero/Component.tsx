import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Emphasis } from '@/components/Emphasis'
import { Icon } from '@/components/ui/Icon'
import { getEnv } from '@/lib/env'
import { isIconName } from '@/lib/catalog/options'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { getSoftwareFacts, getSoftwareHome } from '@/lib/software/data'
import { fillText, type TextContext } from '@/lib/software/facts'
import type { SwHeroBlock as SwHeroBlockData } from '@/payload-types'

import { HeroBuilder, type HeroModule } from './HeroBuilder'
import { HeroPanelCard } from './HeroPanelCard'

type Props = { block: SwHeroBlockData; tenantId: number; isFirst?: boolean }

const BUTTON =
  'inline-flex min-h-[52px] items-center justify-center gap-3 rounded-2xl px-3 text-[15px] font-extrabold transition-shadow min-[640px]:min-h-14 min-[640px]:px-6 min-[640px]:text-base'

/**
 * Hero of the Software start page (spec. §4 pkt 1–2, board `Main`): eyebrow, H1 with the
 * gradient ending, lead, two buttons, response time and trust points on the left, „Twój system”
 * on the right (one column up to 1080 px), then the 4 intent tiles. On a phone (< 640 px, v23
 * MOBILE-APLIKACJA §3a) its own layout: eyebrow as a pill, the accent on a new line, „Zadzwoń”
 * next to the second button, the card „Twoja Firma · panel” instead of „Twój system”, trust in
 * 3 columns and the intents as one list. The H1 only when the block opens the page.
 */
export async function SwHeroBlock({ block, tenantId, isFirst = true }: Props) {
  const [facts, home, settings] = await Promise.all([
    getSoftwareFacts(tenantId),
    getSoftwareHome(tenantId),
    getSiteSettings(tenantId),
  ])
  const tel = settings?.phone ? toTelHref(settings.phone) : null
  const panel = home?.sections?.heroPanel
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
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-extrabold text-ink-2 min-[640px]:border-0 min-[640px]:bg-transparent min-[640px]:p-0">
              <i aria-hidden="true" className="size-2.5 rounded-full bg-ok ring-4 ring-surface-2" />
              {block.eyebrow}
            </span>
            <Title className="font-display text-[clamp(34px,10.4vw,42px)] font-extrabold leading-[1.02] tracking-tight min-[640px]:text-6xl min-[640px]:leading-[0.98] min-[1081px]:text-[clamp(46px,4.7vw,68px)]">
              {block.title}
              {block.titleAccent && (
                <>
                  {' '}
                  <span className="mt-1 block text-grad-h1 min-[640px]:mt-0 min-[640px]:inline">
                    {block.titleAccent}
                  </span>
                </>
              )}
            </Title>
            <p className="max-w-[44ch] text-base leading-relaxed text-ink-2 min-[640px]:text-xl">
              <Emphasis text={block.lead} boldClassName="font-extrabold text-ink" />
            </p>
            <div className="grid w-full grid-cols-2 gap-2 min-[640px]:flex min-[640px]:w-auto min-[640px]:flex-wrap min-[640px]:gap-2.5">
              <Link
                href={block.primary.href}
                className={cx(
                  BUTTON,
                  'col-span-2 bg-button text-accent-ink shadow-raised hover:shadow-none',
                )}
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
                    // Alone on its row of the phone grid when the line has no phone.
                    !tel && 'col-span-2',
                  )}
                >
                  {block.secondary.label}
                </Link>
              )}
              {tel && (
                <a
                  href={tel}
                  className={cx(
                    BUTTON,
                    'border-2 border-border bg-card text-ink min-[640px]:hidden',
                  )}
                >
                  <Icon name="phone" className="size-[18px]" />
                  Zadzwoń
                </a>
              )}
            </div>
            {response && (
              <p className="hidden items-center gap-2.5 font-bold text-ink min-[640px]:inline-flex">
                <i
                  aria-hidden="true"
                  className="size-2.5 rounded-full bg-ok ring-4 ring-surface-2"
                />
                <span>
                  <Emphasis text={response} boldClassName="font-extrabold" />
                </span>
              </p>
            )}
            {panel && <HeroPanelCard panel={panel} />}
            {trust.length > 0 && (
              <ul className="grid w-full grid-cols-3 gap-1.5 rounded-[18px] bg-card px-1.5 py-3 ring-1 ring-border ring-inset min-[640px]:flex min-[640px]:w-auto min-[640px]:flex-wrap min-[640px]:gap-x-6 min-[640px]:gap-y-3 min-[640px]:bg-transparent min-[640px]:p-0 min-[640px]:ring-0">
                {trust.map((item) => (
                  <li
                    key={item.id ?? item.text}
                    className="flex flex-col items-center gap-1.5 text-center text-xs font-bold leading-snug text-ink-2 min-[640px]:flex-row min-[640px]:gap-2.5 min-[640px]:text-left min-[640px]:text-sm"
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
          <ul className="mb-10 overflow-hidden rounded-[22px] border border-border bg-card min-[640px]:grid min-[640px]:grid-cols-2 min-[640px]:gap-4 min-[640px]:overflow-visible min-[640px]:rounded-none min-[640px]:border-0 min-[640px]:bg-transparent min-[1081px]:grid-cols-4">
            {intents.map((intent) => (
              <li
                key={intent.id ?? intent.title}
                className="border-b border-border last:border-b-0 min-[640px]:border-0"
              >
                <Link
                  href={intent.href}
                  className="group relative grid min-h-[72px] grid-cols-[44px_minmax(0,1fr)_20px] items-center gap-x-3 gap-y-1 p-3.5 active:bg-surface-2 min-[640px]:flex min-[640px]:h-full min-[640px]:flex-col min-[640px]:items-start min-[640px]:gap-3 min-[640px]:rounded-[22px] min-[640px]:border min-[640px]:border-border min-[640px]:bg-card min-[640px]:p-5 min-[640px]:shadow-raised"
                  data-card
                >
                  <span
                    aria-hidden="true"
                    data-card-icon
                    className="row-span-2 grid size-11 place-items-center rounded-[14px] bg-accent-soft text-accent-text transition-colors group-hover:bg-accent group-hover:text-accent-ink min-[640px]:size-13 min-[640px]:rounded-2xl"
                  >
                    {isIconName(intent.icon) && <Icon name={intent.icon} className="size-6" />}
                  </span>
                  <span
                    aria-hidden="true"
                    className="col-start-3 row-span-2 row-start-1 grid size-5 place-items-center text-ink-2 min-[640px]:absolute min-[640px]:right-3 min-[640px]:top-3 min-[640px]:size-8 min-[640px]:rounded-full min-[640px]:bg-surface-2 min-[640px]:text-ink"
                  >
                    <Icon name="arrow" strokeWidth={2.4} className="size-4" />
                  </span>
                  <b className="col-start-2 row-start-1 font-display text-[15.5px] font-extrabold leading-snug min-[640px]:text-lg">
                    {intent.title}
                  </b>
                  <span className="col-start-2 row-start-2 line-clamp-2 text-[13px] text-ink-2 min-[640px]:text-sm">
                    {intent.text}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  )
}
