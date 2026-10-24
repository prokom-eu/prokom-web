import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import type { BzPanelsBlock as BzPanelsBlockData } from '@/payload-types'

import { hasLink, PageLink } from '../../components/PageLink'

/**
 * Two panels side by side (plansza Gopos): a dark one with the main matter (switching from
 * another system) and a light one beside it (GoPOS + NFHotel).
 */
export function BzPanelsBlock({ block }: { block: BzPanelsBlockData }) {
  return (
    <section aria-label={block.panels.map((panel) => panel.title).join(', ')} className="py-6">
      <Container
        wide
        className={cx(
          'grid gap-4',
          block.panels.length > 1 && 'min-[1000px]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]',
        )}
      >
        {block.panels.map((panel, i) => {
          const dark = panel.style === 'dark'
          return (
            <div
              key={panel.id ?? i}
              data-surface={dark ? 'dark' : undefined}
              className={cx(
                'flex flex-col gap-4 rounded-[30px] p-7 sm:p-9',
                dark
                  ? 'bg-surface-dark bg-[radial-gradient(ellipse_at_0%_0%,color-mix(in_srgb,var(--tone-green)_30%,transparent),transparent_60%)] text-white'
                  : 'bg-surface-2',
              )}
            >
              {panel.eyebrow && (
                <p
                  className={cx(
                    'text-[13px] font-extrabold tracking-[0.08em] uppercase',
                    dark ? 'text-ok' : 'text-accent-text',
                  )}
                >
                  {panel.eyebrow}
                </p>
              )}
              <h2
                className={cx(
                  'font-display text-[clamp(1.6rem,2.4vw,2rem)] leading-tight font-extrabold',
                  !dark && 'text-ink',
                )}
              >
                {panel.title}
              </h2>
              <p className={cx('leading-relaxed', dark ? 'text-white/80' : 'text-ink-2')}>
                {panel.text}
              </p>
              {(hasLink(panel.primary) || hasLink(panel.secondary)) && (
                <div className="mt-auto flex flex-wrap gap-3 pt-2">
                  {hasLink(panel.primary) && (
                    <PageLink
                      href={panel.primary.href}
                      kind={dark ? 'light' : 'outline'}
                      arrow={dark}
                    >
                      {panel.primary.label}
                    </PageLink>
                  )}
                  {hasLink(panel.secondary) && (
                    <PageLink href={panel.secondary.href} kind={dark ? 'outlineDark' : 'outline'}>
                      {panel.secondary.label}
                    </PageLink>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </Container>
    </section>
  )
}
