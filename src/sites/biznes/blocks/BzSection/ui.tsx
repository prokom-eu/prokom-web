import Link from 'next/link'
import type { ReactNode } from 'react'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import type { SectionAction } from '@/lib/biznes/pages/sections'
import type { BzSectionBlock as BzSectionData } from '@/payload-types'

import type { Crumb } from '../../components/Breadcrumbs'

import { AddActionButton } from './AddActionButton'

// Whole class names, so Tailwind finds them.
export const BTN =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-[15.5px] font-extrabold transition-colors'
export const BTN_PRIMARY = cx(
  BTN,
  'bg-accent-text text-accent-ink shadow-[0_14px_30px_-16px_var(--accent-text)] hover:bg-ink hover:text-surface',
)
export const BTN_OUTLINE = cx(
  BTN,
  'bg-card text-ink shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink)]',
)
export const BTN_ON_DARK = cx(BTN, 'bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20')
export const CARD = 'rounded-[22px] bg-card shadow-[inset_0_0_0_1px_var(--border)]'
export const EYEBROW = 'text-[13px] font-extrabold tracking-[0.08em] uppercase'
export const H2 =
  'font-display text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.04] font-extrabold tracking-[-0.02em] font-stretch-110% text-balance'

const SURFACE: Record<BzSectionData['surface'], string> = {
  default: '',
  muted: 'bg-surface-2',
  dark: 'bg-surface-dark text-white',
}

/** Page breadcrumbs with the hero's middle items: Strona główna / …trail / page. */
export function withTrail(crumbs: readonly Crumb[], trail: readonly Crumb[]): Crumb[] {
  if (crumbs.length < 2) return [...crumbs]
  return [crumbs[0]!, ...trail, ...crumbs.slice(1)]
}

/** Section id: the panel's anchor, or one made from the block id (for `aria-labelledby`). */
export const sectionId = (block: BzSectionData) => block.anchor || `sekcja-${block.id ?? 'k4'}`

/** Heading with the accented second part („… <em>Jeden system.</em>”). */
export function HeadingText({ block }: { block: BzSectionData }) {
  return (
    <>
      {block.heading}
      {block.headingAccent && (
        <>
          {' '}
          <em className="text-accent-text not-italic">{block.headingAccent}</em>
        </>
      )}
    </>
  )
}

/**
 * Frame of a K4 section: background, page width, the head (label, H2, lead on the right) and the
 * source line under the content. `head={false}` when the kind lays out its own head.
 */
export function SectionShell({
  block,
  children,
  head = true,
  aside,
  className,
}: {
  block: BzSectionData
  children: ReactNode
  head?: boolean
  /** Next to the heading on the right (e.g. „bez cen — wycena na piśmie”). */
  aside?: ReactNode
  className?: string
}) {
  const id = sectionId(block)
  const dark = block.surface === 'dark'
  const labelled = head && Boolean(block.heading)
  return (
    <section
      id={id}
      aria-labelledby={labelled ? `${id}-h` : undefined}
      aria-label={labelled ? undefined : (block.eyebrow ?? undefined)}
      className={cx('scroll-mt-28 py-14 sm:py-20', SURFACE[block.surface], className)}
    >
      <Container wide>
        {head && (block.heading || block.eyebrow) && (
          <div className="mb-9 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div className="max-w-[46rem] min-w-0 grow basis-[34rem]">
              {block.eyebrow && (
                <p
                  className={cx(EYEBROW, 'mb-3', dark ? 'text-accent-on-dark' : 'text-accent-text')}
                >
                  {block.eyebrow}
                </p>
              )}
              {block.heading && (
                <h2 id={`${id}-h`} className={H2}>
                  <HeadingText block={block} />
                </h2>
              )}
            </div>
            {block.lead && (
              <p
                className={cx(
                  'max-w-[44ch] min-w-0 basis-[22rem] text-[1.0625rem] leading-relaxed text-pretty',
                  dark ? 'text-white/80' : 'text-ink-2',
                )}
              >
                {block.lead}
              </p>
            )}
            {aside}
          </div>
        )}
        {children}
        <SourceLine block={block} />
      </Container>
    </section>
  )
}

/** „Źródło: … · stan na …” — a link when the panel has the address (sources only with a link). */
export function SourceLine({ block, className }: { block: BzSectionData; className?: string }) {
  if (!block.source) return null
  const dark = block.surface === 'dark'
  return (
    <p
      className={cx(
        'mt-6 text-[13px] leading-relaxed',
        dark ? 'text-white/70' : 'text-ink-3',
        className,
      )}
    >
      {block.sourceUrl ? (
        <a
          href={block.sourceUrl}
          rel="noopener"
          target="_blank"
          className="underline-offset-2 hover:underline"
        >
          {block.source}
          <span className="sr-only"> (otwiera się w nowej karcie)</span>
        </a>
      ) : (
        block.source
      )}
    </p>
  )
}

/** Buttons of a section: links and „add to the inquiry”. */
export function SectionActions({
  actions,
  onDark = false,
  className,
}: {
  actions: readonly SectionAction[]
  onDark?: boolean
  className?: string
}) {
  if (actions.length === 0) return null
  return (
    <div className={cx('flex flex-wrap gap-3', className)}>
      {actions.map((action) => {
        const style = action.primary ? BTN_PRIMARY : onDark ? BTN_ON_DARK : BTN_OUTLINE
        if ('add' in action) {
          return (
            <AddActionButton
              key={action.label}
              slug={action.add}
              label={action.label}
              note={action.note}
              className={style}
            />
          )
        }
        const external = /^https?:/.test(action.href)
        return external || /^(tel|mailto):/.test(action.href) ? (
          <a key={action.label} href={action.href} className={style}>
            {action.label}
          </a>
        ) : (
          <Link key={action.label} href={action.href} className={style}>
            {action.label}
          </Link>
        )
      })}
    </div>
  )
}
