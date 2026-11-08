import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { splitDots, splitTime } from '@/lib/biznes/textParts'
import { getCatalogIndex } from '@/lib/catalog/data'
import { wheelGroups } from '@/lib/catalog/groups'
import type { IconName } from '@/lib/catalog/options'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { BzHeroBlock as BzHeroBlockData } from '@/payload-types'

import { DepartmentWheel } from './DepartmentWheelLazy'
import { HeroSearch } from './HeroSearch'

type Props = { block: BzHeroBlockData; isFirst: boolean; tenantId: number }

/** „Oddzwaniamy w ciągu **60 minut**” (board): the time in bold. */
function Emphasis({ text }: { text: string }) {
  const parts = splitTime(text)
  if (!parts) return <>{text}</>
  const [before, time, after] = parts
  return (
    <>
      {before}
      <b className="font-extrabold text-ink">{time}</b>
      {after}
    </>
  )
}

/**
 * Hero of the Biznes home page (spec. §4 pkt 1, ZMIANY-v20 §2.1): H1 with a plain accent part
 * (no gradient, no glows — ADR-013), the wizard CTA, the line's phone, the callback promise and
 * the trust points; on the right the department wheel from the catalog. Below 768 px (board
 * App-Start): the text in a dark card with the search field; buttons, phone, trust points and
 * the wheel go — the quick start right under it takes their place.
 */
export async function BzHeroBlock({ block, isFirst, tenantId }: Props) {
  const [index, settings] = await Promise.all([
    getCatalogIndex(tenantId),
    getSiteSettings(tenantId),
  ])
  const groups = wheelGroups(index)
  const phone = block.showPhone ? (settings?.phone ?? null) : null
  const tel = phone ? toTelHref(phone) : null
  // Plan 0611 §7.1 pkt 9: the hero is one of the three places of the promise (with „Nasze
  // zobowiązania” and the form). The confirmed wording (D18, 01.11) stands in while the panel's
  // „Obietnice” is empty (decyzja Krystiana 08.11: zapas tylko w hero).
  const callback = settings?.biznes?.promises.callbackTime?.trim() || 'Oddzwaniamy w ciągu 60 minut'
  const trust = [
    // Board: each status on its own line (the panel keeps them in one, split by middle dots).
    ...splitDots(settings?.biznes?.trustLine ?? '').map((text, i) => ({
      id: `trust-${i}`,
      icon: (i === 0 ? 'shield' : 'star') as IconName,
      text,
    })),
    ...(block.trustItems ?? []),
  ]
  const Title = isFirst ? 'h1' : 'h2'

  return (
    <section id="start" className="relative overflow-hidden pt-4 pb-3 md:pt-10 md:pb-24">
      <Container
        wide
        className="relative grid items-center gap-7 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]"
      >
        <div className="flex flex-col gap-6 max-md:gap-3 max-md:rounded-[28px] max-md:bg-surface-dark max-md:bg-[radial-gradient(60%_50%_at_88%_8%,color-mix(in_srgb,var(--accent-on-dark)_32%,transparent),transparent_70%)] max-md:px-[22px] max-md:pt-[26px] max-md:pb-[22px] max-md:text-white">
          {block.pill && (
            <p className="inline-flex items-center gap-2 self-start text-sm font-bold text-ink-2 max-md:text-[13px] max-md:text-white/80">
              <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
              {block.pill}
            </p>
          )}
          <Title className="font-display text-[clamp(2.5rem,4.1vw,3.625rem)] max-md:text-[31px] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance font-stretch-112%">
            {block.heading}
            {block.headingAccent && (
              <>
                {' '}
                {/* v150 (K36 §1): the second sentence on its own line, smaller (board `.s4h1 em`). */}
                <span className="mt-3.5 block text-[0.56em] leading-[1.15] tracking-[-0.015em] text-h1-accent max-md:mt-2.5 max-md:text-[0.62em] max-md:text-accent-on-dark">
                  {block.headingAccent}
                </span>
              </>
            )}
          </Title>
          {block.lead && (
            <p className="max-w-[52ch] text-[clamp(1.0625rem,1.35vw,1.22rem)] leading-relaxed text-ink-2 max-md:text-[15.5px] max-md:text-white/80">
              {block.lead}
            </p>
          )}
          <HeroSearch className="flex min-h-[52px] w-full items-center gap-2.5 rounded-2xl bg-white/10 px-4 text-left text-[15.5px] font-semibold text-white/80 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c-white)_14%,transparent)] md:hidden" />
          <div className="flex flex-wrap gap-3 max-md:hidden">
            <a
              href={block.cta.href}
              className="inline-flex min-h-14 items-center gap-3 rounded-2xl bg-accent-text py-2.5 pr-6 pl-3 font-bold text-accent-ink transition-colors hover:bg-ink hover:text-surface"
            >
              <span
                aria-hidden="true"
                className="flex size-[34px] items-center justify-center rounded-[10px] bg-white/20"
              >
                <Icon name="clock" strokeWidth={2.2} />
              </span>
              {block.cta.label}
              <Icon name="arrow" strokeWidth={2.4} className="size-[18px]" />
            </a>
            {/* v150 (K36 §1): the whole offer with its count from the catalog. */}
            <Link
              href="/oferta"
              className="inline-flex min-h-14 items-center gap-2.5 rounded-2xl bg-card px-6 font-bold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] transition-colors hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]"
            >
              Przeglądaj ofertę · {index.products.length}
            </Link>
          </div>
          <p className="-mt-1 flex flex-wrap items-center max-md:hidden gap-x-4 gap-y-1 text-[15px] text-ink-2">
            {phone && tel && (
              <a
                href={tel}
                className="inline-flex min-h-11 items-center gap-2 font-display text-[17px] font-extrabold text-ink hover:text-accent-text"
              >
                <Icon name="phone" className="size-[18px] text-accent-text" />
                {phone}
              </a>
            )}
            {callback && (
              <span>
                <Emphasis text={callback} /> w godzinach pracy
              </span>
            )}
          </p>
          {trust.length > 0 && (
            <ul className="grid gap-x-6 gap-y-2.5 max-md:hidden border-t border-border pt-5 sm:grid-cols-[auto_auto] sm:justify-start">
              {trust.map((item, i) => (
                <li
                  key={item.id ?? i}
                  className="flex items-center gap-2.5 text-sm font-bold text-ink-2"
                >
                  <Icon name={item.icon} className="size-[17px] shrink-0 text-accent-text" />
                  {item.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {groups.length > 0 && (
          <div className="flex justify-center max-md:hidden">
            <DepartmentWheel
              groups={groups}
              hint={block.wheelHint}
              planLabel={block.planLinkLabel}
            />
          </div>
        )}
      </Container>
    </section>
  )
}
