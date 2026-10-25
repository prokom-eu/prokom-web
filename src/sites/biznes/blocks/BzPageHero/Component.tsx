import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { withYears } from '@/lib/biznes/years'
import type { BzPageHeroBlock as BzPageHeroBlockData } from '@/payload-types'

import { Breadcrumbs, type Crumb } from '../../components/Breadcrumbs'
import { hasLink, PageLink } from '../../components/PageLink'
import { PhotoHero } from './PhotoHero'
import { ScreenHero } from './ScreenHero'

type Props = {
  block: BzPageHeroBlockData
  /** First block: it carries the page's H1 and the breadcrumbs. */
  isFirst: boolean
  page: { title: string; slug: string }
  tenantId: number
}

/**
 * Hero of a Biznes subpage (spec. §6.4 pkt 1, plansza Dzial): breadcrumbs, the label with a dot,
 * H1 with a plain accent part (ADR-013), lead, two buttons and chips; on the right the dark
 * „Jak to działa” card with numbered points, or four figures in cards (`stats`, O firmie) — or, as
 * `photo` (GoPOS), the navy hero over a photo.
 */
export function BzPageHeroBlock({ block, isFirst, page, tenantId }: Props) {
  const Title = isFirst ? 'h1' : 'h2'
  const crumbs: Crumb[] = [
    { name: 'Strona główna', href: '/' },
    ...(hasLink(block.parent) ? [{ name: block.parent.label, href: block.parent.href }] : []),
    { name: page.title, href: `/${page.slug}` },
  ]
  if (block.variant === 'photo') {
    return <PhotoHero block={block} isFirst={isFirst} crumbs={crumbs} tenantId={tenantId} />
  }
  if (block.variant === 'screen') {
    return <ScreenHero block={block} isFirst={isFirst} crumbs={crumbs} tenantId={tenantId} />
  }
  const card = block.variant === 'card' ? block.card : null
  const steps = card?.steps ?? []
  const figures = block.variant === 'stats' ? (block.figures ?? []) : []

  return (
    <section className="relative overflow-hidden pt-6 pb-16 sm:pt-8 sm:pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,var(--grid)_1px,transparent_1.2px)] [mask-image:radial-gradient(ellipse_at_80%_30%,black,transparent_70%)] bg-size-[26px_26px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_90%_10%,var(--glow),transparent_60%)]"
      />
      <Container wide className="relative">
        {isFirst && (
          <div className="mb-8">
            <Breadcrumbs items={crumbs} />
          </div>
        )}
        {/* `stats` (board OFirmie): a wider text column and a slightly smaller H1, as drawn. */}
        <div
          className={cx(
            'grid items-center gap-10',
            figures.length > 0
              ? 'min-[1080px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] min-[1080px]:gap-14'
              : 'min-[1080px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]',
          )}
        >
          <div className="flex flex-col gap-6">
            {block.pill && (
              <p className="inline-flex items-center gap-2.5 self-start text-[15px] font-bold text-ink">
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full bg-ok shadow-[0_0_0_4px_color-mix(in_srgb,var(--ok)_25%,transparent)] motion-safe:animate-pulse"
                />
                {block.pill}
              </p>
            )}
            <Title
              className={cx(
                'font-display leading-[0.95] font-extrabold tracking-[-0.025em] font-stretch-112%',
                figures.length > 0
                  ? 'text-[clamp(2.6rem,5.2vw,4.8rem)]'
                  : 'text-[clamp(2.6rem,5.6vw,5.1rem)]',
              )}
            >
              {withYears(block.heading, block.sinceYear, new Date())}
              {block.headingAccent && (
                <>
                  {' '}
                  <span className="text-h1-accent">{block.headingAccent}</span>
                </>
              )}
            </Title>
            {block.lead && (
              <p className="max-w-[54ch] text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-relaxed text-ink-2">
                {block.lead}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <PageLink href={block.primary.href} arrow>
                {block.primary.label}
              </PageLink>
              {hasLink(block.secondary) && (
                <PageLink href={block.secondary.href} kind="outline">
                  {block.secondary.label}
                </PageLink>
              )}
            </div>
            {block.chips && block.chips.length > 0 && (
              <ul className="flex flex-wrap gap-2.5">
                {block.chips.map((chip, i) => (
                  <li
                    key={chip.id ?? i}
                    className="rounded-xl bg-surface-2 px-3 py-2 text-sm font-bold text-ink-2"
                  >
                    {chip.text}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {figures.length > 0 && (
            <ul className="grid grid-cols-2 gap-3.5">
              {figures.map((figure, i) => (
                <li
                  key={figure.id ?? i}
                  className="flex flex-col gap-2 rounded-[26px] bg-card p-5 shadow-[inset_0_0_0_1px_var(--border),0_24px_48px_-32px_var(--glow)] sm:p-7"
                >
                  <span className="font-display text-[clamp(2.2rem,4vw,3.4rem)] leading-none font-extrabold text-accent-text font-stretch-112%">
                    {figure.value}
                  </span>
                  <span className="text-[15px] leading-snug text-ink-2">{figure.label}</span>
                </li>
              ))}
            </ul>
          )}

          {card && (card.title || steps.length > 0) && (
            <div
              data-surface="dark"
              className="rounded-[30px] bg-surface-dark p-6 text-white shadow-[0_40px_80px_-40px_var(--glow)] sm:p-8"
            >
              {card.eyebrow && (
                <p className="text-[13px] font-extrabold tracking-[0.08em] text-accent-on-dark uppercase">
                  {card.eyebrow}
                </p>
              )}
              {card.title && (
                <p className="mt-2 font-display text-[clamp(1.5rem,2.2vw,1.85rem)] leading-[1.05] font-extrabold">
                  {card.title}
                </p>
              )}
              {steps.length > 0 && (
                <ol className="mt-5 flex flex-col gap-3.5 text-[15px] leading-relaxed text-white/80">
                  {steps.map((step, i) => (
                    <li key={step.id ?? i}>
                      <b className="font-bold text-white">
                        {i + 1}. {step.title}
                      </b>{' '}
                      — {step.text}
                    </li>
                  ))}
                </ol>
              )}
              {hasLink(card.button) && (
                <PageLink href={card.button.href} kind="light" className="mt-6 w-full">
                  {card.button.label}
                </PageLink>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
